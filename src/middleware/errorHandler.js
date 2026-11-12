const env = require('../config/env');

module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const payload = {
    success: false,
    error: {
      code,
      message: err.message || 'Something went wrong',
      details: err.details || [],
    },
    requestId: req.requestId,
  };

  if (err.name === 'ValidationError' || err.details?.[0]?.message) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.details || [],
      },
      requestId: req.requestId,
    });
  }

  if (err.name === 'JoiValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.details || [],
      },
      requestId: req.requestId,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid identifier format',
        details: [{ field: err.path || 'id', message: err.message }],
      },
      requestId: req.requestId,
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: 'Duplicate resource detected',
        details: [{ field: Object.keys(err.keyPattern || {})[0] || 'resource', message: 'Already exists' }],
      },
      requestId: req.requestId,
    });
  }

  if (err.name === 'ValidationError' && statusCode === 422) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'UNPROCESSABLE_ENTITY',
        message: err.message,
        details: [],
      },
      requestId: req.requestId,
    });
  }

  if (code === 'TOKEN_EXPIRED') {
    return res.status(401).json({
      success: false,
      error: { code, message: err.message, details: err.details || [] },
      requestId: req.requestId,
    });
  }

  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      error: { code, message: err.message, details: err.details || [] },
      requestId: req.requestId,
    });
  }

  const hiddenMessage = env.NODE_ENV === 'development' ? err.stack : 'Internal server error';
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: hiddenMessage,
      details: [],
    },
    requestId: req.requestId,
  });
};
