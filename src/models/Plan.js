const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    monthlyPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EUR' },
    dataGb: { type: Number, required: true },
    euRoaming: { type: Boolean, default: false },
    priority5g: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
