const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { sendOtpSchema, validateOtpSchema, verifySchema } = require('../validators/identityValidator');
const { sendOtp, validateOtp, verifyCustomerIdentity } = require('../services/identityService');

const router = express.Router();

router.post('/otp/send', validate(sendOtpSchema), asyncHandler(async (req, res) => {
  const result = await sendOtp(req.body.customerId, req.body.channel);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/otp/validate', validate(validateOtpSchema), asyncHandler(async (req, res) => {
  const result = await validateOtp(req.body.customerId, req.body.code);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/verify', validate(verifySchema), asyncHandler(async (req, res) => {
  const result = await verifyCustomerIdentity(req.body.customerId, req.body.method, req.body.value);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
