const Joi = require('joi');

const tokenSchema = Joi.object({
  client_id: Joi.string().required(),
  client_secret: Joi.string().required(),
});

module.exports = { tokenSchema };
