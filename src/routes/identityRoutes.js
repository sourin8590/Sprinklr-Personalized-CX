const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { sendOtpSchema, validateOtpSchema, verifySchema } = require('../validators/identityValidator');
const { sendOtp, validateOtp, verifyCustomerIdentity } = require('../services/identityService');
const resolveCustomerByMsisdn = require('../middleware/resolveCustomerByMsisdn');

const router = express.Router();

router.post('/otp/send', validate(sendOtpSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await sendOtp(req.customerId, req.body.channel);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/otp/validate', validate(validateOtpSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await validateOtp(req.customerId, req.body.code);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/verify', validate(verifySchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await verifyCustomerIdentity(req.customerId, req.body.method, req.body.value);
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
