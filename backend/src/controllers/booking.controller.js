const { Booking, Customer } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const bookingService = require('../services/booking.service');
const { localizeDoc, localizeList } = require('../utils/localize');

// `tourPackage` is populated as the full TourPackage document here (no
// field-select string), so its own {en,de,fr} fields need flattening the
// same way tourPackage.controller.js does — otherwise React crashes trying
// to render the raw object on My Tours / admin booking screens.
const translatableFields = [
  'tourPackage.name',
  'tourPackage.description',
  'tourPackage.highlights',
  'tourPackage.includedServices',
  'tourPackage.excludedServices',
  'tourPackage.itinerary.title',
  'tourPackage.itinerary.description',
];

const createFromPackage = catchAsync(async (req, res) => {
  const booking = await bookingService.createFromPackage(req.user._id, req.body);
  new ApiResponse(201, booking, 'Booking created. Please proceed to payment.').send(res);
});

const createFromItinerary = catchAsync(async (req, res) => {
  const booking = await bookingService.createFromItinerary(req.user._id, {
    itineraryId: req.body.itinerary,
    travelDate: req.body.travelDate,
    travelers: req.body.travelers,
    specialRequests: req.body.specialRequests,
  });
  new ApiResponse(201, booking, 'Booking created. Please proceed to payment.').send(res);
});

// Customer: My Tours dashboard
const getMyBookings = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  const features = new ApiFeatures(Booking.find({ customer: customer._id }), req.query).filter().sort().paginate();
  const docs = await features.query.populate('tourPackage').populate('itinerary');
  const meta = await features.getMeta(Booking);
  const data = localizeList(docs, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Your bookings', meta).send(res);
});

const getMyBookingById = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  const booking = await Booking.findOne({ _id: req.params.id, customer: customer._id })
    .populate('tourPackage')
    .populate('itinerary');
  if (!booking) throw ApiError.notFound('Booking not found');
  const data = localizeDoc(booking, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Booking fetched').send(res);
});

// Admin: full booking management
const getAllBookings = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Booking.find(), req.query).search(['bookingReference']).filter().sort().paginate();
  const docs = await features.query
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email phone' } })
    .populate('tourPackage')
    .populate('itinerary');
  const meta = await features.getMeta(Booking);
  const data = localizeList(docs, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Bookings fetched', meta).send(res);
});

const getBookingById = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email phone' } })
    .populate('tourPackage')
    .populate('itinerary');
  if (!booking) throw ApiError.notFound('Booking not found');
  const data = localizeDoc(booking, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Booking fetched').send(res);
});

const updateStatus = catchAsync(async (req, res) => {
  const booking = await bookingService.updateStatus(req.params.id, req.body.status, req.body.note, req.user._id);
  new ApiResponse(200, booking, `Booking status updated to ${booking.status}`).send(res);
});

module.exports = {
  createFromPackage,
  createFromItinerary,
  getMyBookings,
  getMyBookingById,
  getAllBookings,
  getBookingById,
  updateStatus,
};
