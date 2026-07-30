const { Blog } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const factory = require('./factory');

const base = factory(Blog, { searchableFields: ['title', 'content', 'tags'], populate: ['author'] });

const create = catchAsync(async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.user._id });
  new ApiResponse(201, blog, 'Blog post created').send(res);
});

const getAllPublished = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, status: 'published' };
  return base.getAll(req, res, next);
});

const getBySlug = catchAsync(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!blog) throw ApiError.notFound('Blog post not found');
  new ApiResponse(200, blog, 'Blog post fetched').send(res);
});

module.exports = { ...base, create, getAllPublished, getBySlug };
