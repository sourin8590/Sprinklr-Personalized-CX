const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

jest.setTimeout(120000);

let app;
let token;
let customerId;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.MOCK_OTP = 'true';
  process.env.MOCK_OTP_CODE = '123456';

  app = require('../src/app');
  await require('../src/config/db').connectDB();
  await require('../src/seed/seed').seed();

  const authResponse = await request(app)
    .post('/api/v1/auth/token')
    .send({ client_id: 'sprinklr-demo-client', client_secret: 'windtre-demo-api-key-123' });

  token = authResponse.body.data.token;

  const lookupResponse = await request(app)
    .get('/api/v1/customers/lookup?msisdn=3331239821')
    .set('Authorization', `Bearer ${token}`);

  customerId = lookupResponse.body.data.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Windtre mock backend', () => {
  test('IVR context is returned for the ANI lookup', async () => {
    const response = await request(app)
      .get('/api/v1/ivr/context?ani=3331239821')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.greetingName).toContain('Anuj');
    expect(response.body.data.maskedMsisdn).toMatch(/\*+9821$/);
    expect(response.body.data.dataLeft).toBeGreaterThan(0);
  });

  test('plan change succeeds when consent is granted', async () => {
    const response = await request(app)
      .post(`/api/v1/customers/${customerId}/plan-change`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'plan-change-ok-1')
      .send({ targetPlanCode: '5G_MAX', consent: true, channel: 'IVR' });

    expect(response.status).toBe(200);
    expect(response.body.data.toPlan).toBe('5G_MAX');
  });

  test('plan change rejects when consent is missing', async () => {
    const response = await request(app)
      .post(`/api/v1/customers/${customerId}/plan-change`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'plan-change-no-consent')
      .send({ targetPlanCode: 'UNLIMITED_PLUS', consent: false, channel: 'CHAT' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONSENT_REQUIRED');
  });

  test('SIM replacement workflow completes end to end', async () => {
    const altCustomerLookup = await request(app)
      .get('/api/v1/customers/lookup?msisdn=3331239822')
      .set('Authorization', `Bearer ${token}`);

    const replacementCustomerId = altCustomerLookup.body.data.id;

    const eligibility = await request(app)
      .get(`/api/v1/customers/${replacementCustomerId}/sim-replacement/eligibility`)
      .set('Authorization', `Bearer ${token}`);

    expect(eligibility.status).toBe(200);
    expect(eligibility.body.data.eligible).toBe(true);

    const replacement = await request(app)
      .post('/api/v1/sim-replacement')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'sim-replacement-1')
      .send({
        customerId: replacementCustomerId,
        reason: 'LOST',
        simType: 'PHYSICAL',
        deliveryAddress: {
          street: 'Via Roma 45',
          city: 'Milan',
          postalCode: '20100',
          province: 'MI',
        },
      });

    expect(replacement.status).toBe(200);
    expect(replacement.body.data.requestCode).toBeTruthy();

    const fetchReplacement = await request(app)
      .get(`/api/v1/sim-replacement/${replacement.body.data.requestCode}`)
      .set('Authorization', `Bearer ${token}`);

    expect(fetchReplacement.status).toBe(200);
    expect(fetchReplacement.body.data.requestCode).toBe(replacement.body.data.requestCode);
  });

  test('OTP flow validates and verifies identity', async () => {
    const send = await request(app)
      .post('/api/v1/identity/otp/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId, channel: 'SMS' });

    expect(send.status).toBe(200);
    const sixDigitCode = send.body.data.otpCode;

    const validate = await request(app)
      .post('/api/v1/identity/otp/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId, code: sixDigitCode });

    expect(validate.status).toBe(200);
    expect(validate.body.data.verified).toBe(true);

    const verify = await request(app)
      .post('/api/v1/identity/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId, method: 'OTP', value: 'OTP' });

    expect(verify.status).toBe(200);
    expect(verify.body.data.result).toBe('PASS');
  });

  test('outbound campaign can be created and launched', async () => {
    const segment = await request(app)
      .post('/api/v1/segments')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'VIP_BILLING', ruleType: 'OVERDUE', rule: { overdue: true } });

    expect(segment.status).toBe(201);

    const campaign = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Late bill reminder',
        channel: 'SMS',
        segmentId: segment.body.data._id,
        template: 'Hi {{name}}, your invoice is {{amount}} EUR due {{dueDate}}.',
      });

    expect(campaign.status).toBe(201);

    const launch = await request(app)
      .post(`/api/v1/campaigns/${campaign.body.data._id}/launch`)
      .set('Authorization', `Bearer ${token}`);

    expect(launch.status).toBe(200);
    expect(launch.body.data.status).toBe('RUNNING');

    const messages = await request(app)
      .get(`/api/v1/campaigns/${campaign.body.data._id}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(messages.status).toBe(200);
    expect(messages.body.data.items.length).toBeGreaterThan(0);
  });

  test('case creation records a valid case', async () => {
    const response = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        channel: 'VOICE',
        subject: 'Billing question',
        description: 'Customer needs a billing summary.',
        priority: 'HIGH',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.caseNumber).toMatch(/CASE-/);
  });

  test('validation and missing auth return the expected errors', async () => {
    const validationResponse = await request(app)
      .post('/api/v1/auth/token')
      .send({ client_secret: 'missing-client-id' });

    expect(validationResponse.status).toBe(400);
    expect(validationResponse.body.error.code).toBe('VALIDATION_ERROR');

    const authResponse = await request(app)
      .get('/api/v1/customers/lookup?msisdn=3331239821');

    expect(authResponse.status).toBe(401);
    expect(authResponse.body.error.code).toBe('UNAUTHORIZED');
  });

  test('404 and duplicate idempotency are surfaced correctly', async () => {
    const missing = await request(app)
      .get('/api/v1/customers/000000000000000000000000/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    const a = await request(app)
      .post(`/api/v1/customers/${customerId}/plan-change`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'duplicate-key-123')
      .send({ targetPlanCode: 'UNLIMITED_PLUS', consent: true, channel: 'AGENT' });

    const b = await request(app)
      .post(`/api/v1/customers/${customerId}/plan-change`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'duplicate-key-123')
      .send({ targetPlanCode: 'FAMILY_5G', consent: true, channel: 'AGENT' });

    expect(a.status).toBe(200);
    expect(b.status).toBe(409);
    expect(b.body.error.code).toBe('DUPLICATE_IDEMPOTENCY_KEY');
  });

  test('rate limiting rejects the second request when configured low', async () => {
    jest.resetModules();
    const env = require('../src/config/env');
    env.RATE_LIMIT_MAX = 1;
    const capturedApp = require('../src/app');

    const first = await request(capturedApp)
      .get('/api/v1/health')
      .set('Authorization', `Bearer ${token}`);

    const second = await request(capturedApp)
      .get('/api/v1/health')
      .set('Authorization', `Bearer ${token}`);

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
  });

  test('Vercel forwarded client IP is accepted by the rate limiter', async () => {
    const previousVercel = process.env.VERCEL;
    process.env.VERCEL = '1';
    jest.resetModules();
    const vercelApp = require('../src/app');
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;

    const response = await request(vercelApp)
      .get('/docs/')
      .set('X-Forwarded-For', '203.0.113.10');

    expect(response.status).toBe(200);
  });
});
