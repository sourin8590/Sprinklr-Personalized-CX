const mongoose = require('mongoose');

const simReplacementSchema = new mongoose.Schema(
  {
    requestCode: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    oldSim: { type: mongoose.Schema.Types.ObjectId, ref: 'Sim', required: true },
    reason: {
      type: String,
      enum: ['LOST', 'DAMAGED', 'STOLEN', 'UPGRADE'],
      required: true,
    },
    simType: {
      type: String,
      enum: ['PHYSICAL', 'ESIM'],
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      postalCode: String,
      province: String,
    },
    esimActivationCode: String,
    status: {
      type: String,
      enum: ['SUBMITTED', 'PROCESSING', 'COMPLETED', 'REJECTED'],
      default: 'SUBMITTED',
    },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SimReplacement', simReplacementSchema);
