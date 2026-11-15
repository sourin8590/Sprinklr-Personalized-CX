const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { paymentLinkSchema, autopaySchema } = require('../validators/billingValidator');
const { createPaymentLink, setAutopay, getAutopay } = require('../services/billingService');
const resolveCustomerByMsisdn = require('../middleware/resolveCustomerByMsisdn');

const router = express.Router();

router.post('/payments/link', validate(paymentLinkSchema), asyncHandler(async (req, res) => {
  const result = await createPaymentLink(req.body.billId);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/customers/:msisdn/autopay', resolveCustomerByMsisdn(), validate(autopaySchema), asyncHandler(async (req, res) => {
  const result = await setAutopay(req.customerId, req.body.enabled);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/customers/:msisdn/autopay', resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await getAutopay(req.customerId);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
