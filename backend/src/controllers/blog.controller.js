const { Blog } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const factory = require('./factory');
const { localizeDoc } = require('../utils/localize');

const translatableFields = ['title', 'excerpt', 'content', 'sections.heading', 'sections.body'];
const base = factory(Blog, { searchableFields: ['title', 'content', 'tags'], populate: ['author'], translatableFields });

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
  const data = req.query.raw === 'true' ? blog : localizeDoc(blog, req.lang || 'en', translatableFields);
  new ApiResponse(200, data, 'Blog post fetched').send(res);
});

module.exports = { ...base, create, getAllPublished, getBySlug };
