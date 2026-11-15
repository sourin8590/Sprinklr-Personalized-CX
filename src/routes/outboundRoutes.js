const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const {
  segmentSchema,
  campaignSchema,
  sendMessageSchema,
  deliveryWebhookSchema,
  responseWebhookSchema,
} = require('../validators/outboundValidator');
const {
  createSegment,
  getSegmentMembers,
  createCampaign,
  launchCampaign,
  getCampaignMessages,
  sendOneOffMessage,
  handleDeliveryWebhook,
  handleResponseWebhook,
} = require('../services/outboundService');
const resolveCustomerByMsisdn = require('../middleware/resolveCustomerByMsisdn');

const router = express.Router();

router.post('/segments', validate(segmentSchema), asyncHandler(async (req, res) => {
  const result = await createSegment(req.body);
  return apiResponse(res, 201, result, req.requestId);
}));

router.get('/segments/:id/members', asyncHandler(async (req, res) => {
  const result = await getSegmentMembers(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/campaigns', validate(campaignSchema), asyncHandler(async (req, res) => {
  const result = await createCampaign({
    name: req.body.name,
    channel: req.body.channel,
    segmentId: req.body.segmentId,
    template: req.body.template,
    scheduledAt: req.body.scheduledAt,
  });
  return apiResponse(res, 201, result, req.requestId);
}));

router.post('/campaigns/:id/launch', asyncHandler(async (req, res) => {
  const result = await launchCampaign(req.params.id);
  return apiResponse(res, 200, result, req.requestId);
}));

router.get('/campaigns/:id/messages', asyncHandler(async (req, res) => {
  const result = await getCampaignMessages(req.params.id);
  return apiResponse(res, 200, { items: result }, req.requestId);
}));

router.post('/messages/send', validate(sendMessageSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await sendOneOffMessage({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/webhooks/delivery', validate(deliveryWebhookSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await handleDeliveryWebhook({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 200, result, req.requestId);
}));

router.post('/webhooks/response', validate(responseWebhookSchema), resolveCustomerByMsisdn(), asyncHandler(async (req, res) => {
  const result = await handleResponseWebhook({ ...req.body, customerId: req.customerId });
  return apiResponse(res, 200, result, req.requestId);
}));

module.exports = router;
