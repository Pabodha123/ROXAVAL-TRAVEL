const path = require('path');
const router = require('express').Router();
const { protect, restrictTo } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

router.use(protect, restrictTo('admin', 'superadmin'));

// Single image (hero image, avatar, etc.)
router.post(
  '/image',
  uploadImage.single('image'),
  catchAsync(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('Image file is required');
    const url = `/uploads/images/${path.basename(req.file.path)}`;
    new ApiResponse(201, { url }, 'Image uploaded').send(res);
  })
);

// Multiple images (galleries)
router.post(
  '/images',
  uploadImage.array('images', 10),
  catchAsync(async (req, res) => {
    if (!req.files?.length) throw ApiError.badRequest('At least one image file is required');
    const urls = req.files.map((f) => `/uploads/images/${path.basename(f.path)}`);
    new ApiResponse(201, { urls }, 'Images uploaded').send(res);
  })
);

module.exports = router;
