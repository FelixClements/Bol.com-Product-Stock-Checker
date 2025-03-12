// src/app.js
import { Scheduler } from './services/scheduler.js';
import { logger } from './utils/logger.js';
import dotenv from 'dotenv';
import { startApiServer } from './api/server.js'; // Add this line

// Load environment variables
dotenv.config();

// Log environment
logger.info(`Running in ${process.env.NODE_ENV || 'development'} environment`);

// Create and start the scheduler
const scheduler = new Scheduler();

// Start the API server
let apiServer = null;
startApiServer()
  .then(server => {
    apiServer = server;
  })
  .catch(error => {
    logger.error('Failed to start API server:', error);
  });

// Start the scheduler
scheduler.start()
  .catch(error => {
    logger.error('Failed to start scheduler:', error);
    process.exit(1);
  });

// Handle application shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  scheduler.stop();
  if (apiServer) {
    apiServer.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  scheduler.stop();
  if (apiServer) {
    apiServer.close();
  }
  process.exit(0);
});

logger.info('Stock checker application started');