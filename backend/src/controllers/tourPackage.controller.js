const { TourPackage } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const factory = require('./factory');
const { localizeDoc } = require('../utils/localize');

const populate = ['destinations', 'activities', 'hotels', 'itinerary.destinations', 'itinerary.activities', 'itinerary.hotel'];
const translatableFields = [
  'name',
  'description',
  'highlights',
  'includedServices',
  'excludedServices',
  'itinerary.title',
  'itinerary.description',
  // Populated refs — these are full Destination/Activity/Hotel docs, whose
  // own name/description fields are still the raw {en,de,fr} shape unless
  // localized here too (otherwise React crashes trying to render the object).
  'destinations.name',
  'destinations.description',
  'activities.name',
  'activities.description',
  'hotels.name',
  'hotels.address',
  'itinerary.destinations.name',
  'itinerary.activities.name',
  'itinerary.hotel.name',
];
const base = factory(TourPackage, { searchableFields: ['name', 'description'], populate, translatableFields });

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
  const data = req.query.raw === 'true' ? pkg : localizeDoc(pkg, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Tour package fetched').send(res);
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
