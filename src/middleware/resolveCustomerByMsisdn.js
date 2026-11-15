const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');

function resolveCustomerByMsisdn({ optional = false } = {}) {
  return async (req, res, next) => {
    try {
      const msisdn = req.params.msisdn || (req.body && req.body.msisdn) || req.query.msisdn;
      if (!msisdn && optional) return next();
      if (!msisdn) throw new AppError(400, 'MSISDN_REQUIRED', 'Customer mobile number is required');
      if (typeof msisdn !== 'string' || !/^\d{10}$/.test(msisdn)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', [
          { field: 'msisdn', message: 'Mobile number must contain exactly 10 digits' },
        ]);
      }

      const customer = await Customer.findOne({ msisdn }).select('_id').lean();
      if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

      req.customerId = customer._id;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = resolveCustomerByMsisdn;
