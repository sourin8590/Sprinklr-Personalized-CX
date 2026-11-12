const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
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

module.exports = mongoose.model('Bill', billSchema);
