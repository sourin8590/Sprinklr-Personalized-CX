const mongoose = require('mongoose');

const planChangeSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    fromPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    toPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    consentGiven: { type: Boolean, required: true },
    consentChannel: {
      type: String,
      enum: ['IVR', 'CHAT', 'AGENT', 'WHATSAPP', 'SMS'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlanChange', planChangeSchema);
