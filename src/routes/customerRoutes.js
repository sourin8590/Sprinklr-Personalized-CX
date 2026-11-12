const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { lookupSchema, planChangeSchema } = require('../validators/customerValidator');
const {
  lookupCustomerByMsisdn,
  getCustomerProfile,
  getCustomerPlan,
  getCustomerUsage,
  getLatestBill,
  getBills,
  getCustomer360,
  getOffers,
  getNextBestAction,
  changePlan,
} = require('../services/customerService');
const idempotency = require('../middleware/idempotency');

const router = express.Router();

router.get('/lookup', validate(lookupSchema, 'query'), asyncHandler(async (req, res) => {
  const result = await lookupCustomerByMsisdn(req.query.msisdn);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:id/profile', asyncHandler(async (req, res) => {
  const result = await getCustomerProfile(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:id/plan', asyncHandler(async (req, res) => {
  const result = await getCustomerPlan(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:id/usage', asyncHandler(async (req, res) => {
  const result = await getCustomerUsage(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:id/billing/latest', asyncHandler(async (req, res) => {
  const result = await getLatestBill(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:id/bills', asyncHandler(async (req, res) => {
  const result = await getBills(req.params.id, req.query.status);
  return apiResponse(res, 200, { items: result }, req.requestId);
}));

router.get('/:id/360', asyncHandler(async (req, res) => {
  const result = await getCustomer360(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:id/offers', asyncHandler(async (req, res) => {
  const result = await getOffers(req.params.id);
  return apiResponse(res, 200, { offers: result }, req.requestId);
}));

router.get('/:id/next-best-action', asyncHandler(async (req, res) => {
  const result = await getNextBestAction(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/:id/plan-change', idempotency, validate(planChangeSchema), asyncHandler(async (req, res) => {
  const result = await changePlan(req.params.id, req.body.targetPlanCode, req.body.consent, req.body.channel, req.idempotencyKey);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
