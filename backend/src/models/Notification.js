const mongoose = require('mongoose');

/**
 * Persisted notification delivered to a user (customer or admin).
 * `type` drives icon/rendering on the frontend; `link` deep-links to the
 * relevant resource (e.g. a booking or custom tour request).
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'inquiry_received',
        'inquiry_updated',
        'itinerary_ready',
        'changes_requested',
        'cannot_modify',
        'itinerary_approved',
        'booking_created',
        'booking_confirmed',
        'payment_submitted',
        'payment_verified',
        'document_ready',
        'review_moderated',
        'birthday',
        'message_received',
        'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    relatedModel: { type: String, default: '' }, // e.g. 'Booking', 'CustomTourRequest'
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
