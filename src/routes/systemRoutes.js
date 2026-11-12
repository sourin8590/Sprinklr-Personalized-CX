const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  const health = { status: 'ok', timestamp: new Date().toISOString() };
  return apiResponse(res, 200, health, req.requestId);
}));

module.exports = router;
