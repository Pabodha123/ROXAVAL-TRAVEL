const { Destination } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const factory = require('./factory');

const base = factory(Destination, { searchableFields: ['name', 'description', 'tag'], populate: ['nearbyDestinations'] });

// Public listing only shows published destinations unless an admin is asking
const getAllPublic = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'published' };
  return base.getAll(req, res, next);
});

const addAttraction = catchAsync(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) throw ApiError.notFound('Destination not found');
  destination.attractions.push(req.body);
  await destination.save();
  new ApiResponse(201, destination, 'Attraction added').send(res);
});

const updateAttraction = catchAsync(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) throw ApiError.notFound('Destination not found');
  const attraction = destination.attractions.id(req.params.attractionId);
  if (!attraction) throw ApiError.notFound('Attraction not found');
  Object.assign(attraction, req.body);
  await destination.save();
  new ApiResponse(200, destination, 'Attraction updated').send(res);
});

const removeAttraction = catchAsync(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) throw ApiError.notFound('Destination not found');
  destination.attractions.id(req.params.attractionId)?.deleteOne();
  await destination.save();
  new ApiResponse(200, destination, 'Attraction removed').send(res);
});

module.exports = { ...base, getAllPublic, addAttraction, updateAttraction, removeAttraction };
