const mongoose = require('mongoose');

/**
 * A single chat-style message in the conversation thread attached to a
 * custom tour request. Unread tracking is handled entirely by the existing
 * Notification system (type 'message_received') rather than a second
 * per-message read flag.
 */
const messageSchema = new mongoose.Schema(
  {
    customTourRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomTourRequest', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'admin'], required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

messageSchema.index({ customTourRequest: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
