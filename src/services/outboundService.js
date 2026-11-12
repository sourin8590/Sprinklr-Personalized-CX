const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const CampaignMessage = require('../models/CampaignMessage');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');
const { writeAuditLog } = require('./auditService');

async function createSegment({ name, ruleType, rule }) {
  const segment = await Segment.create({ name, ruleType, rule });
  await writeAuditLog({ action: 'SEGMENT_CREATED', entity: 'Segment', entityId: segment._id.toString(), payload: { name } });
  return segment;
}

async function getSegmentMembers(segmentId) {
  const segment = await Segment.findById(segmentId);
  if (!segment) throw new AppError(404, 'NOT_FOUND', 'Segment not found');

  const customers = await Customer.find({ tier: /./ }).lean();
  return customers.map((customer) => ({ customerId: customer._id, msisdn: customer.msisdn }));
}

async function createCampaign({ name, channel, segmentId, template, scheduledAt }) {
  const segment = await Segment.findById(segmentId);
  if (!segment) throw new AppError(404, 'NOT_FOUND', 'Segment not found');

  const campaign = await Campaign.create({
    name,
    channel,
    segment: segmentId,
    template,
    scheduledAt: scheduledAt || new Date(),
    status: 'DRAFT',
  });

  await writeAuditLog({ action: 'CAMPAIGN_CREATED', entity: 'Campaign', entityId: campaign._id.toString(), payload: { name } });
  return campaign;
}

async function launchCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new AppError(404, 'NOT_FOUND', 'Campaign not found');
  if (campaign.status === 'RUNNING') throw new AppError(409, 'CAMPAIGN_ALREADY_RUNNING', 'Campaign already running');

  campaign.status = 'RUNNING';
  await campaign.save();

  const members = await Customer.find().lean();
  for (const customer of members) {
    const bill = await Bill.findOne({ customer: customer._id }).sort({ dueDate: -1 }).lean();
    const renderedText = campaign.template
      .replace('{{name}}', customer.firstName)
      .replace('{{amount}}', bill ? bill.amount : '0')
      .replace('{{dueDate}}', bill ? bill.dueDate : new Date())
      .replace('{{plan}}', '5G Start');

    await CampaignMessage.create({
      campaign: campaign._id,
      customer: customer._id,
      renderedText,
      status: 'QUEUED',
    });
  }

  await writeAuditLog({ action: 'CAMPAIGN_LAUNCHED', entity: 'Campaign', entityId: campaign._id.toString(), payload: { campaignId } });
  return { campaignId, status: 'RUNNING', members: members.length };
}

async function getCampaignMessages(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new AppError(404, 'NOT_FOUND', 'Campaign not found');
  return CampaignMessage.find({ campaign: campaignId }).populate('customer').lean();
}

async function sendOneOffMessage({ customerId, channel, template }) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  const message = await CampaignMessage.create({
    campaign: null,
    customer: customerId,
    renderedText: template.replace('{{name}}', customer.firstName),
    status: 'SENT',
  });
  return message;
}

async function handleDeliveryWebhook({ campaignId, customerId, status }) {
  await CampaignMessage.findOneAndUpdate({ campaign: campaignId, customer: customerId }, { status, deliveredAt: new Date() });
  return { updated: true };
}

async function handleResponseWebhook({ campaignId, customerId, responseText }) {
  await CampaignMessage.findOneAndUpdate({ campaign: campaignId, customer: customerId }, { status: 'RESPONDED', responseText });
  return { updated: true };
}

module.exports = {
  createSegment,
  getSegmentMembers,
  createCampaign,
  launchCampaign,
  getCampaignMessages,
  sendOneOffMessage,
  handleDeliveryWebhook,
  handleResponseWebhook,
};
