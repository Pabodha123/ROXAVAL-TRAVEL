const mongoose = require('mongoose');

/**
 * A general "Contact Us" inquiry — distinct from CustomTourRequest, which
 * captures a structured multi-step tour-planning inquiry. This is a plain
 * message submitted from the public Contact page, optionally by a visitor
 * who isn't a registered user at all.
 */
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Read', 'Responded'], default: 'New' },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
