const env = require('../config/env');

module.exports = function mockChaos(req, res, next) {
  if (env.MOCK_LATENCY_MS > 0) {
    setTimeout(() => {
      if (Math.random() < env.MOCK_FAILURE_RATE) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Mock service disruption triggered.',
            details: [],
          },
          requestId: req.requestId,
        });
      }
      next();
    }, env.MOCK_LATENCY_MS);
    return;
  }

  if (Math.random() < env.MOCK_FAILURE_RATE) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Mock service disruption triggered.',
        details: [],
      },
      requestId: req.requestId,
    });
  }

  next();
};
