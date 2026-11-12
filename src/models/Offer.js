const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    targetPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    description: String,
    eligibilityRule: {
      minDataUsagePercent: Number,
      minTenureMonths: Number,
      tiers: [String],
    },
    validFrom: Date,
    validTo: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
