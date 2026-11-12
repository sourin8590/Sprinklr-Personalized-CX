const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    codeHash: { type: String, required: true },
    channel: {
      type: String,
      enum: ['SMS', 'EMAIL', 'VOICE'],
      default: 'SMS',
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, max: 3 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);
