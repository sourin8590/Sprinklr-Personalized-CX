const Joi = require('joi');

const sendOtpSchema = Joi.object({
  customerId: Joi.string().required(),
  channel: Joi.string().valid('SMS', 'EMAIL', 'VOICE').default('SMS'),
});

const validateOtpSchema = Joi.object({
  customerId: Joi.string().required(),
  code: Joi.string().required(),
});

const verifySchema = Joi.object({
  customerId: Joi.string().required(),
  method: Joi.string().valid('OTP', 'DOB', 'FISCAL_CODE').required(),
  value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
});

module.exports = { sendOtpSchema, validateOtpSchema, verifySchema };
