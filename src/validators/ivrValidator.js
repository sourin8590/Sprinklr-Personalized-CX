const Joi = require('joi');

const chatbotSchema = Joi.object({
  intent: Joi.string().valid('CHECK_BILL', 'CHECK_USAGE', 'UPGRADE_PLAN', 'CONFIRM_UPGRADE', 'SPEAK_TO_AGENT').required(),
  customerId: Joi.string().required(),
  params: Joi.object().default({}),
});

module.exports = { chatbotSchema };
