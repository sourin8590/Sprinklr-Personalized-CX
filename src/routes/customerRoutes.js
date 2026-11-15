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
const resolveCustomerByMsisdn = require('../middleware/resolveCustomerByMsisdn');

const router = express.Router();

router.get('/lookup', validate(lookupSchema, 'query'), asyncHandler(async (req, res) => {
  const result = await lookupCustomerByMsisdn(req.query.msisdn);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:msisdn/profile', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getCustomerProfile(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:msisdn/plan', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getCustomerPlan(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:msisdn/usage', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getCustomerUsage(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:msisdn/billing/latest', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getLatestBill(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:msisdn/bills', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getBills(req.customerId, req.query.status);
  return apiResponse(res, 200, { items: result }, req.requestId);
}));

router.get('/:msisdn/360', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getCustomer360(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/:msisdn/offers', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getOffers(req.customerId);
  return apiResponse(res, 200, { offers: result }, req.requestId);
}));

router.get('/:msisdn/next-best-action', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getNextBestAction(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/:msisdn/plan-change', resolveCustomerByMsisdn(), idempotency, validate(planChangeSchema), asyncHandler(async (req, res) => {
  const result = await changePlan(req.customerId, req.body.targetPlanCode, req.body.consent, req.body.channel, req.idempotencyKey);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
