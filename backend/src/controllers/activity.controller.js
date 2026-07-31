const { Activity } = require('../models');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory');

const translatableFields = [
  'name',
  'description',
  'location',
  'bestSeason',
  'highlights',
  'thingsIncluded',
  'thingsToBring',
  // Populated ref — a full Destination doc, whose own name/description are
  // still the raw {en,de,fr} shape unless localized here too.
  'destinations.name',
  'destinations.description',
];
const base = factory(Activity, { searchableFields: ['name', 'description'], populate: ['destinations'], translatableFields });

const getAllPublic = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'published' };
  return base.getAll(req, res, next);
});

module.exports = { ...base, getAllPublic };
