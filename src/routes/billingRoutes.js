const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { paymentLinkSchema, autopaySchema } = require('../validators/billingValidator');
const { createPaymentLink, setAutopay, getAutopay } = require('../services/billingService');

const router = express.Router();

router.post('/payments/link', validate(paymentLinkSchema), asyncHandler(async (req, res) => {
  const result = await createPaymentLink(req.body.billId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/customers/:id/autopay', validate(autopaySchema), asyncHandler(async (req, res) => {
  const result = await setAutopay(req.params.id, req.body.enabled);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/customers/:id/autopay', asyncHandler(async (req, res) => {
  const result = await getAutopay(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
