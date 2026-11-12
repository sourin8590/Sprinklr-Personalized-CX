const Sim = require('../models/Sim');
const SimReplacement = require('../models/SimReplacement');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const { writeAuditLog } = require('./auditService');

async function getCustomerSim(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  const sim = await Sim.findOne({ customer: customerId }).lean();
  if (!sim) return null;
  return sim;
}

async function getSimReplacementEligibility(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const sim = await Sim.findOne({ customer: customerId });
  if (!sim) throw new AppError(404, 'NOT_FOUND', 'SIM not found');

  return {
    eligible: true,
    reasons: ['LOST', 'DAMAGED', 'STOLEN', 'UPGRADE'],
    currentSimStatus: sim.status,
  };
}

async function requestSimReplacement({ customerId, reason, simType, deliveryAddress }, idempotencyKey) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const sim = await Sim.findOne({ customer: customerId });
  if (!sim) throw new AppError(409, 'NOT_ELIGIBLE_FOR_SIM_REPLACEMENT', 'No SIM attached to this customer');
  if (sim.status === 'REPLACED') throw new AppError(409, 'SIM_ALREADY_REPLACED', 'SIM already replaced');

  if (simType === 'PHYSICAL' && (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode || !deliveryAddress.province)) {
    throw new AppError(409, 'DELIVERY_ADDRESS_REQUIRED', 'Delivery address required for physical SIM replacement');
  }

  const existing = await SimReplacement.findOne({ customer: customerId, status: { $in: ['SUBMITTED', 'PROCESSING'] } });
  if (existing) throw new AppError(409, 'SIM_ALREADY_REPLACED', 'An active replacement is already in progress');

  const replacement = await SimReplacement.create({
    requestCode: `SIMR-${String(Math.floor(Math.random() * 900000) + 100000).padStart(6, '0')}`,
    customer: customerId,
    oldSim: sim._id,
    reason,
    simType,
    deliveryAddress: simType === 'PHYSICAL' ? deliveryAddress : undefined,
    esimActivationCode: simType === 'ESIM' ? 'ESIM-123456' : undefined,
    idempotencyKey,
  });

  if (idempotencyKey) {
    await require('../models/IdempotencyKey').create({
      key: idempotencyKey,
      responseBody: { success: true, data: { requestCode: replacement.requestCode }, requestId: 'idem' },
      statusCode: 200,
      data: { requestCode: replacement.requestCode },
    });
  }

  await writeAuditLog({
    action: 'SIM_REPLACEMENT_REQUESTED',
    entity: 'SimReplacement',
    entityId: replacement._id.toString(),
    payload: { customerId, reason, simType },
  });

  return replacement;
}

async function getSimReplacementByRequestCode(requestCode) {
  const replacement = await SimReplacement.findOne({ requestCode }).populate('customer').populate('oldSim').lean();
  if (!replacement) throw new AppError(404, 'NOT_FOUND', 'Replacement request not found');
  return replacement;
}

module.exports = { getCustomerSim, getSimReplacementEligibility, requestSimReplacement, getSimReplacementByRequestCode };
