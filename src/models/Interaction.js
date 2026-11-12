const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    channel: {
      type: String,
      enum: ['VOICE', 'CHAT', 'EMAIL', 'SOCIAL', 'SMS', 'WHATSAPP'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['INBOUND', 'OUTBOUND'],
      required: true,
    },
    summary: String,
    transcriptRef: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interaction', interactionSchema);
