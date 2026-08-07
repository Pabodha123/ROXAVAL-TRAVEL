const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY.cloudName,
  api_key: env.CLOUDINARY.apiKey,
  api_secret: env.CLOUDINARY.apiSecret,
});

/**
 * Uploads an in-memory file buffer (from multer's memoryStorage) to
 * Cloudinary and resolves with the result. Used instead of local disk
 * writes because Vercel's serverless filesystem is read-only outside
 * `/tmp` and doesn't persist between invocations anyway.
 */
const uploadBuffer = (buffer, { folder, resourceType = 'image' }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: `roxaval/${folder}`, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

module.exports = { cloudinary, uploadBuffer };
