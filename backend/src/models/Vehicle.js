const mongoose = require('mongoose');
const slugify = require('slugify');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Vehicle name is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    type: { type: String, enum: ['Car', 'Van', 'SUV', 'Minibus', 'Bus'], default: 'Car' },
    capacity: { type: Number, required: [true, 'Passenger capacity is required'] },
    driverIncluded: { type: Boolean, default: true },
    features: { type: [String], default: [] },
    images: { type: [String], default: [] },
    pricePerDay: { type: Number, required: [true, 'Price per day is required'] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

vehicleSchema.pre('save', function setSlug(next) {
  if (this.isModified('name')) this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;
  next();
});

vehicleSchema.index({ name: 'text' });
vehicleSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
