const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    ruleType: {
      type: String,
      enum: ['OVERDUE', 'UPGRADE_ELIGIBLE', 'CUSTOM'],
      required: true,
    },
    rule: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Segment', segmentSchema);
