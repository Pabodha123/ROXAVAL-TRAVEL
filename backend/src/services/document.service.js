const { Document, Booking, Payment } = require('../models');
const ApiError = require('../utils/ApiError');
const { generatePdfDocument } = require('../utils/pdfGenerator');
const { uploadBuffer } = require('../config/cloudinary');
const { notify } = require('./notification.service');
const generateReference = require('../utils/generateReference');
const { localizeValue } = require('../utils/localize');
const { t } = require('../i18n/strings');
const { formatDate } = require('../utils/dateFormat');

// `days` here can come from a TourPackage (title is now `{en,de,fr}`) or a
// customer Itinerary (title is still a plain string) — normalize both.
const displayText = (val) => localizeValue(val, 'en') || '';

const loadBookingContext = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email phone' } })
    .populate('tourPackage')
    .populate({
      path: 'itinerary',
      populate: [{ path: 'hotels' }, { path: 'days.hotel' }],
    });
  if (!booking) throw ApiError.notFound('Booking not found.');
  return booking;
};

/**
 * Generates a Travel Itinerary PDF for a booking (package or customized).
 */
const generateItineraryDocument = async (bookingId, generatedBy) => {
  const booking = await loadBookingContext(bookingId);
  const customerUser = booking.customer.user;
  const lang = booking.customer.preferredLanguage || 'en';
  const s = t(lang, 'pdf');

  const days = booking.sourceType === 'customized' ? booking.itinerary?.days || [] : booking.tourPackage?.itinerary || [];

  const tableColumns = [
    { key: 'dayNumber', label: s.day, width: 40 },
    { key: 'title', label: s.title, width: 150 },
    { key: 'meals', label: s.meals, width: 100 },
    { key: 'hotel', label: s.hotel, width: 225 },
  ];
  const tableRows = days.map((d) => ({
    dayNumber: d.dayNumber,
    title: displayText(d.title),
    meals: (d.meals || []).join(', '),
    hotel: displayText(d.hotel?.name) || '-',
  }));

  const fileName = `itinerary-${booking.bookingReference}-${Date.now()}.pdf`;
  const buffer = await generatePdfDocument(
    'itinerary',
    {
      referenceNumber: booking.bookingReference,
      customerName: customerUser.fullName,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      packageName: displayText(booking.tourPackage?.name) || displayText(booking.itinerary?.title),
      travelDate: formatDate(booking.travelDate),
      tableColumns,
      tableRows,
      notes: 'Itinerary is subject to minor changes due to weather or local conditions.',
    },
    lang
  );

  return saveDocumentRecord({
    type: 'itinerary',
    referenceNumber: booking.bookingReference,
    booking: booking._id,
    customer: booking.customer._id,
    buffer,
    fileName,
    generatedBy,
    notifyUser: customerUser._id,
    notifyMessage: `Your travel itinerary for booking ${booking.bookingReference} is ready to download.`,
  });
};

const generateBookingConfirmation = async (bookingId, generatedBy) => {
  const booking = await loadBookingContext(bookingId);
  const customerUser = booking.customer.user;
  const lang = booking.customer.preferredLanguage || 'en';

  const fileName = `confirmation-${booking.bookingReference}-${Date.now()}.pdf`;
  const buffer = await generatePdfDocument(
    'booking_confirmation',
    {
      referenceNumber: booking.bookingReference,
      customerName: customerUser.fullName,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      packageName: displayText(booking.tourPackage?.name) || displayText(booking.itinerary?.title),
      travelDate: formatDate(booking.travelDate),
      amountSummary: {
        'Total Amount': `${booking.pricing.currency} ${booking.pricing.totalAmount}`,
        'Advance Paid': `${booking.pricing.currency} ${booking.pricing.advanceAmount}`,
        'Balance Due': `${booking.pricing.currency} ${booking.pricing.balanceAmount}`,
      },
      notes: 'This confirms your booking with Roxaval Travels. Thank you for choosing us!',
    },
    lang
  );

  return saveDocumentRecord({
    type: 'booking_confirmation',
    referenceNumber: booking.bookingReference,
    booking: booking._id,
    customer: booking.customer._id,
    buffer,
    fileName,
    generatedBy,
    notifyUser: customerUser._id,
    notifyMessage: `Your booking confirmation for ${booking.bookingReference} is ready.`,
  });
};

const generateInvoice = async (bookingId, generatedBy) => {
  const booking = await loadBookingContext(bookingId);
  const customerUser = booking.customer.user;
  const lang = booking.customer.preferredLanguage || 'en';
  const invoiceRef = generateReference('INV');

  const fileName = `invoice-${invoiceRef}-${Date.now()}.pdf`;
  const buffer = await generatePdfDocument(
    'invoice',
    {
      referenceNumber: invoiceRef,
      customerName: customerUser.fullName,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      packageName: displayText(booking.tourPackage?.name) || displayText(booking.itinerary?.title),
      travelDate: formatDate(booking.travelDate),
      amountSummary: {
        Subtotal: `${booking.pricing.currency} ${booking.pricing.subtotal}`,
        Discount: `${booking.pricing.currency} ${booking.pricing.discount}`,
        'Total Due': `${booking.pricing.currency} ${booking.pricing.totalAmount}`,
      },
      notes: 'Payment due as per the agreed schedule. Bank details available on request.',
    },
    lang
  );

  return saveDocumentRecord({
    type: 'invoice',
    referenceNumber: invoiceRef,
    booking: booking._id,
    customer: booking.customer._id,
    buffer,
    fileName,
    generatedBy,
  });
};

const generatePaymentReceipt = async (paymentId, generatedBy) => {
  const payment = await Payment.findById(paymentId).populate({
    path: 'customer',
    populate: { path: 'user', select: 'fullName email phone' },
  });
  if (!payment) throw ApiError.notFound('Payment not found.');
  const lang = payment.customer.preferredLanguage || 'en';

  const fileName = `receipt-${payment.paymentReference}-${Date.now()}.pdf`;
  const buffer = await generatePdfDocument(
    'payment_receipt',
    {
      referenceNumber: payment.paymentReference,
      customerName: payment.customer.user.fullName,
      customerEmail: payment.customer.user.email,
      customerPhone: payment.customer.user.phone,
      amountSummary: {
        'Amount Paid': `${payment.currency} ${payment.amount}`,
        Method: payment.method,
        Status: payment.status,
      },
      notes: 'Thank you for your payment.',
    },
    lang
  );

  return saveDocumentRecord({
    type: 'payment_receipt',
    referenceNumber: payment.paymentReference,
    booking: payment.booking,
    customer: payment.customer._id,
    buffer,
    fileName,
    generatedBy,
  });
};

const generateQuotation = async (itineraryId, generatedBy) => {
  const { Itinerary } = require('../models');
  const itinerary = await Itinerary.findById(itineraryId).populate({
    path: 'customer',
    populate: { path: 'user', select: 'fullName email phone' },
  });
  if (!itinerary) throw ApiError.notFound('Itinerary not found.');
  const lang = itinerary.customer.preferredLanguage || 'en';
  const quoteRef = generateReference('QUO');

  const fileName = `quotation-${quoteRef}-${Date.now()}.pdf`;
  const buffer = await generatePdfDocument(
    'quotation',
    {
      referenceNumber: quoteRef,
      customerName: itinerary.customer.user.fullName,
      customerEmail: itinerary.customer.user.email,
      customerPhone: itinerary.customer.user.phone,
      packageName: displayText(itinerary.title),
      amountSummary: {
        'Base Price': `${itinerary.pricing.currency} ${itinerary.pricing.basePrice}`,
        Discount: `${itinerary.pricing.currency} ${itinerary.pricing.discount}`,
        'Total Price': `${itinerary.pricing.currency} ${itinerary.pricing.totalPrice}`,
      },
      notes: itinerary.customerFacingNotes || 'This quotation is valid for 14 days from the date of issue.',
    },
    lang
  );

  return saveDocumentRecord({
    type: 'quotation',
    referenceNumber: quoteRef,
    customer: itinerary.customer._id,
    buffer,
    fileName,
    generatedBy,
  });
};

async function saveDocumentRecord({ type, referenceNumber, booking, customer, hotel, buffer, fileName, generatedBy, notifyUser, notifyMessage }) {
  // 'raw', not 'auto'/'image', and the .pdf suffix is stripped from the
  // public_id — see hotelVoucher.service.js#renderAndSavePdf.
  const uploaded = await uploadBuffer(buffer, { folder: 'documents', resourceType: 'raw', publicId: fileName.replace(/\.pdf$/i, '') });
  const fileUrl = uploaded.secure_url;
  const doc = await Document.create({
    type,
    referenceNumber,
    booking,
    customer,
    hotel,
    fileUrl,
    fileName,
    generatedBy,
  });

  if (notifyUser) {
    await notify({
      recipient: notifyUser,
      type: 'document_ready',
      title: 'Document Ready',
      message: notifyMessage || `A new document (${type}) is ready to download.`,
      link: fileUrl,
      relatedModel: 'Document',
      relatedId: doc._id,
    });
  }

  return doc;
}

module.exports = {
  generateItineraryDocument,
  generateBookingConfirmation,
  generateInvoice,
  generatePaymentReceipt,
  generateQuotation,
};
