const Bill = require('../models/Bill');
const PaymentLink = require('../models/PaymentLink');
const AutopaySetting = require('../models/AutopaySetting');
const AppError = require('../utils/AppError');
const { writeAuditLog } = require('./auditService');

async function createPaymentLink(billId) {
  const bill = await Bill.findById(billId);
  if (!bill) throw new AppError(404, 'NOT_FOUND', 'Bill not found');
  if (bill.status === 'PAID') throw new AppError(409, 'BILL_ALREADY_PAID', 'Bill already paid');

  const paymentLink = await PaymentLink.create({
    bill: bill._id,
    url: `https://pay.windtre.it/link/${bill._id}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
  });

  await writeAuditLog({
    action: 'PAYMENT_LINK_CREATED',
    entity: 'PaymentLink',
    entityId: paymentLink._id.toString(),
    payload: { billId: bill._id.toString() },
  });

  return paymentLink;
}

async function setAutopay(customerId, enabled) {
  const setting = await AutopaySetting.findOneAndUpdate(
    { customer: customerId },
    { enabled, enabledAt: enabled ? new Date() : null },
    { upsert: true, new: true }
  );

  await writeAuditLog({
    action: 'AUTOPAY_UPDATED',
    entity: 'AutopaySetting',
    entityId: setting._id.toString(),
    payload: { customerId, enabled },
  });

  return setting;
}

async function getAutopay(customerId) {
  const setting = await AutopaySetting.findOne({ customer: customerId }).lean();
  if (!setting) return { customer: customerId, enabled: false };
  return setting;
}

module.exports = { createPaymentLink, setAutopay, getAutopay };
