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
  getCaseByNumber,
  updateCaseByNumber,
  addCaseNoteByNumber,
  getCaseSlaByNumber,
  listInteractions,
  createInteraction,
  escalateConversation,
} = require('../services/caseService');
const resolveCustomerByMsisdn = require('../middleware/resolveCustomerByMsisdn');

const router = express.Router();

router.post('/cases', validate(createCaseSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await createCase({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 201, result, req.requestId);
}));

router.get('/cases', resolveCustomerByMsisdn({ optional: true }), asyncHandler(async (req, res) => {
  const result = await listCases({ ...req.query, customerId: req.customerId });
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/cases/:caseNumber', asyncHandler(async (req, res) => {
  const result = await getCaseByNumber(req.params.caseNumber);
  return apiResponse(res, 200, result, req.requestId);
}));

router.patch('/cases/:caseNumber', validate(updateCaseSchema), asyncHandler(async (req, res) => {
  const result = await updateCaseByNumber(req.params.caseNumber, req.body);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/cases/:caseNumber/notes', validate(addNoteSchema), asyncHandler(async (req, res) => {
  const result = await addCaseNoteByNumber(req.params.caseNumber, req.body.text, req.body.author);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/cases/:caseNumber/sla', asyncHandler(async (req, res) => {
  const result = await getCaseSlaByNumber(req.params.caseNumber);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/customers/:msisdn/interactions', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await listInteractions(req.customerId);
  return apiResponse(res, 200, { items: result }, req.requestId);
}));

router.post('/interactions', validate(interactionSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await createInteraction({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 201, result, req.requestId);
}));

router.post('/conversations/escalate', validate(escalateSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await escalateConversation({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
