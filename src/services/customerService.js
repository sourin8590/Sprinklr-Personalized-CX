const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const UsageRecord = require('../models/UsageRecord');
const Bill = require('../models/Bill');
const Case = require('../models/Case');
const Interaction = require('../models/Interaction');
const Offer = require('../models/Offer');
const Sim = require('../models/Sim');
const AppError = require('../utils/AppError');
const maskMsisdn = require('../utils/maskMsisdn');
const { writeAuditLog } = require('./auditService');

async function lookupCustomerByMsisdn(msisdn) {
  const customer = await Customer.findOne({ msisdn }).lean();
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  return {
    id: customer._id,
    name: `${customer.firstName} ${customer.lastName}`,
    tier: customer.tier,
    msisdn: maskMsisdn(customer.msisdn),
  };
}

async function getCustomerProfile(customerId) {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  return { ...customer, msisdn: maskMsisdn(customer.msisdn) };
}

async function getCustomerPlan(customerId) {
  const subscription = await Subscription.findOne({ customer: customerId, status: 'ACTIVE' }).populate('plan').lean();
  if (!subscription) throw new AppError(404, 'NOT_FOUND', 'Customer plan not found');
  return subscription.plan;
}

async function getCustomerUsage(customerId) {
  const usage = await UsageRecord.findOne({ customer: customerId }).sort({ periodEnd: -1 }).lean();
  if (!usage) throw new AppError(404, 'NOT_FOUND', 'Usage record not found');
  return {
    ...usage,
    dataLeftGb: Number(usage.dataTotalGb) - Number(usage.dataUsedGb),
  };
}

async function getLatestBill(customerId) {
  const bill = await Bill.findOne({ customer: customerId }).sort({ dueDate: -1 }).lean();
  if (!bill) throw new AppError(404, 'NOT_FOUND', 'Bill not found');
  return bill;
}

async function getBills(customerId, status) {
  const query = { customer: customerId };
  if (status) query.status = status;
  return Bill.find(query).sort({ dueDate: -1 }).lean();
}

async function getCustomer360(customerId) {
  const [profile, plan, usage, latestBill, openCases, recentInteractions] = await Promise.all([
    Customer.findById(customerId).lean(),
    Subscription.findOne({ customer: customerId, status: 'ACTIVE' }).populate('plan').lean(),
    UsageRecord.findOne({ customer: customerId }).sort({ periodEnd: -1 }).lean(),
    Bill.findOne({ customer: customerId }).sort({ dueDate: -1 }).lean(),
    Case.find({ customer: customerId, status: { $ne: 'CLOSED' } }).lean(),
    Interaction.find({ customer: customerId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  if (!profile) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const channelsUsedToday = await Interaction.distinct('channel', {
    customer: customerId,
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  const nextBestAction = `Review ${latestBill && latestBill.status !== 'PAID' ? 'billing' : 'service'} path for ${profile.firstName}`;

  return {
    profile: { ...profile, msisdn: maskMsisdn(profile.msisdn) },
    plan: plan ? plan.plan : null,
    usage: usage ? { ...usage, dataLeftGb: Number(usage.dataTotalGb) - Number(usage.dataUsedGb) } : null,
    latestBill,
    openCases,
    recentInteractions,
    channelsUsedToday,
    slaStatus: 'WITHIN',
    nextBestAction,
  };
}

async function getOffers(customerId) {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const plans = await Plan.find({ active: true }).lean();
  const usage = await UsageRecord.findOne({ customer: customerId }).sort({ periodEnd: -1 }).lean();

  const offers = await Offer.find({ active: true }).populate('targetPlan').lean();
  return offers.filter((offer) => {
    const usagePercent = usage ? (Number(usage.dataUsedGb) / Number(usage.dataTotalGb)) * 100 : 0;
    const isEligible = (!offer.eligibilityRule || usagePercent >= (offer.eligibilityRule.minDataUsagePercent || 0));
    return isEligible && (!offer.eligibilityRule?.tiers?.length || offer.eligibilityRule.tiers.includes(customer.tier));
  }).map((offer) => ({
    code: offer.code,
    title: offer.title,
    targetPlan: offer.targetPlan,
    description: offer.description,
  }));
}

async function getNextBestAction(customerId) {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const latestBill = await Bill.findOne({ customer: customerId }).sort({ dueDate: -1 }).lean();
  const usage = await UsageRecord.findOne({ customer: customerId }).sort({ periodEnd: -1 }).lean();
  const plan = await Subscription.findOne({ customer: customerId, status: 'ACTIVE' }).populate('plan').lean();

  if (latestBill && latestBill.status !== 'PAID') {
    return {
      action: 'BILL_PAYMENT',
      title: 'Pay overdue bill',
      details: [`Due: ${latestBill.amount} ${latestBill.currency}`],
    };
  }

  if (usage && Number(usage.dataUsedGb) / Number(usage.dataTotalGb) > 0.8) {
    return {
      action: 'UPGRADE_PLAN',
      title: 'Upgrade for more data',
      details: [`Current plan: ${plan?.plan?.name || 'Unknown'}`],
    };
  }

  return {
    action: 'NO_ACTION',
    title: 'No immediate action',
    details: ['Customer is within policy thresholds'],
  };
}

async function changePlan(customerId, targetPlanCode, consent, channel, idempotencyKey) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  if (!consent) throw new AppError(409, 'CONSENT_REQUIRED', 'Customer consent is required');

  const subscription = await Subscription.findOne({ customer: customerId, status: 'ACTIVE' }).populate('plan');
  if (!subscription) throw new AppError(404, 'NOT_FOUND', 'No active subscription');

  const targetPlan = await Plan.findOne({ code: targetPlanCode, active: true });
  if (!targetPlan) throw new AppError(404, 'NOT_FOUND', 'Plan not found');

  if (String(subscription.plan._id) === String(targetPlan._id)) {
    throw new AppError(409, 'PLAN_ALREADY_ACTIVE', 'Target plan is already active');
  }

  if (idempotencyKey) {
    const existingKey = await require('../models/IdempotencyKey').findOne({ key: idempotencyKey }).lean();
    if (existingKey) {
      throw new AppError(409, 'DUPLICATE_IDEMPOTENCY_KEY', 'Duplicate idempotency key');
    }
  }

  const planChange = await require('../models/PlanChange').create({
    customer: customerId,
    fromPlan: subscription.plan._id,
    toPlan: targetPlan._id,
    consentGiven: consent,
    consentChannel: channel,
    status: 'COMPLETED',
    idempotencyKey,
  });

  subscription.plan = targetPlan._id;
  await subscription.save();

  await require('../models/IdempotencyKey').create({
    key: idempotencyKey,
    responseBody: { success: true, data: { planChangeId: planChange._id, toPlan: targetPlan.code }, requestId: 'idempotent' },
    statusCode: 200,
    data: { planChangeId: planChange._id },
  });

  await writeAuditLog({
    action: 'PLAN_CHANGED',
    entity: 'PlanChange',
    entityId: planChange._id.toString(),
    payload: { customerId, fromPlan: subscription.plan._id.toString(), toPlan: targetPlan._id.toString(), consent, channel },
  });

  return { planChangeId: planChange._id, toPlan: targetPlan.code };
}

module.exports = {
  lookupCustomerByMsisdn,
  getCustomerProfile,
  getCustomerPlan,
  getCustomerUsage,
  getLatestBill,
  getBills,
  getCustomer360,
  getOffers,
  getNextBestAction,
  changePlan,
};
