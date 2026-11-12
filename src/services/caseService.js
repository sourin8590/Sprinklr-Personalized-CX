const Case = require('../models/Case');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Interaction = require('../models/Interaction');
const AppError = require('../utils/AppError');
const { writeAuditLog } = require('./auditService');

async function createCase({ customerId, channel, subject, description, priority }) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const caseDoc = await Case.create({
    caseNumber: `CASE-${String(Math.floor(Math.random() * 900000) + 100000).padStart(6, '0')}`,
    customer: customerId,
    channel,
    subject,
    description,
    priority: priority || 'MEDIUM',
    slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
  });

  await writeAuditLog({ action: 'CASE_CREATED', entity: 'Case', entityId: caseDoc._id.toString(), payload: { customerId } });
  return caseDoc;
}

async function listCases({ customerId, status, page = 1, limit = 20 }) {
  const filter = {};
  if (customerId) filter.customer = customerId;
  if (status) filter.status = status;

  const docs = await Case.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean();
  const total = await Case.countDocuments(filter);
  return { items: docs, total, page, limit };
}

async function getCaseById(id) {
  const doc = await Case.findById(id).populate('assignedAgent').lean();
  if (!doc) throw new AppError(404, 'NOT_FOUND', 'Case not found');
  return doc;
}

async function updateCase(id, payload) {
  const doc = await Case.findById(id);
  if (!doc) throw new AppError(404, 'NOT_FOUND', 'Case not found');

  if (payload.assignedAgentId) {
    const agent = await Agent.findById(payload.assignedAgentId);
    if (!agent) throw new AppError(404, 'NOT_FOUND', 'Agent not found');
    doc.assignedAgent = agent._id;
  }

  if (payload.status) doc.status = payload.status;
  if (payload.priority) doc.priority = payload.priority;
  await doc.save();

  await writeAuditLog({ action: 'CASE_UPDATED', entity: 'Case', entityId: doc._id.toString(), payload: { status: doc.status } });
  return doc;
}

async function addCaseNote(id, text, author) {
  const doc = await Case.findById(id);
  if (!doc) throw new AppError(404, 'NOT_FOUND', 'Case not found');
  doc.notes.push({ author, text, createdAt: new Date() });
  await doc.save();
  await writeAuditLog({ action: 'CASE_NOTE_ADDED', entity: 'Case', entityId: doc._id.toString(), payload: { author } });
  return doc;
}

async function getCaseSla(id) {
  const doc = await Case.findById(id).lean();
  if (!doc) throw new AppError(404, 'NOT_FOUND', 'Case not found');
  return {
    caseId: doc._id,
    dueAt: doc.slaDueAt,
    status: doc.slaStatus,
    isBreached: doc.slaStatus === 'BREACHED',
  };
}

async function listInteractions(customerId) {
  return Interaction.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
}

async function createInteraction({ customerId, caseId, channel, direction, summary, transcriptRef }) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  const interaction = await Interaction.create({ customer: customerId, case: caseId, channel, direction, summary, transcriptRef });
  await writeAuditLog({ action: 'INTERACTION_CREATED', entity: 'Interaction', entityId: interaction._id.toString(), payload: { customerId } });
  return interaction;
}

async function escalateConversation({ customerId, intent, summary, context }) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const caseDoc = await Case.create({
    caseNumber: `CASE-${String(Math.floor(Math.random() * 900000) + 100000).padStart(6, '0')}`,
    customer: customerId,
    channel: 'CHAT',
    subject: intent,
    description: summary,
    priority: 'HIGH',
    slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 3),
  });

  return {
    queue: 'VIP_SUPPORT',
    handoff: {
      caseId: caseDoc._id,
      customerId,
      intent,
      context,
      queue: 'VIP_SUPPORT',
    },
  };
}

module.exports = {
  createCase,
  listCases,
  getCaseById,
  updateCase,
  addCaseNote,
  getCaseSla,
  listInteractions,
  createInteraction,
  escalateConversation,
};
