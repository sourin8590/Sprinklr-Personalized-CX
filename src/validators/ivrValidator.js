const Joi = require('joi');

const chatbotSchema = Joi.object({
  intent: Joi.string().valid('CHECK_BILL', 'CHECK_USAGE', 'UPGRADE_PLAN', 'CONFIRM_UPGRADE', 'SPEAK_TO_AGENT').required(),
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
  params: Joi.object().default({}),
});

module.exports = { chatbotSchema };
