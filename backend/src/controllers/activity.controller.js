const { Activity } = require('../models');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory');

const translatableFields = ['name', 'description', 'location', 'bestSeason', 'highlights', 'thingsIncluded', 'thingsToBring'];
const base = factory(Activity, { searchableFields: ['name', 'description'], populate: ['destinations'], translatableFields });

const getAllPublic = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'published' };
  return base.getAll(req, res, next);
});

module.exports = { ...base, getAllPublic };
