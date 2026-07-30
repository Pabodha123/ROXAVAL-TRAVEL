const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { locale } = require('./middleware/locale');
const routes = require('./routes');

const app = express();

// Trust proxy (needed for correct rate-limit / secure cookies behind a reverse proxy)
app.set('trust proxy', 1);

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(locale);

// ---------- Rate limiting ----------
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT.windowMin * 60 * 1000,
  max: env.RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(env.API_PREFIX, limiter);

// ---------- Logging ----------
if (env.NODE_ENV !== 'test') app.use(requestLogger);

// ---------- Static file serving (uploaded receipts, images, generated documents) ----------
// helmet()'s default Cross-Origin-Resource-Policy: same-origin blocks the
// frontend (a different origin/port in dev, and potentially in prod) from
// loading these files in <img>/<a> tags — relax it for this route only.
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ---------- Health check ----------
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Roxaval Travels API is running', timestamp: new Date().toISOString() });
});

// ---------- API routes ----------
app.use(env.API_PREFIX, routes);

// ---------- 404 + error handling ----------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
