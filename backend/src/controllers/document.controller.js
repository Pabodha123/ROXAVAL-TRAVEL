const { Document, Customer } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const documentService = require('../services/document.service');

const generateItinerary = catchAsync(async (req, res) => {
  const doc = await documentService.generateItineraryDocument(req.params.bookingId, req.user._id);
  new ApiResponse(201, doc, 'Itinerary document generated').send(res);
});

const generateBookingConfirmation = catchAsync(async (req, res) => {
  const doc = await documentService.generateBookingConfirmation(req.params.bookingId, req.user._id);
  new ApiResponse(201, doc, 'Booking confirmation generated').send(res);
});

const generateInvoice = catchAsync(async (req, res) => {
  const doc = await documentService.generateInvoice(req.params.bookingId, req.user._id);
  new ApiResponse(201, doc, 'Invoice generated').send(res);
});

const generatePaymentReceipt = catchAsync(async (req, res) => {
  const doc = await documentService.generatePaymentReceipt(req.params.paymentId, req.user._id);
  new ApiResponse(201, doc, 'Payment receipt generated').send(res);
});

const generateQuotation = catchAsync(async (req, res) => {
  const doc = await documentService.generateQuotation(req.params.itineraryId, req.user._id);
  new ApiResponse(201, doc, 'Quotation generated').send(res);
});

const getAllDocuments = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Document.find(), req.query).search(['referenceNumber', 'fileName']).filter().sort().paginate();
  const docs = await features.query.populate('booking', 'bookingReference');
  const meta = await features.getMeta(Document);
  new ApiResponse(200, docs, 'Documents fetched', meta).send(res);
});

const getMyDocuments = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  // Hotel vouchers are an operational document between Roxaval and the
  // hotel/customer, sent out deliberately by an admin (Email Hotel/Email
  // Customer) rather than something a customer self-serves from their
  // dashboard, so they're excluded from this list.
  const features = new ApiFeatures(Document.find({ customer: customer._id, type: { $ne: 'hotel_voucher' } }), req.query)
    .filter()
    .sort()
    .paginate();
  const docs = await features.query.populate('booking', 'bookingReference');
  const meta = await features.getMeta(Document);
  new ApiResponse(200, docs, 'Your documents', meta).send(res);
});

// Streams a generated PDF back through our own origin with correct
// headers, rather than letting the client hit the storage URL directly.
// Cloudinary's account-level security policy blocks direct delivery of
// any asset it recognizes as a PDF, which is why these are stored without
// a .pdf-suffixed id in the first place (see document.service.js) - that
// keeps storage reachable, but leaves the raw URL served with a generic
// content-type that browsers won't reliably render as a PDF. Proxying
// through here lets us set Content-Type/Content-Disposition correctly,
// and doubles as the access-control boundary (a customer may only open
// their own non-voucher documents).
const viewFile = catchAsync(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Document not found.');

  if (req.user.role === 'customer') {
    const customer = await Customer.findOne({ user: req.user._id });
    const owns = customer && String(doc.customer) === String(customer._id);
    if (!owns || doc.type === 'hotel_voucher') throw ApiError.forbidden('You do not have access to this document.');
  }

  const upstream = await fetch(doc.fileUrl);
  if (!upstream.ok) throw ApiError.notFound('The file for this document could not be found.');
  const buffer = Buffer.from(await upstream.arrayBuffer());

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
  res.send(buffer);
});

module.exports = {
  generateItinerary,
  generateBookingConfirmation,
  generateInvoice,
  generatePaymentReceipt,
  generateQuotation,
  getAllDocuments,
  getMyDocuments,
  viewFile,
};
