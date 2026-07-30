const { z } = require('zod');

/**
 * Mirrors `models/shared/localizedField.js` on the validation side —
 * English is the required baseline for admin-authored catalog content,
 * German/French are optional so partial translations are always valid.
 */
const localizedField = (minLength = 1, message) =>
  z.object({
    en: z.string().min(minLength, message || `English text is required (min ${minLength} chars)`),
    de: z.string().optional().default(''),
    fr: z.string().optional().default(''),
  });

const localizedFieldArray = () =>
  z.array(
    z.object({
      en: z.string().default(''),
      de: z.string().optional().default(''),
      fr: z.string().optional().default(''),
    })
  );

module.exports = { localizedField, localizedFieldArray };
