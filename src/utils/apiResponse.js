function apiResponse(res, statusCode, data, requestId) {
  return res.status(statusCode).json({
    success: true,
    data,
    requestId,
  });
}

module.exports = apiResponse;
