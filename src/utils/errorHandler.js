// src/utils/errorHandler.js

import { logger } from './logger.js';
import { screenshotManager } from './screenshot.js';

export class StockCheckerError extends Error {
  constructor(message, step, originalError = null) {
    super(message);
    this.name = 'StockCheckerError';
    this.step = step;
    this.originalError = originalError;
  }
}

export async function handleStockCheckerError(page, step, error, customMessage = null) {
  const screenshot = await screenshotManager.takeErrorScreenshot(page, step);
  
  const errorDetails = {
    step,
    screenshot,
    error: error.message,
    stack: error.stack
  };

  logger.error(customMessage || `Error in step: ${step}`, errorDetails);
  
  throw new StockCheckerError(
    customMessage || error.message,
    step,
    error
  );
}