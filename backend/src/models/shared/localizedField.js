const mongoose = require('mongoose');

/**
 * Field-level i18n for admin-authored catalog content (Tour Packages,
 * Destinations, Activities, Hotels, Blog). English is always the required
 * baseline; German/French are optional so half-translated content never
 * breaks the site — `localize.js` falls back to `en` when a locale is blank.
 */
function localizedString(requiredMessage) {
  return {
    en: requiredMessage ? { type: String, required: requiredMessage, trim: true } : { type: String, trim: true, default: '' },
    de: { type: String, trim: true, default: '' },
    fr: { type: String, trim: true, default: '' },
  };
}

const localizedStringSchema = new mongoose.Schema(
  { en: { type: String, default: '' }, de: { type: String, default: '' }, fr: { type: String, default: '' } },
  { _id: false }
);

function localizedStringArray() {
  return { type: [localizedStringSchema], default: [] };
}

module.exports = { localizedString, localizedStringArray, localizedStringSchema };
