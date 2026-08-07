const { Payment, Customer } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const paymentService = require('../services/payment.service');
const { uploadBuffer } = require('../config/cloudinary');

const createPayment = catchAsync(async (req, res) => {
  const { payment, whatsappLink } = await paymentService.createPayment(req.user, req.body);
  new ApiResponse(201, { payment, whatsappLink }, 'Payment recorded').send(res);
});

// Customer uploads a payment receipt (bank transfer proof) — image or PDF,
// so resourceType 'auto' lets Cloudinary pick the right storage type.
const uploadReceipt = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Receipt file is required');
  const result = await uploadBuffer(req.file.buffer, { folder: 'receipts', resourceType: 'auto' });
  const payment = await paymentService.attachReceipt(req.params.id, result.secure_url);
  new ApiResponse(200, payment, 'Receipt uploaded and pending verification').send(res);
});

const getMyPayments = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  const features = new ApiFeatures(Payment.find({ customer: customer._id }), req.query).filter().sort().paginate();
  const docs = await features.query.populate('booking', 'bookingReference status');
  const meta = await features.getMeta(Payment, { customer: customer._id });
  new ApiResponse(200, docs, 'Your payments', meta).send(res);
});

// Admin: payment verification queue
const getAllPayments = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Payment.find(), req.query).search(['paymentReference', 'bankReference']).filter().sort().paginate();
  const docs = await features.query
    .populate('booking', 'bookingReference status pricing')
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email' } });
  const meta = await features.getMeta(Payment, {});
  new ApiResponse(200, docs, 'Payments fetched', meta).send(res);
});

const verifyPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.verifyPayment(req.params.id, req.user._id, req.body);
  new ApiResponse(200, payment, `Payment ${req.body.status.toLowerCase()}`).send(res);
});

module.exports = { createPayment, uploadReceipt, getMyPayments, getAllPayments, verifyPayment };
