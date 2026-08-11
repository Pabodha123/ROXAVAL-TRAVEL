const { Payment, Booking, Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const { buildWhatsAppPaymentLink } = require('../utils/whatsapp');
const { notify, notifyAllAdmins } = require('./notification.service');

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

  const payment = await Payment.create({
    booking: booking._id,
    customer: customer._id,
    method: payload.method,
    paymentType: payload.paymentType,
    amount: payload.amount,
    currency: payload.currency || booking.pricing.currency,
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
      travelDate: booking.travelDate.toDateString(),
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

  payment.status = status;
  payment.verifiedBy = adminId;
  payment.verifiedAt = new Date();
  payment.verificationNote = verificationNote || '';
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.status = status === 'Verified' ? 'Confirmed' : 'Payment Pending';
    booking.statusHistory.push({
      status: booking.status,
      note: status === 'Verified' ? 'Payment verified by admin' : `Payment rejected: ${verificationNote || ''}`,
    });
    await booking.save();
  }

  const customer = await Customer.findById(payment.customer).populate('user');
  if (customer?.user) {
    await notify({
      recipient: customer.user._id,
      type: 'payment_verified',
      title: status === 'Verified' ? 'Payment Verified' : 'Payment Rejected',
      message:
        status === 'Verified'
          ? `Your payment for booking ${booking?.bookingReference} has been verified. Your booking is now confirmed!`
          : `Your payment for booking ${booking?.bookingReference} could not be verified. ${verificationNote || ''}`,
      link: `/my-tours/bookings/${payment.booking}`,
      relatedModel: 'Booking',
      relatedId: payment.booking,
    });
  }

  return payment;
};

module.exports = { createPayment, attachReceipt, verifyPayment };
