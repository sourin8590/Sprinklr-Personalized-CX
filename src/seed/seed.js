const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const env = require('../config/env');
const Customer = require('../models/Customer');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const UsageRecord = require('../models/UsageRecord');
const Bill = require('../models/Bill');
const PaymentLink = require('../models/PaymentLink');
const AutopaySetting = require('../models/AutopaySetting');
const Sim = require('../models/Sim');
const SimReplacement = require('../models/SimReplacement');
const Agent = require('../models/Agent');
const ApiKey = require('../models/ApiKey');
const Offer = require('../models/Offer');
const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const CampaignMessage = require('../models/CampaignMessage');
const Case = require('../models/Case');
const Interaction = require('../models/Interaction');

async function clearCollections() {
  await Promise.all([
    Customer.deleteMany({}),
    Plan.deleteMany({}),
    Subscription.deleteMany({}),
    UsageRecord.deleteMany({}),
    Bill.deleteMany({}),
    PaymentLink.deleteMany({}),
    AutopaySetting.deleteMany({}),
    Sim.deleteMany({}),
    SimReplacement.deleteMany({}),
    Agent.deleteMany({}),
    ApiKey.deleteMany({}),
    Offer.deleteMany({}),
    Segment.deleteMany({}),
    Campaign.deleteMany({}),
    CampaignMessage.deleteMany({}),
    Case.deleteMany({}),
    Interaction.deleteMany({}),
  ]);
}

async function seed() {
  await connectDB();
  await clearCollections();

  const plans = await Plan.insertMany([
    { code: '5G_START', name: '5G Start', monthlyPrice: 14.99, currency: 'EUR', dataGb: 25, euRoaming: false, priority5g: false, active: true },
    { code: '5G_MAX', name: '5G Max', monthlyPrice: 19.99, currency: 'EUR', dataGb: 200, euRoaming: true, priority5g: true, active: true },
    { code: 'UNLIMITED_PLUS', name: 'Unlimited Plus', monthlyPrice: 29.99, currency: 'EUR', dataGb: 300, euRoaming: true, priority5g: true, active: true },
    { code: 'FAMILY_5G', name: 'Family 5G', monthlyPrice: 39.99, currency: 'EUR', dataGb: 500, euRoaming: true, priority5g: true, active: true },
  ]);

  const planMap = Object.fromEntries(plans.map((plan) => [plan.code, plan]));

  const customer = await Customer.create({
    customerCode: 'C1001',
    msisdn: '3331239821',
    firstName: 'Anuj',
    lastName: 'Panwar',
    email: 'anuj.panwar@windtre.it',
    tier: 'PREMIUM',
    language: 'it',
    isVerified: true,
  });

  const extraCustomers = await Customer.insertMany([
    { customerCode: 'C1002', msisdn: '3331239822', firstName: 'Maria', lastName: 'Rossi', email: 'maria.rossi@windtre.it', tier: 'STANDARD', language: 'it', isVerified: true },
    { customerCode: 'C1003', msisdn: '3331239823', firstName: 'Luca', lastName: 'Bianchi', email: 'luca.bianchi@windtre.it', tier: 'PREMIUM', language: 'it', isVerified: true },
    { customerCode: 'C1004', msisdn: '3331239824', firstName: 'Giulia', lastName: 'Verdi', email: 'giulia.verdi@windtre.it', tier: 'STANDARD', language: 'it', isVerified: false },
    { customerCode: 'C1005', msisdn: '3331239825', firstName: 'Paolo', lastName: 'Neri', email: 'paolo.neri@windtre.it', tier: 'PREMIUM', language: 'it', isVerified: true },
    { customerCode: 'C1006', msisdn: '3331239826', firstName: 'Sara', lastName: 'Gialli', email: 'sara.gialli@windtre.it', tier: 'STANDARD', language: 'it', isVerified: true },
    { customerCode: 'C1007', msisdn: '3331239827', firstName: 'Matteo', lastName: 'Cerri', email: 'matteo.cerri@windtre.it', tier: 'PREMIUM', language: 'it', isVerified: true },
    { customerCode: 'C1008', msisdn: '3331239828', firstName: 'Chiara', lastName: 'Moretti', email: 'chiara.moretti@windtre.it', tier: 'STANDARD', language: 'it', isVerified: false },
    { customerCode: 'C1009', msisdn: '3331239829', firstName: 'Marco', lastName: 'Esposito', email: 'marco.esposito@windtre.it', tier: 'PREMIUM', language: 'it', isVerified: true },
    { customerCode: 'C1010', msisdn: '3331239830', firstName: 'Elena', lastName: 'Romano', email: 'elena.romano@windtre.it', tier: 'STANDARD', language: 'it', isVerified: true },
    { customerCode: 'C1011', msisdn: '3331239831', firstName: 'Davide', lastName: 'Costa', email: 'davide.costa@windtre.it', tier: 'PREMIUM', language: 'it', isVerified: true },
  ]);

  const allCustomers = [customer, ...extraCustomers];

  const subscription = await Subscription.create({
    customer: customer._id,
    plan: planMap['5G_START']._id,
    status: 'ACTIVE',
    startDate: new Date('2025-01-01'),
    endDate: null,
  });

  await Subscription.insertMany(allCustomers.slice(1).map((customerDoc, index) => ({
    customer: customerDoc._id,
    plan: index % 2 === 0 ? planMap['5G_START']._id : planMap['5G_MAX']._id,
    status: 'ACTIVE',
    startDate: new Date('2025-02-01'),
  })));

  await UsageRecord.create({
    customer: customer._id,
    periodStart: new Date('2026-11-01T00:00:00.000Z'),
    periodEnd: new Date('2026-11-30T00:00:00.000Z'),
    dataTotalGb: 25,
    dataUsedGb: 16.5,
    minutesUsed: 120,
    smsUsed: 45,
  });

  for (const customerDoc of allCustomers.slice(1)) {
    const usage = customerDoc.tier === 'PREMIUM' ? 12 : 20;
    await UsageRecord.create({
      customer: customerDoc._id,
      periodStart: new Date('2026-11-01T00:00:00.000Z'),
      periodEnd: new Date('2026-11-30T00:00:00.000Z'),
      dataTotalGb: customerDoc.tier === 'PREMIUM' ? 200 : 25,
      dataUsedGb: usage,
      minutesUsed: 50,
      smsUsed: 20,
    });
  }

  const dueBill = await Bill.create({
    customer: customer._id,
    amount: 34.9,
    currency: 'EUR',
    issueDate: new Date('2026-11-01T00:00:00.000Z'),
    dueDate: new Date('2026-11-18T00:00:00.000Z'),
    status: 'DUE',
  });

  await Bill.insertMany([
    { customer: allCustomers[1]._id, amount: 48.2, currency: 'EUR', issueDate: new Date(), dueDate: new Date(Date.now() - 86400000), status: 'OVERDUE' },
    { customer: allCustomers[2]._id, amount: 12.3, currency: 'EUR', issueDate: new Date(), dueDate: new Date(Date.now() + 86400000), status: 'DUE' },
    { customer: allCustomers[3]._id, amount: 59.4, currency: 'EUR', issueDate: new Date(), dueDate: new Date(Date.now() - 86400000), status: 'OVERDUE' },
    { customer: allCustomers[4]._id, amount: 21.1, currency: 'EUR', issueDate: new Date(), dueDate: new Date(Date.now() + 86400000), status: 'DUE' },
  ]);

  await PaymentLink.create({ bill: dueBill._id, url: 'https://pay.windtre.it/link/123', expiresAt: new Date(Date.now() + 86400000), status: 'ACTIVE' });

  await AutopaySetting.create({ customer: customer._id, enabled: false });

  const sim = await Sim.create({
    customer: customer._id,
    iccid: '8930012345678901234',
    type: 'PHYSICAL',
    status: 'ACTIVE',
    activatedAt: new Date('2025-01-10T00:00:00.000Z'),
  });

  await Sim.insertMany(allCustomers.slice(1).map((customerDoc, idx) => ({
    customer: customerDoc._id,
    iccid: `8900000000${idx + 1}`,
    type: idx % 2 === 0 ? 'PHYSICAL' : 'ESIM',
    status: 'ACTIVE',
    activatedAt: new Date('2024-11-01T00:00:00.000Z'),
  })));

  const simReplacement = await SimReplacement.create({
    requestCode: 'SIMR-000123',
    customer: customer._id,
    oldSim: sim._id,
    reason: 'LOST',
    simType: 'PHYSICAL',
    deliveryAddress: {
      street: 'Via Roma 45',
      city: 'Milan',
      postalCode: '20100',
      province: 'MI',
    },
    status: 'SUBMITTED',
  });

  await Case.create({
    caseNumber: 'CASE-000045',
    customer: customer._id,
    channel: 'VOICE',
    subject: 'SIM replacement lost',
    description: 'Customer reported lost physical SIM and needs replacement.',
    status: 'OPEN',
    priority: 'HIGH',
    slaDueAt: new Date(Date.now() + 86400000),
    slaStatus: 'AT_RISK',
    notes: [{ author: 'IVR', text: 'Customer validated identity via OTP', createdAt: new Date() }],
  });

  const agents = await Agent.insertMany([
    { name: 'Alice Rossi', email: 'alice.rossi@windtre.it', queue: 'VOICE' },
    { name: 'Marco Bellini', email: 'marco.bellini@windtre.it', queue: 'CHAT' },
  ]);

  const offer1 = await Offer.create({
    code: 'UPGRADE_5G_MAX',
    title: 'Upgrade to 5G Max',
    targetPlan: planMap['5G_MAX']._id,
    description: 'More data and EU roaming',
    eligibilityRule: { minDataUsagePercent: 70, minTenureMonths: 6, tiers: ['PREMIUM', 'STANDARD'] },
    validFrom: new Date(),
    validTo: new Date(Date.now() + 2592000000),
    active: true,
  });

  await Offer.insertMany([
    { code: 'FAMILY_BUNDLE', title: 'Family bundle', targetPlan: planMap['FAMILY_5G']._id, description: 'Best suited for multi-line families', eligibilityRule: { minDataUsagePercent: 50, tiers: ['PREMIUM'] }, validFrom: new Date(), validTo: new Date(Date.now() + 2592000000), active: true },
    { code: 'UPGRADE_UNLIMITED', title: 'Unlimited plan promotion', targetPlan: planMap['UNLIMITED_PLUS']._id, description: 'Faster speeds for heavy users', eligibilityRule: { minDataUsagePercent: 80, tiers: ['PREMIUM'] }, validFrom: new Date(), validTo: new Date(Date.now() + 2592000000), active: true },
  ]);

  const segment = await Segment.create({
    name: 'OVERDUE_CUSTOMERS',
    ruleType: 'OVERDUE',
    rule: { overdue: true },
  });

  const campaign = await Campaign.create({
    name: 'Q4 bill reminder',
    channel: 'SMS',
    segment: segment._id,
    template: 'Hi {{name}}, your bill of {{amount}} EUR is due on {{dueDate}}. Please review your plan {{plan}}.',
    status: 'DRAFT',
  });

  await CampaignMessage.create({
    campaign: campaign._id,
    customer: customer._id,
    renderedText: 'Hi Anuj, your bill of 34.90 EUR is due on 2026-11-18. Please review your plan 5G Start.',
    status: 'QUEUED',
  });

  await Interaction.insertMany([
    { customer: customer._id, channel: 'VOICE', direction: 'INBOUND', summary: 'Customer checked billing', transcriptRef: 'voice-001' },
    { customer: customer._id, channel: 'CHAT', direction: 'INBOUND', summary: 'Customer asked about SIM replacement', transcriptRef: 'chat-001' },
  ]);

  const plainApiKey = 'windtre-demo-api-key-123';
  await ApiKey.create({
    name: 'sprinklr-demo',
    keyHash: await bcrypt.hash(plainApiKey, env.API_KEY_SALT_ROUNDS),
    scopes: ['*'],
    active: true,
  });

  console.log('Seed data created successfully.');
  console.log('API key (save this once):', plainApiKey);
  console.log('Demo token credentials: client_id=sprinklr-demo-client client_secret=' + plainApiKey);

  if (require.main === module) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
}

module.exports = { seed };
