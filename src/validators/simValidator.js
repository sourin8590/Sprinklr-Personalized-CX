const Joi = require('joi');

const simReplacementSchema = Joi.object({
  customerId: Joi.string().required(),
  reason: Joi.string().valid('LOST', 'DAMAGED', 'STOLEN', 'UPGRADE').required(),
  simType: Joi.string().valid('PHYSICAL', 'ESIM').required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    province: Joi.string().required(),
  }).when('simType', {
    is: 'PHYSICAL',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

module.exports = { simReplacementSchema };
