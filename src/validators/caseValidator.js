const Joi = require('joi');

const createCaseSchema = Joi.object({
  customerId: Joi.string().required(),
  channel: Joi.string().valid('VOICE', 'CHAT', 'EMAIL', 'SOCIAL', 'SMS', 'WHATSAPP').required(),
  subject: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
});

const updateCaseSchema = Joi.object({
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  assignedAgentId: Joi.string().optional(),
});

const addNoteSchema = Joi.object({
  text: Joi.string().required(),
  author: Joi.string().required(),
});

const interactionSchema = Joi.object({
  customerId: Joi.string().required(),
  caseId: Joi.string().optional(),
  channel: Joi.string().valid('VOICE', 'CHAT', 'EMAIL', 'SOCIAL', 'SMS', 'WHATSAPP').required(),
  direction: Joi.string().valid('INBOUND', 'OUTBOUND').required(),
  summary: Joi.string().optional(),
  transcriptRef: Joi.string().optional(),
});

const escalateSchema = Joi.object({
  customerId: Joi.string().required(),
  intent: Joi.string().required(),
  summary: Joi.string().required(),
  context: Joi.object().required(),
});

module.exports = { createCaseSchema, updateCaseSchema, addNoteSchema, interactionSchema, escalateSchema };
