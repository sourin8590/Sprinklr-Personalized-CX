const Joi = require('joi');

const paymentLinkSchema = Joi.object({
  billId: Joi.string().required(),
});

const autopaySchema = Joi.object({
  enabled: Joi.boolean().required(),
});

module.exports = { paymentLinkSchema, autopaySchema };
