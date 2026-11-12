const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    channel: {
      type: String,
      enum: ['SMS', 'VOICE', 'WHATSAPP'],
      required: true,
    },
    segment: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
    template: { type: String, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'RUNNING', 'COMPLETED'],
      default: 'DRAFT',
    },
    scheduledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
