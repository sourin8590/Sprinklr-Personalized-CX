const cron = require('node-cron');
const SimReplacement = require('../models/SimReplacement');

function startSimLifecycleCron() {
  cron.schedule('* * * * *', async () => {
    const pending = await SimReplacement.find({ status: 'SUBMITTED' }).lean();
    for (const item of pending) {
      await SimReplacement.findByIdAndUpdate(item._id, { status: 'PROCESSING' });
    }

    const processing = await SimReplacement.find({ status: 'PROCESSING' }).lean();
    for (const item of processing) {
      await SimReplacement.findByIdAndUpdate(item._id, { status: 'COMPLETED' });
    }
  });
}

module.exports = { startSimLifecycleCron };
