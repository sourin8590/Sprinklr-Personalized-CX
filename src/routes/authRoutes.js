const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { tokenSchema } = require('../validators/authValidator');
const { getToken } = require('../services/identityService');
const { generateRequestId } = require('../utils/generateCode');
const AppError = require('../utils/AppError');

const router = express.Router();

router.post('/token', validate(tokenSchema), asyncHandler(async (req, res) => {
  const { client_id, client_secret } = req.body;
  const result = await getToken(client_id, client_secret);
  return apiResponse(res, 200, result, req.requestId || generateRequestId());
}));

module.exports = router;
