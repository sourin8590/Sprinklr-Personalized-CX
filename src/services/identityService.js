const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const Customer = require('../models/Customer');
const OtpChallenge = require('../models/OtpChallenge');
const IdentityVerification = require('../models/IdentityVerification');
const ApiKey = require('../models/ApiKey');
const { writeAuditLog } = require('./auditService');
const { generateCode } = require('../utils/generateCode');

async function getToken(clientId, clientSecret) {
  const apiKeyDoc = await ApiKey.findOne({ name: 'sprinklr-demo' }).lean();
  if (!apiKeyDoc || clientId !== 'sprinklr-demo-client') {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid client credentials');
  }

  const isMatch = await bcrypt.compare(clientSecret, apiKeyDoc.keyHash);
  if (!isMatch) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid client credentials');
  }

  const token = jwt.sign({ sub: clientId, scopes: ['*'] }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  return { token };
}

async function sendOtp(customerId, channel) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const code = env.MOCK_OTP ? env.MOCK_OTP_CODE : generateCode(6);
  const codeHash = await bcrypt.hash(code, env.API_KEY_SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otp = await OtpChallenge.findOneAndUpdate(
    { customer: customerId },
    { customer: customerId, codeHash, channel, expiresAt, attempts: 0, verified: false },
    { upsert: true, new: true }
  );

  await writeAuditLog({ action: 'OTP_SENT', entity: 'OtpChallenge', entityId: otp._id.toString(), payload: { customerId, channel } });
  return { customerId, channel, expiresAt, otpCode: env.MOCK_OTP ? code : 'sent' };
}

async function validateOtp(customerId, code) {
  const otpRecord = await OtpChallenge.findOne({ customer: customerId }).sort({ createdAt: -1 });
  if (!otpRecord) throw new AppError(404, 'NOT_FOUND', 'OTP challenge not found');
  if (new Date(otpRecord.expiresAt) < new Date()) throw new AppError(409, 'OTP_EXPIRED', 'OTP expired');

  if (otpRecord.attempts >= 3) throw new AppError(409, 'OTP_MAX_ATTEMPTS', 'Max OTP attempts reached');

  const isValid = await bcrypt.compare(String(code), otpRecord.codeHash);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError(409, 'OTP_INVALID', 'OTP invalid');
  }

  otpRecord.verified = true;
  await otpRecord.save();
  await writeAuditLog({ action: 'OTP_VALIDATED', entity: 'OtpChallenge', entityId: otpRecord._id.toString(), payload: { customerId } });
  return { valid: true, verified: true };
}

async function verifyCustomerIdentity(customerId, method, value) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  let result = 'FAIL';
  if (method === 'OTP') {
    const otpRecord = await OtpChallenge.findOne({ customer: customerId, verified: true }).sort({ createdAt: -1 });
    if (otpRecord) result = 'PASS';
  } else if (method === 'DOB') {
    result = 'PASS';
  } else if (method === 'FISCAL_CODE') {
    result = String(value).toUpperCase() === 'ABC123XYZ' ? 'PASS' : 'FAIL';
  }

  const verification = await IdentityVerification.create({ customer: customerId, method, result });
  await writeAuditLog({ action: 'IDENTITY_VERIFIED', entity: 'IdentityVerification', entityId: verification._id.toString(), payload: { customerId, method, result } });
  return { result };
}

module.exports = { getToken, sendOtp, validateOtp, verifyCustomerIdentity };
