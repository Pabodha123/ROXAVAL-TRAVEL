const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Centralized, validated access point for all environment variables.
 * Import this instead of using `process.env` directly anywhere else in the app.
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5174',

  MONGO_URI: process.env.MONGO_URI,
  MONGO_URI_TEST: process.env.MONGO_URI_TEST,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  JWT_COOKIE_EXPIRES_IN: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 30,

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Roxaval Travels <no-reply@roxavaltravels.com>',

  COMPANY: {
    name: process.env.COMPANY_NAME || 'Roxaval Travels',
    address: process.env.COMPANY_ADDRESS || 'No 221 Ganemulla Road, Kandana, Sri Lanka',
    phone: process.env.COMPANY_PHONE || '+94 77 880 3522',
    phoneUAE: process.env.COMPANY_PHONE_UAE || '+971 54 264 2902',
    email: process.env.COMPANY_EMAIL || 'info@roxavaltravels.com',
    website: process.env.COMPANY_WEBSITE || 'www.roxavaltravels.com',
    logoPath: process.env.COMPANY_LOGO_PATH || 'src/docs/templates/logo.png',
  },

  PAYMENTS: {
    whatsappNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '',
    bankName: process.env.BANK_NAME || '',
    bankAccountName: process.env.BANK_ACCOUNT_NAME || '',
    bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
    bankBranch: process.env.BANK_BRANCH || '',
    bankSwift: process.env.BANK_SWIFT || '',
  },

  UPLOADS: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_UPLOAD_MB, 10) || 5,
    receiptsDir: process.env.UPLOAD_RECEIPTS_DIR || 'uploads/receipts',
    documentsDir: process.env.UPLOAD_DOCUMENTS_DIR || 'uploads/documents',
  },

  CLOUDINARY: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  RATE_LIMIT: {
    windowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 300,
  },

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Shared secret Vercel Cron sends as `Authorization: Bearer <value>` when
  // it calls /birthdays/run-daily-cron. Set in the Vercel project env vars.
  CRON_SECRET: process.env.CRON_SECRET,

  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
};

// Fail fast on missing critical secrets in non-test environments. Under a
// traditional long-running process (local/Render/Railway) exiting is the
// right move; under Vercel's serverless runtime process.exit() just kills
// the invocation with an opaque FUNCTION_INVOCATION_FAILED and no message,
// so there we throw instead and let the caller (backend/api/index.js)
// turn it into a readable JSON error.
const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
if (env.NODE_ENV !== 'test') {
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.VERCEL) {
      throw new Error(message);
    }
    // eslint-disable-next-line no-console
    console.error(message);
    process.exit(1);
  }
}

module.exports = env;
