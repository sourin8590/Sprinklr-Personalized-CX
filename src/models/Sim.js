const mongoose = require('mongoose');

const simSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    iccid: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['PHYSICAL', 'ESIM'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'LOST', 'BLOCKED', 'REPLACED'],
      default: 'ACTIVE',
    },
    activatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sim', simSchema);
