const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const UsageRecord = require('../models/UsageRecord');
const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');
const maskMsisdn = require('../utils/maskMsisdn');

async function getIvrContext(ani) {
  const customer = await Customer.findOne({ msisdn: ani }).lean();
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const subscription = await Subscription.findOne({ customer: customer._id, status: 'ACTIVE' }).populate('plan').lean();
  const usage = await UsageRecord.findOne({ customer: customer._id }).sort({ periodEnd: -1 }).lean();
  const bill = await Bill.findOne({ customer: customer._id }).sort({ dueDate: -1 }).lean();

  return {
    greetingName: `${customer.firstName} ${customer.lastName}`,
    maskedMsisdn: maskMsisdn(customer.msisdn),
    billAmount: bill ? bill.amount : 0,
    dataLeft: usage ? Number(usage.dataTotalGb) - Number(usage.dataUsedGb) : 0,
    plan: subscription?.plan?.name || 'Unknown',
    menuOptions: ['Pay bill', 'Check usage', 'Upgrade plan', 'Speak to agent'],
  };
}

async function chatbotFulfillment({ intent, customerId, params = {} }) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const subscription = await Subscription.findOne({ customer: customerId, status: 'ACTIVE' }).populate('plan').lean();
  const usage = await UsageRecord.findOne({ customer: customerId }).sort({ periodEnd: -1 }).lean();
  const bill = await Bill.findOne({ customer: customerId }).sort({ dueDate: -1 }).lean();

  const responses = {
    CHECK_BILL: { intent, summary: `Current bill is EUR ${bill?.amount || 0}.`, customerName: `${customer.firstName} ${customer.lastName}` },
    CHECK_USAGE: { intent, summary: `You have ${usage ? Number(usage.dataTotalGb) - Number(usage.dataUsedGb) : 0} GB left.`, customerName: `${customer.firstName} ${customer.lastName}` },
    UPGRADE_PLAN: { intent, summary: `Upgrade available to ${subscription?.plan?.name || 'next-tier plan'}.`, customerName: `${customer.firstName} ${customer.lastName}` },
    CONFIRM_UPGRADE: { intent, summary: 'Upgrade confirmed and queued.', customerName: `${customer.firstName} ${customer.lastName}` },
    SPEAK_TO_AGENT: { intent, summary: 'Escalating to a live agent.', customerName: `${customer.firstName} ${customer.lastName}` },
  };

  return responses[intent] || { intent, summary: 'No action taken.' };
}

module.exports = { getIvrContext, chatbotFulfillment };
