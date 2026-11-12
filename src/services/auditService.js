const AuditLog = require('../models/AuditLog');

async function writeAuditLog({ actor = 'system', action, entity, entityId, payload = {} }) {
  await AuditLog.create({
    actor,
    action,
    entity,
    entityId,
    payload,
  });
}

module.exports = { writeAuditLog };
