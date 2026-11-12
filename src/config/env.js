require('dotenv').config();

const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/windtre_mock',
  JWT_SECRET: process.env.JWT_SECRET || 'change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  API_KEY_SALT_ROUNDS: Number(process.env.API_KEY_SALT_ROUNDS || 10),
  MOCK_OTP: String(process.env.MOCK_OTP || 'true').toLowerCase() === 'true',
  MOCK_OTP_CODE: process.env.MOCK_OTP_CODE || '123456',
  MOCK_LATENCY_MS: Number(process.env.MOCK_LATENCY_MS || 0),
  MOCK_FAILURE_RATE: Number(process.env.MOCK_FAILURE_RATE || 0),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 100),
};

module.exports = env;
