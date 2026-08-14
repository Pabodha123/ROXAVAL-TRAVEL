const { Payment, Booking, Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const { buildWhatsAppPaymentLink } = require('../utils/whatsapp');
const { notify, notifyAllAdmins } = require('./notification.service');
const { formatDate } = require('../utils/dateFormat');

/**
 * Records a payment attempt against a booking. For 'whatsapp' method this
 * also returns a pre-filled wa.me link the frontend can open/redirect to.
 * For 'bank_transfer' the receipt is attached separately via
 * attachReceipt() once the customer uploads proof of payment.
 */
const createPayment = async (customerUserId, payload) => {
  const customer = await Customer.findOne({ user: customerUserId });
  if (!customer) throw ApiError.notFound('Customer profile not found.');

  const booking = await Booking.findOne({ _id: payload.booking, customer: customer._id }).populate({
    path: 'tourPackage',
    select: 'name',
  });
  if (!booking) throw ApiError.notFound('Booking not found for this customer.');

  // Only a booking actually awaiting payment can receive one - blocks
  // paying against a Cancelled/not-yet-approved booking via a direct API
  // call (the frontend already only ever shows Pay Now in this state, but
  // that's not enforcement).
  if (booking.status !== 'Payment Pending') {
    throw ApiError.badRequest(`This booking is not awaiting payment (current status: '${booking.status}').`);
  }

  // Count what's already been claimed (verified, or submitted and awaiting
  // verification) so a customer can't stack multiple payments that together
  // over- or under-shoot what's actually owed.
  const priorPayments = await Payment.find({ booking: booking._id, status: { $in: ['Submitted', 'Verified'] } });
  const amountClaimed = priorPayments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.round((booking.pricing.totalAmount - amountClaimed) * 100) / 100;

  // Block a second submission while a prior one is still awaiting admin
  // review - covers double-clicking Submit / a retried request, which
  // would otherwise create two ambiguous claims against the same balance.
  // Bank transfer / WhatsApp already move the booking out of 'Payment
  // Pending' on submission (caught above), but a gateway ('card') payment
  // stays 'Pending' until the webhook resolves it, so it needs its own check.
  const hasOutstanding = await Payment.exists({ booking: booking._id, status: { $in: ['Submitted', 'Pending'] } });
  if (hasOutstanding) {
    throw ApiError.badRequest('A payment for this booking is already submitted and awaiting verification. Please wait for it to be reviewed before submitting another.');
  }

  const minimumRequired = payload.paymentType === 'advance' ? Math.min(booking.pricing.advanceAmount, Math.max(remaining, 0)) : Math.max(remaining, 0);
  if (payload.amount < minimumRequired - 0.01) {
    throw ApiError.badRequest(
      `A '${payload.paymentType}' payment for this booking must be at least ${booking.pricing.currency} ${minimumRequired.toLocaleString()}.`
    );
  }
  if (amountClaimed + payload.amount > booking.pricing.totalAmount + 0.01) {
    throw ApiError.badRequest(
      `This payment would exceed the total owed. Remaining balance: ${booking.pricing.currency} ${Math.max(remaining, 0).toLocaleString()}.`
    );
  }

  const payment = await Payment.create({
    booking: booking._id,
    customer: customer._id,
    method: payload.method,
    paymentType: payload.paymentType,
    amount: payload.amount,
    // Always the booking's own currency - never a client-supplied one.
    // There's no legitimate case where a payment's currency should differ
    // from what the booking was actually priced in.
    currency: booking.pricing.currency,
    bankReference: payload.bankReference,
    status: payload.method === 'card' ? 'Pending' : 'Submitted',
  });

  let whatsappLink;
  if (payload.method === 'whatsapp') {
    payment.whatsappLinkSentAt = new Date();
    await payment.save();
    whatsappLink = buildWhatsAppPaymentLink({
      bookingReference: booking.bookingReference,
      customerName: customerUserId.fullName || 'Customer',
      packageName: booking.tourPackage?.name?.en || 'Customized Tour',
      travelDate: formatDate(booking.travelDate),
      totalAmount: booking.pricing.totalAmount,
      advanceAmount: booking.pricing.advanceAmount,
      currency: booking.pricing.currency,
    });
  }

  if (payload.method !== 'card') {
    booking.status = 'Payment Verification';
    booking.statusHistory.push({ status: 'Payment Verification', note: `Payment submitted via ${payload.method}` });
    await booking.save();
  }

  await notifyAllAdmins({
    type: 'payment_submitted',
    title: `Payment Received — ${customerUserId.fullName || 'A customer'}`,
    message: `${customerUserId.fullName || 'A customer'} submitted a ${payload.paymentType} payment of ${payment.currency} ${payment.amount.toLocaleString()} for booking ${booking.bookingReference}.`,
    link: `/admin/payments`,
    relatedModel: 'Booking',
    relatedId: booking._id,
  });

  return { payment, whatsappLink };
};

/**
 * Attaches an uploaded receipt file (from multer) to a pending payment.
 */
const attachReceipt = async (paymentId, fileUrl) => {
  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    { receiptUrl: fileUrl, status: 'Submitted' },
    { new: true }
  );
  if (!payment) throw ApiError.notFound('Payment not found.');
  return payment;
};

/**
 * Admin manually verifies (or rejects) a payment after checking the
 * uploaded receipt / bank statement.
 */
const verifyPayment = async (paymentId, adminId, { status, verificationNote }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found.');

  const wasAlreadyVerified = payment.status === 'Verified';
  payment.status = status;
  payment.verifiedBy = adminId;
  payment.verifiedAt = new Date();
  payment.verificationNote = verificationNote || '';
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  let fullyPaid = false;
  if (booking) {
    // Only add to the running total the first time this specific payment is
    // verified — re-verifying an already-verified payment (or rejecting one)
    // must never double-count or subtract.
    if (status === 'Verified' && !wasAlreadyVerified) {
      booking.pricing.amountPaid = Math.round(((booking.pricing.amountPaid || 0) + payment.amount) * 100) / 100;
    }
    fullyPaid = booking.pricing.amountPaid >= booking.pricing.totalAmount - 0.01;

    booking.status = status === 'Verified' ? 'Confirmed' : 'Payment Pending';
    booking.statusHistory.push({
      status: booking.status,
      note: status === 'Verified' ?
        `Payment verified by admin (${booking.pricing.currency} ${booking.pricing.amountPaid.toLocaleString()} of ${booking.pricing.totalAmount.toLocaleString()} paid${fullyPaid ? ' — paid in full' : ''})` :
        `Payment rejected: ${verificationNote || ''}`,
    });
    await booking.save();
  }

  const remaining = booking ? Math.max(Math.round((booking.pricing.totalAmount - booking.pricing.amountPaid) * 100) / 100, 0) : 0;
  const customer = await Customer.findById(payment.customer).populate('user');
  if (customer?.user) {
    await notify({
      recipient: customer.user._id,
      type: 'payment_verified',
      title: status === 'Verified' ? 'Payment Verified' : 'Payment Rejected',
      message:
        status === 'Verified' ?
        fullyPaid ?
        `Your payment for booking ${booking?.bookingReference} has been verified. You've paid in full — your booking is confirmed!` :
        `Your payment for booking ${booking?.bookingReference} has been verified. Your booking is confirmed. Remaining balance: ${booking?.pricing.currency} ${remaining.toLocaleString()}.` :
        `Your payment for booking ${booking?.bookingReference} could not be verified. ${verificationNote || ''}`,
      link: `/my-tours/bookings/${payment.booking}`,
      relatedModel: 'Booking',
      relatedId: payment.booking,
    });
  }

  return payment;
};

module.exports = { createPayment, attachReceipt, verifyPayment };
