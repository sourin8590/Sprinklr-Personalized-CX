const AppError = require('../utils/AppError');
const IdempotencyKey = require('../models/IdempotencyKey');

async function idempotency(req, res, next) {
  const key = req.get('Idempotency-Key');
  if (!key) return next();

  try {
    const existing = await IdempotencyKey.findOne({ key }).lean();
    if (existing) {
      return next(new AppError(409, 'DUPLICATE_IDEMPOTENCY_KEY', 'Duplicate idempotency key'));
    }
    req.idempotencyKey = key;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = idempotency;
