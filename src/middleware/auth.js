const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const ApiKey = require('../models/ApiKey');

async function authenticate(req, res, next) {
  try {
    const apiKeyHeader = req.headers['x-api-key'];
    const authHeader = req.headers.authorization;

    if (apiKeyHeader) {
      const apiKey = await ApiKey.findOne({ active: true });
      if (!apiKey) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Invalid API key'));
      }
      const valid = await bcrypt.compare(String(apiKeyHeader), apiKey.keyHash);
      if (!valid) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Invalid API key'));
      }
      req.auth = { type: 'api-key', scopes: apiKey.scopes || [] };
      return next();
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.auth = { type: 'jwt', user: decoded, scopes: decoded.scopes || [] };
        return next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return next(new AppError(401, 'TOKEN_EXPIRED', 'JWT expired'));
        }
        return next(new AppError(401, 'UNAUTHORIZED', 'Invalid JWT'));
      }
    }

    return next(new AppError(401, 'UNAUTHORIZED', 'Missing API key or JWT'));
  } catch (error) {
    return next(error);
  }
}

function authorize(requiredScopes = []) {
  return (req, res, next) => {
    const scopes = req.auth?.scopes || [];
    const allowed = requiredScopes.every((scope) => scopes.includes(scope) || scope === '*');
    if (!allowed) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient scope'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
