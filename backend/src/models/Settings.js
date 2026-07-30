const mongoose = require('mongoose');

/**
 * Singleton document holding admin-editable company/site settings
 * (contact info, socials, payment details, homepage toggles, etc.).
 * Always accessed/updated via Settings.getSingleton().
 */
const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Roxaval Travels' },
    logoUrl: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      branch: { type: String, default: '' },
      swift: { type: String, default: '' },
    },
    seoDefaults: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
