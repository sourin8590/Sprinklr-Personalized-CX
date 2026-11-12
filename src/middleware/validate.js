const Joi = require('joi');
const AppError = require('../utils/AppError');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const target = req[property];
    const { error, value } = schema.validate(target, {
      abortEarly: false,
      convert: true,
      allowUnknown: false,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.') || 'payload',
        message: detail.message,
      }));

      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details));
    }

    req[property] = value;
    return next();
  };
}

module.exports = validate;
