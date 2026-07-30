const ApiError = require('../utils/ApiError');

/**
 * Validates req.body / req.query / req.params against a Zod schema map.
 * Usage: validate({ body: createBookingSchema })
 */
const validate = (schemas) => (req, res, next) => {
  const errors = [];

  ['body', 'query', 'params'].forEach((key) => {
    if (schemas[key]) {
      const result = schemas[key].safeParse(req[key]);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({ field: `${key}.${issue.path.join('.')}`, message: issue.message })
        );
      } else {
        req[key] = result.data;
      }
    }
  });

  if (errors.length) {
    return next(ApiError.badRequest('Validation failed', errors));
  }
  next();
};

module.exports = validate;
