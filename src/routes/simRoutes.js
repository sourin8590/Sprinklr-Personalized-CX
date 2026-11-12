const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { simReplacementSchema } = require('../validators/simValidator');
const {
  getCustomerSim,
  getSimReplacementEligibility,
  requestSimReplacement,
  getSimReplacementByRequestCode,
} = require('../services/simService');
const idempotency = require('../middleware/idempotency');

const router = express.Router();

router.get('/customers/:id/sim', asyncHandler(async (req, res) => {
  const result = await getCustomerSim(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/customers/:id/sim-replacement/eligibility', asyncHandler(async (req, res) => {
  const result = await getSimReplacementEligibility(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/sim-replacement', idempotency, validate(simReplacementSchema), asyncHandler(async (req, res) => {
  const result = await requestSimReplacement(req.body, req.idempotencyKey);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/sim-replacement/:requestCode', asyncHandler(async (req, res) => {
  const result = await getSimReplacementByRequestCode(req.params.requestCode);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
