const { v4: uuidv4 } = require('uuid');

function generateCode(length = 6) {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateRequestId() {
  return uuidv4();
}

module.exports = { generateCode, generateRequestId };
