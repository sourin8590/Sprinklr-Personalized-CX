const Joi = require('joi');

const paymentLinkSchema = Joi.object({
  billId: Joi.string().required(),
});

const paymentStatusParamsSchema = Joi.object({
  billNumber: Joi.string().pattern(/^B-(?:[A-F0-9]{10}|\d{4}-\d{2})$/i).required(),
});

const autopaySchema = Joi.object({
  enabled: Joi.boolean().required(),
});

const issueDateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      return helpers.error('date.format');
    }
    return value;
  })
  .messages({ 'date.format': 'issueDate must be a valid date in YYYY-MM-DD format' });

const billsQuerySchema = Joi.object({
  status: Joi.string().valid('DUE', 'OVERDUE', 'PAID'),
});

const billsByIssueDateQuerySchema = Joi.object({
  issueDate: issueDateSchema.required(),
});

module.exports = {
  paymentLinkSchema,
  paymentStatusParamsSchema,
  autopaySchema,
  billsQuerySchema,
  billsByIssueDateQuerySchema,
};
