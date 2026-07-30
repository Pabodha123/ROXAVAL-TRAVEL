const { Document, Customer } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
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
  const meta = await features.getMeta(Document, {});
  new ApiResponse(200, docs, 'Documents fetched', meta).send(res);
});

const getMyDocuments = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  const features = new ApiFeatures(Document.find({ customer: customer._id }), req.query).filter().sort().paginate();
  const docs = await features.query.populate('booking', 'bookingReference');
  const meta = await features.getMeta(Document, { customer: customer._id });
  new ApiResponse(200, docs, 'Your documents', meta).send(res);
});

module.exports = {
  generateItinerary,
  generateBookingConfirmation,
  generateInvoice,
  generatePaymentReceipt,
  generateQuotation,
  getAllDocuments,
  getMyDocuments,
};
