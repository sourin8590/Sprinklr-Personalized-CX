const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    msisdn: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{10}$/,
      trim: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    tier: {
      type: String,
      enum: ['STANDARD', 'PREMIUM'],
      default: 'STANDARD',
    },
    language: { type: String, default: 'it' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
