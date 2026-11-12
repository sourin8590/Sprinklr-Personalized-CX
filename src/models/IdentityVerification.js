const mongoose = require('mongoose');

const identityVerificationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    method: {
      type: String,
      enum: ['OTP', 'DOB', 'FISCAL_CODE'],
      required: true,
    },
    result: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IdentityVerification', identityVerificationSchema);
