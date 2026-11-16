const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      default: () => `B-${randomBytes(5).toString('hex').toUpperCase()}`,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PAID', 'DUE', 'OVERDUE'],
      default: 'DUE',
    },
  },
  { timestamps: true }
);

billSchema.index({ customer: 1, dueDate: 1 });
billSchema.index({ customer: 1, issueDate: 1 });
billSchema.index({ billNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Bill', billSchema);
