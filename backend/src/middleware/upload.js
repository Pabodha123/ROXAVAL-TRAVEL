const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const ensureDir = (dir) => {
  const fullPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const storageFor = (dir) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, ensureDir(dir)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });

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
  storage: storageFor('uploads/images'),
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

const uploadReceipt = multer({
  storage: storageFor(env.UPLOADS.receiptsDir),
  fileFilter: receiptFileFilter,
  limits: { fileSize: maxSize },
});

module.exports = { uploadImage, uploadReceipt };
