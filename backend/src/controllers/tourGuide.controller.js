const { TourGuide } = require('../models');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory');

const base = factory(TourGuide, { searchableFields: ['name', 'bio'] });

const getAllActive = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'active' };
  return base.getAll(req, res, next);
});

module.exports = { ...base, getAllActive };
