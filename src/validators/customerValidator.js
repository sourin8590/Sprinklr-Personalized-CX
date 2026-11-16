const Joi = require('joi');

const lookupSchema = Joi.object({
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
});

const planChangeSchema = Joi.object({
  targetPlanCode: Joi.string().required(),
  consent: Joi.boolean().required(),
  channel: Joi.string().valid('IVR', 'CHAT', 'AGENT', 'WHATSAPP', 'SMS').required(),
});

const registrationSchema = Joi.object({
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().email().lowercase().trim(),
  tier: Joi.string().valid('STANDARD', 'PREMIUM'),
  language: Joi.string().trim().min(2),
});

module.exports = { lookupSchema, planChangeSchema, registrationSchema };
