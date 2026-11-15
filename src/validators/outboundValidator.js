const Joi = require('joi');

const segmentSchema = Joi.object({
  name: Joi.string().required(),
  ruleType: Joi.string().valid('OVERDUE', 'UPGRADE_ELIGIBLE', 'CUSTOM').required(),
  rule: Joi.object().required(),
});

const campaignSchema = Joi.object({
  name: Joi.string().required(),
  channel: Joi.string().valid('SMS', 'VOICE', 'WHATSAPP').required(),
  segmentId: Joi.string().required(),
  template: Joi.string().required(),
  scheduledAt: Joi.date().optional(),
});

const sendMessageSchema = Joi.object({
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
  channel: Joi.string().valid('SMS', 'VOICE', 'WHATSAPP').required(),
  template: Joi.string().required(),
});

const deliveryWebhookSchema = Joi.object({
  campaignId: Joi.string().required(),
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
  status: Joi.string().required(),
});

const responseWebhookSchema = Joi.object({
  campaignId: Joi.string().required(),
  msisdn: Joi.string().pattern(/^\d{10}$/).required(),
  responseText: Joi.string().required(),
});

module.exports = { segmentSchema, campaignSchema, sendMessageSchema, deliveryWebhookSchema, responseWebhookSchema };
