const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

// The mongodb+srv:// URI needs a DNS SRV lookup, which the OS's default
// resolver (often IPv6 via the router) can fail to answer even when the
// network itself is up. Route Node's own lookups through a public resolver.
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const uri = env.NODE_ENV === 'test' ? env.MONGO_URI_TEST : env.MONGO_URI;
    const conn = await mongoose.connect(uri, {
      autoIndex: env.NODE_ENV !== 'production',
    });
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    if (process.env.VERCEL) throw err;
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
  });
};

module.exports = connectDB;
