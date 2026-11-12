const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const {
  createCaseSchema,
  updateCaseSchema,
  addNoteSchema,
  interactionSchema,
  escalateSchema,
} = require('../validators/caseValidator');
const {
  createCase,
  listCases,
  getCaseById,
  updateCase,
  addCaseNote,
  getCaseSla,
  listInteractions,
  createInteraction,
  escalateConversation,
} = require('../services/caseService');

const router = express.Router();

router.post('/cases', validate(createCaseSchema), asyncHandler(async (req, res) => {
  const result = await createCase(req.body);
  return apiResponse(res, 201, result, req.requestId);
}));

router.get('/cases', asyncHandler(async (req, res) => {
  const result = await listCases(req.query);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/cases/:id', asyncHandler(async (req, res) => {
  const result = await getCaseById(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.patch('/cases/:id', validate(updateCaseSchema), asyncHandler(async (req, res) => {
  const result = await updateCase(req.params.id, req.body);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/cases/:id/notes', validate(addNoteSchema), asyncHandler(async (req, res) => {
  const result = await addCaseNote(req.params.id, req.body.text, req.body.author);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/cases/:id/sla', asyncHandler(async (req, res) => {
  const result = await getCaseSla(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/customers/:id/interactions', asyncHandler(async (req, res) => {
  const result = await listInteractions(req.params.id);
  return apiResponse(res, 200, { items: result }, req.requestId);
}));

router.post('/interactions', validate(interactionSchema), asyncHandler(async (req, res) => {
  const result = await createInteraction(req.body);
  return apiResponse(res, 201, result, req.requestId);
}));

router.post('/conversations/escalate', validate(escalateSchema), asyncHandler(async (req, res) => {
  const result = await escalateConversation(req.body);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
