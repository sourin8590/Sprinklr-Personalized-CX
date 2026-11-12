const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const { startSimLifecycleCron } = require('./jobs/simLifecycle');

let server;

async function startServer() {
  try {
    await connectDB();
    server = http.createServer(app);
    startSimLifecycleCron();
    server.listen(env.PORT, () => {
      console.log(`Windtre mock backend listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  if (server) server.close(() => process.exit(0));
  const mongoose = require('mongoose');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (server) server.close(() => process.exit(0));
  const mongoose = require('mongoose');
  await mongoose.disconnect();
  process.exit(0);
});

startServer();

module.exports = app;
