const { v4: uuidv4 } = require('uuid');

module.exports = function requestId(req, res, next) {
  req.requestId = req.get('X-Request-Id') || uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};
