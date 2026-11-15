const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { chatbotSchema } = require('../validators/ivrValidator');
const { getIvrContext, chatbotFulfillment } = require('../services/ivrService');
const resolveCustomerByMsisdn = require('../middleware/resolveCustomerByMsisdn');

const router = express.Router();

router.get('/ivr/context', asyncHandler(async (req, res) => {
  const result = await getIvrContext(req.query.ani);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/chatbot/fulfillment', validate(chatbotSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await chatbotFulfillment({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
