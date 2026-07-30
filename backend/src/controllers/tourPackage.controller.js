const { TourPackage } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const factory = require('./factory');

const populate = ['destinations', 'activities', 'hotels', 'itinerary.destinations', 'itinerary.activities', 'itinerary.hotel'];
const base = factory(TourPackage, { searchableFields: ['name', 'description'], populate });

const create = catchAsync(async (req, res) => {
  const pkg = await TourPackage.create({ ...req.body, createdBy: req.user._id });
  new ApiResponse(201, pkg, 'Tour package created').send(res);
});

// Public endpoint: the Tour Packages page automatically retrieves all
// published packages from the database.
const getAllPublic = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'published' };
  return base.getAll(req, res, next);
});

const getBySlug = catchAsync(async (req, res) => {
  const pkg = await TourPackage.findOne({ slug: req.params.slug, status: 'published' }).populate(populate);
  if (!pkg) throw ApiError.notFound('Tour package not found');
  new ApiResponse(200, pkg, 'Tour package fetched').send(res);
});

const setStatus = (status) =>
  catchAsync(async (req, res) => {
    const pkg = await TourPackage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!pkg) throw ApiError.notFound('Tour package not found');
    new ApiResponse(200, pkg, `Tour package ${status}`).send(res);
  });

module.exports = {
  ...base,
  create,
  getAllPublic,
  getBySlug,
  publish: setStatus('published'),
  archive: setStatus('archived'),
  unpublish: setStatus('draft'),
};
