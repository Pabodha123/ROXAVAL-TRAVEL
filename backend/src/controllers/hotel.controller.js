const { Hotel } = require('../models');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory');

const translatableFields = [
  'name',
  'address',
  'description',
  'amenities',
  'roomTypes.name',
  // Populated ref — a full Destination doc, whose own name/description are
  // still the raw {en,de,fr} shape unless localized here too.
  'destination.name',
  'destination.description',
];
const base = factory(Hotel, { searchableFields: ['name', 'description'], populate: ['destination'], translatableFields });

const getAllActive = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'active' };
  return base.getAll(req, res, next);
});

module.exports = { ...base, getAllActive };
