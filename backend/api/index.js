const mongoose = require('mongoose');

let app;
let connectDB;
let bootError;
try {
  app = require('../src/app');
  connectDB = require('../src/config/db');
} catch (err) {
  bootError = err;
}

let connecting;

module.exports = async (req, res) => {
  if (bootError) {
    res.status(500).json({ success: false, message: 'Backend failed to start', error: bootError.message });
    return;
  }

  try {
    if (mongoose.connection.readyState === 0) {
      connecting = connecting || connectDB();
      await connecting;
    }
    return app(req, res);
  } catch (err) {
    connecting = undefined;
    res.status(500).json({ success: false, message: 'Backend request failed', error: err.message });
  }
};
