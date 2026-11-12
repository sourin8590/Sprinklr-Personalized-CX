const mongoose = require('mongoose');

const campaignMessageSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    renderedText: { type: String, required: true },
    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RESPONDED'],
      default: 'QUEUED',
    },
    responseText: String,
    sentAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('CampaignMessage', campaignMessageSchema);
