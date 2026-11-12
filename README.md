# Windtre Mock Backend for Sprinklr Training

This project provides a runnable, fake WINDTRE Italy telecom backend intended for Sprinklr CCaaS training and integration demos. It exposes a realistic set of telecom APIs for customer lookup, billing, identity verification, plan changes, SIM replacement, IVR context, outbound campaigns, and case management using seed data only.

## Features

- Express + MongoDB mock backend with JWT-based auth
- Seeded telecom customer and billing data
- IVR context and chatbot flow endpoints
- OTP verification and identity validation APIs
- Sim replacement eligibility and request tracking
- Outbound campaign creation and launch flows
- Case and interaction management
- Rate limiting, validation middleware, and structured error responses

## Quick start

1. Install dependencies:
   npm install

2. Copy environment file:
   copy .env.example .env

3. Start the API:
   npm start

4. Seed the database with demo data:
   npm run seed

5. Run the test suite:
   npm test

## Local URLs

- API base: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/docs
- Health: http://localhost:3000/health

## Environment variables

The project loads configuration from `.env` via the config helper. Key settings:

- PORT=3000
- NODE_ENV=development
- MONGODB_URI=mongodb://localhost:27017/windtre-mock
- JWT_SECRET=change-me
- JWT_EXPIRES_IN=1h
- MOCK_OTP=true
- MOCK_OTP_CODE=123456
- MOCK_LATENCY_MS=0
- MOCK_FAILURE_RATE=0
- RATE_LIMIT_WINDOW_MS=60000
- RATE_LIMIT_MAX=120

## Authentication

Obtain a token from:

- POST /api/v1/auth/token

Example body:

```json
{
  "client_id": "sprinklr-demo-client",
  "client_secret": "windtre-demo-api-key-123"
}
```

Use the returned JWT in the Authorization header:

```http
Authorization: Bearer <token>
```

## Main routes

### Auth
- POST /api/v1/auth/token

### Customer and billing
- GET /api/v1/customers/lookup?msisdn=3331239821
- GET /api/v1/customers/:id/profile
- GET /api/v1/customers/:id/plan
- GET /api/v1/customers/:id/billing/latest
- GET /api/v1/customers/:id/offers
- POST /api/v1/customers/:id/plan-change

### Identity and IVR
- POST /api/v1/identity/otp/send
- POST /api/v1/identity/otp/validate
- POST /api/v1/identity/verify
- GET /api/v1/ivr/context?ani=3331239821
- POST /api/v1/chatbot/fulfillment

### SIM and service operations
- GET /api/v1/customers/:id/sim-replacement/eligibility
- POST /api/v1/sim-replacement
- GET /api/v1/sim-replacement/:requestCode
- POST /api/v1/cases
- GET /api/v1/cases

### Outbound and campaigns
- POST /api/v1/segments
- POST /api/v1/campaigns
- POST /api/v1/campaigns/:id/launch
- GET /api/v1/campaigns/:id/messages
- POST /api/v1/messages/send

## Sprinklr use-case mapping

| Sprinklr capability | Example backend route | Purpose |
| --- | --- | --- |
| Voice IVR agent handoff | GET /api/v1/ivr/context | Return greeting, masked MSISDN, bill, and usage context for ANI lookup |
| Guided workflow | GET /api/v1/customers/:id/sim-replacement/eligibility + POST /api/v1/sim-replacement | SIM replacement approval and tracking |
| Sprinklr Service desktop | GET /api/v1/customers/:id/360 + GET /api/v1/customers/:id/next-best-action | Customer 360 and recommended actions |
| Agentic AI chatbot | POST /api/v1/chatbot/fulfillment | Respond to intent-based conversational requests |
| Outbound campaign orchestration | POST /api/v1/segments + POST /api/v1/campaigns + POST /api/v1/campaigns/:id/launch | High-volume customer targeting and campaign execution |
| Identity verification | POST /api/v1/identity/otp/send + POST /api/v1/identity/otp/validate + POST /api/v1/identity/verify | Validate customer identity before sensitive actions |
| Billing and plan change | POST /api/v1/customers/:id/plan-change | Manage plan upgrades with consent and idempotency controls |
| Case management | POST /api/v1/cases + GET /api/v1/cases/:id | Record and track customer incidents |

## Notes

- All data is synthetic and safe for onboarding demos.
- Idempotency is enforced on mutation endpoints through the Idempotency-Key header.
- This project is designed to emulate a realistic telecom backend for product demos and training use rather than a production-grade operator stack.

## Example seed credentials

- Client ID: sprinklr-demo-client
- Client Secret: windtre-demo-api-key-123
- Customer lookup example: 3331239821

## Testing

The project includes a regression suite covering the main route contracts:

```bash
npm test -- --runTestsByPath tests/windtre.test.js
```
