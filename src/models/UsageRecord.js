const mongoose = require('mongoose');

const usageRecordSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    dataTotalGb: { type: Number, required: true },
    dataUsedGb: { type: Number, required: true },
    minutesUsed: { type: Number, default: 0 },
    smsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

usageRecordSchema.virtual('dataLeftGb').get(function () {
  return Number(this.dataTotalGb) - Number(this.dataUsedGb);
});

usageRecordSchema.set('toJSON', { virtuals: true });
usageRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UsageRecord', usageRecordSchema);
