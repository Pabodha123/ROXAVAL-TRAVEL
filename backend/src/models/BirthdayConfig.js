const mongoose = require('mongoose');

/**
 * Singleton document holding admin-editable Birthday Wishes settings —
 * message template, card background, and the optional birthday coupon.
 * Always accessed/updated via BirthdayConfig.getSingleton(), same pattern
 * as Settings.getSingleton().
 */
const birthdayConfigSchema = new mongoose.Schema(
  {
    subjectTemplate: {
      type: String,
      default: 'Happy Birthday from Roxaval Travels, {{firstName}}!',
    },
    messageTemplate: {
      type: String,
      default:
        "Wishing you a year filled with joy, adventure and unforgettable journeys. As a small token of our appreciation, the whole team at Roxaval Travels is thinking of you today. Here's to your next Sri Lankan escape!",
    },
    backgroundImageUrl: { type: String, default: '' },
    couponEnabled: { type: Boolean, default: false },
    couponDiscountPercent: { type: Number, default: 10, min: 1, max: 100 },
    couponValidDays: { type: Number, default: 30, min: 1 },
  },
  { timestamps: true }
);

birthdayConfigSchema.statics.getSingleton = async function getSingleton() {
  let config = await this.findOne();
  if (!config) config = await this.create({});
  return config;
};

module.exports = mongoose.model('BirthdayConfig', birthdayConfigSchema);
