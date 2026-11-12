const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    queue: { type: String, default: 'GENERAL' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);
