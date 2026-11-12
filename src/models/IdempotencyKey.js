const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    responseBody: mongoose.Schema.Types.Mixed,
    statusCode: Number,
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);
