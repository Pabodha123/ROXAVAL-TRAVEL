const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const app = require('../src/app');

let connecting;

module.exports = async (req, res) => {
  if (mongoose.connection.readyState === 0) {
    connecting = connecting || connectDB();
    await connecting;
  }
  return app(req, res);
};
