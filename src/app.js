// src/app.js
import { Scheduler } from './services/scheduler.js';
import { logger } from './utils/logger.js';
import dotenv from 'dotenv';
import { startApiServer } from './api/server.js';
import { initializeDatabase } from './config/dbInit.js'; // Add this line

// Load environment variables
dotenv.config();

// Log environment
logger.info(`Running in ${process.env.NODE_ENV || 'development'} environment`);

// Initialize application
async function initialize() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Create and start the scheduler
    const scheduler = new Scheduler();

    // Start the API server
    let apiServer = null;
    apiServer = await startApiServer();

    // Start the scheduler
    await scheduler.start();

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
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
initialize();