const multer = require('multer');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// Files are held in memory only, then streamed straight to Cloudinary by the
// route/controller — never written to local disk. Vercel's serverless
// filesystem is read-only outside `/tmp` and doesn't persist between
// invocations, so disk storage silently fails (or "succeeds" and then the
// file is gone by the next request) in production.
const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest('Only image files (jpeg, png, webp, gif) are allowed.'));
};

const receiptFileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|webp)$|^application\/pdf$/.test(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest('Only image or PDF files are allowed for payment receipts.'));
};

const maxSize = env.UPLOADS.maxFileSizeMb * 1024 * 1024;

const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

const uploadReceipt = multer({
  storage: memoryStorage,
  fileFilter: receiptFileFilter,
  limits: { fileSize: maxSize },
});

module.exports = { uploadImage, uploadReceipt };
