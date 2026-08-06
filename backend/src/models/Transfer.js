const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Admin-managed point-to-point transfer cost entry (e.g. "Airport to Hotel",
 * "All Transfers (Hotel to Hotel)") tied to a destination area, priced with
 * or without a driver. Picked per-day in the itinerary builder's Transfer tab.
 */
const transferSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Transfer name is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    supplier: { type: String, default: '' },
    type: { type: String, enum: ['Private (PVT)', 'Seat-in-Coach (SIC)'], default: 'Private (PVT)' },
    transferFor: { type: String, default: 'Same Day' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    costWithDriver: { type: Number, required: [true, 'Cost with driver is required'] },
    costWithoutDriver: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

transferSchema.pre('save', function setSlug(next) {
  if (this.isModified('name')) this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;
  next();
});

transferSchema.index({ name: 'text', supplier: 'text' });
transferSchema.index({ destination: 1, status: 1 });

module.exports = mongoose.model('Transfer', transferSchema);
