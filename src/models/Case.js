const mongoose = require('mongoose');

const caseNoteSchema = new mongoose.Schema(
  {
    author: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    channel: {
      type: String,
      enum: ['VOICE', 'CHAT', 'EMAIL', 'SOCIAL', 'SMS', 'WHATSAPP'],
      required: true,
    },
    subject: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    slaDueAt: Date,
    slaStatus: {
      type: String,
      enum: ['WITHIN', 'AT_RISK', 'BREACHED'],
      default: 'WITHIN',
    },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    notes: [caseNoteSchema],
  },
  { timestamps: true }
);

caseSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('Case', caseSchema);
