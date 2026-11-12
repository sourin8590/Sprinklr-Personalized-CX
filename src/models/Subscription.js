const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    startDate: { type: Date, required: true },
    endDate: Date,
  },
  { timestamps: true }
);

subscriptionSchema.index({ customer: 1, status: 1 }, { unique: false });

module.exports = mongoose.model('Subscription', subscriptionSchema);
