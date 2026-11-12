const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Plan = require('../models/Plan');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const plans = await Plan.find({ active: true }).lean();
  return apiResponse(res, 200, { items: plans }, req.requestId);
}));

module.exports = router;
