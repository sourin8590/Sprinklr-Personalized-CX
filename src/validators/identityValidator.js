const Joi = require('joi');

const msisdn = Joi.string().pattern(/^\d{10}$/).required();

const sendOtpSchema = Joi.object({
  msisdn,
  channel: Joi.string().valid('SMS', 'EMAIL', 'VOICE').default('SMS'),
});

const validateOtpSchema = Joi.object({
  msisdn,
  code: Joi.string().required(),
});

const verifySchema = Joi.object({
  msisdn,
  method: Joi.string().valid('OTP', 'DOB', 'FISCAL_CODE').required(),
  value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
});

module.exports = { sendOtpSchema, validateOtpSchema, verifySchema };
