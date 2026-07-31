const { CustomTourRequest, Customer, Admin } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const customTourService = require('../services/customTour.service');
const aiService = require('../services/ai.service');
const { localizeDoc, localizeList } = require('../utils/localize');

// Every populated Destination/Activity/Hotel ref below only selects `name`
// (a {en,de,fr} field) — none of it is localized by the populate() call
// itself, so it has to be flattened here or React crashes rendering it.
const translatableFields = [
  'preferredDestinations.name',
  'preferredActivities.name',
  'itinerary.days.destinations.name',
  'itinerary.days.activities.name',
  'itinerary.days.hotel.name',
  'itinerary.hotels.name',
  'aiGeneratedItinerary.days.destinations.name',
  'aiGeneratedItinerary.days.activities.name',
  'aiGeneratedItinerary.days.hotel.name',
];

// Deep-populates the day-level refs inside an Itinerary subdocument array —
// a plain `.populate('itinerary')` only resolves the top-level doc, leaving
// each day's hotel/tourGuide/vehicle/destinations/activities as raw ids.
const populateItinerary = {
  path: 'itinerary',
  populate: [
    { path: 'days.destinations', select: 'name' },
    { path: 'days.activities', select: 'name' },
    { path: 'days.hotel', select: 'name category starRating' },
    { path: 'days.tourGuide', select: 'name' },
    { path: 'days.vehicle', select: 'name type' },
    { path: 'hotels', select: 'name category starRating' },
    { path: 'versionHistory.changedBy', populate: { path: 'user', select: 'fullName' } },
  ],
};

// Customer: generate an AI draft itinerary from in-progress wizard preferences (not persisted)
const generateItinerary = catchAsync(async (req, res) => {
  const draft = await aiService.generateDraftItinerary(req.body);
  new ApiResponse(200, draft, 'Draft itinerary generated').send(res);
});

// Customer: submit a new multi-step inquiry
const submitRequest = catchAsync(async (req, res) => {
  const request = await customTourService.submitRequest(req.user._id, req.body);
  new ApiResponse(201, request, 'Custom tour request submitted successfully').send(res);
});

// Customer: list their own requests (My Tours dashboard)
const getMyRequests = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  const features = new ApiFeatures(CustomTourRequest.find({ customer: customer._id }), req.query)
    .filter()
    .sort()
    .paginate();
  const docs = await features.query
    .populate(populateItinerary)
    .populate('preferredDestinations preferredActivities')
    .populate('aiGeneratedItinerary.days.destinations', 'name')
    .populate('aiGeneratedItinerary.days.activities', 'name')
    .populate('aiGeneratedItinerary.days.hotel', 'name');
  const meta = await features.getMeta(CustomTourRequest, { customer: customer._id });
  const data = localizeList(docs, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Your custom tour requests', meta).send(res);
});

const getMyRequestById = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  const request = await CustomTourRequest.findOne({ _id: req.params.id, customer: customer._id })
    .populate(populateItinerary)
    .populate('preferredDestinations preferredActivities')
    .populate('aiGeneratedItinerary.days.destinations', 'name')
    .populate('aiGeneratedItinerary.days.activities', 'name')
    .populate('aiGeneratedItinerary.days.hotel', 'name');
  if (!request) throw ApiError.notFound('Custom tour request not found');
  const data = localizeDoc(request, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Request fetched').send(res);
});

// Admin: list all requests (appears immediately on Admin Dashboard)
const getAllRequests = catchAsync(async (req, res) => {
  const features = new ApiFeatures(CustomTourRequest.find(), req.query).search(['referenceNumber']).filter().sort().paginate();
  const docs = await features.query
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email phone' } })
    .populate('preferredDestinations preferredActivities')
    .populate(populateItinerary);
  const meta = await features.getMeta(CustomTourRequest, {});
  const data = localizeList(docs, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Custom tour requests fetched', meta).send(res);
});

const getRequestById = catchAsync(async (req, res) => {
  const request = await CustomTourRequest.findById(req.params.id)
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email phone' } })
    .populate('preferredDestinations preferredActivities')
    .populate(populateItinerary);
  if (!request) throw ApiError.notFound('Custom tour request not found');
  const data = localizeDoc(request, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Request fetched').send(res);
});

// Admin: assign self (or another admin) to review a request
const assignAdmin = catchAsync(async (req, res) => {
  const admin = await Admin.findOne({ user: req.body.adminUserId || req.user._id });
  if (!admin) throw ApiError.notFound('Admin profile not found');
  const request = await customTourService.assignAdmin(req.params.id, admin._id);
  new ApiResponse(200, request, 'Request assigned').send(res);
});

// Admin: build/send a personalized itinerary
const buildItinerary = catchAsync(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id });
  if (!admin) throw ApiError.notFound('Admin profile not found');
  const { request, itinerary } = await customTourService.buildAndSendItinerary(req.params.id, admin._id, req.body);
  new ApiResponse(200, { request, itinerary }, 'Itinerary sent to customer').send(res);
});

// Customer: accept the proposed itinerary
const acceptItinerary = catchAsync(async (req, res) => {
  const request = await customTourService.acceptItinerary(req.user._id, req.params.id);
  new ApiResponse(200, request, 'Itinerary accepted. You may now proceed to booking.').send(res);
});

// Customer: reject the proposed itinerary outright
const rejectItinerary = catchAsync(async (req, res) => {
  const request = await customTourService.rejectItinerary(req.user._id, req.params.id);
  new ApiResponse(200, request, 'Itinerary rejected').send(res);
});

// Customer: request changes -> loop back to admin
const requestChanges = catchAsync(async (req, res) => {
  const request = await customTourService.requestChanges(req.user._id, req.params.id, req.body.note);
  new ApiResponse(200, request, 'Change request sent to our travel experts').send(res);
});

// Admin: decline a change request with an explanation, reverting to the original itinerary
const cannotModify = catchAsync(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id });
  if (!admin) throw ApiError.notFound('Admin profile not found');
  const request = await customTourService.respondCannotModify(req.params.id, admin._id, req.body.note);
  new ApiResponse(200, request, 'Explanation sent to the customer').send(res);
});

// Admin: quick-set priority from the list or detail view
const updatePriority = catchAsync(async (req, res) => {
  const request = await CustomTourRequest.findByIdAndUpdate(req.params.id, { priority: req.body.priority }, { new: true });
  if (!request) throw ApiError.notFound('Custom tour request not found');
  new ApiResponse(200, request, 'Priority updated').send(res);
});

module.exports = {
  generateItinerary,
  submitRequest,
  getMyRequests,
  getMyRequestById,
  getAllRequests,
  getRequestById,
  assignAdmin,
  buildItinerary,
  acceptItinerary,
  rejectItinerary,
  requestChanges,
  cannotModify,
  updatePriority,
};
