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
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
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
    address: process.env.COMPANY_ADDRESS || '',
    phone: process.env.COMPANY_PHONE || '',
    email: process.env.COMPANY_EMAIL || '',
    website: process.env.COMPANY_WEBSITE || '',
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

  RATE_LIMIT: {
    windowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 300,
  },

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
};

// Fail fast on missing critical secrets in non-test environments
const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
if (env.NODE_ENV !== 'test') {
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = env;
