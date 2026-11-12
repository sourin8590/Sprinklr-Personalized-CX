const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: String,
    action: { type: String, required: true },
    entity: String,
    entityId: String,
    payload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
