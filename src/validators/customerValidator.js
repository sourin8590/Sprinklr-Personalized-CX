const Joi = require('joi');

const lookupSchema = Joi.object({
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
});

const planChangeSchema = Joi.object({
  targetPlanCode: Joi.string().required(),
  consent: Joi.boolean().required(),
  channel: Joi.string().valid('IVR', 'CHAT', 'AGENT', 'WHATSAPP', 'SMS').required(),
});

module.exports = { lookupSchema, planChangeSchema };
