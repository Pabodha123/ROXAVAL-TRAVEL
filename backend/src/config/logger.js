const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `${ts} [${level}]: ${stack || message}`)
);

// Vercel's serverless filesystem is read-only outside /tmp, so file
// transports (which mkdir 'logs/' on disk) can't run there. Vercel already
// captures console output in its own Runtime Logs, so console-only is
// sufficient in that environment.
const transports = [new winston.transports.Console({ format: consoleFormat })];

if (!process.env.VERCEL) {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'roxaval-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  exitOnError: false,
});

module.exports = logger;
