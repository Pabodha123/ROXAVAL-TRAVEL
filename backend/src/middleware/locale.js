const SUPPORTED_LOCALES = ['en', 'de', 'fr'];

/**
 * Resolves the requested content language from `?lang=` into `req.lang`,
 * used by `localize.js`/`factory.js` to shape catalog responses and by
 * services that need the customer's language outside a request context.
 */
const locale = (req, res, next) => {
  const requested = String(req.query.lang || '').toLowerCase();
  req.lang = SUPPORTED_LOCALES.includes(requested) ? requested : 'en';
  next();
};

module.exports = { locale, SUPPORTED_LOCALES };
