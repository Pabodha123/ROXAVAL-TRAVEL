const { Vehicle } = require('../models');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory');

const base = factory(Vehicle, { searchableFields: ['name'] });

const getAllActive = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'active' };
  return base.getAll(req, res, next);
});

module.exports = { ...base, getAllActive };
