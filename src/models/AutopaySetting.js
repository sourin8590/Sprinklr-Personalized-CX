const mongoose = require('mongoose');

const autopaySettingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    enabled: { type: Boolean, default: false },
    enabledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AutopaySetting', autopaySettingSchema);
