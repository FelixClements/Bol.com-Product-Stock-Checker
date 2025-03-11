// src/app.js

import { checkStock } from './services/stockChecker.js';
import { Product } from './models/products.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/logs/combined.log' }),
  ],
});

async function updateProductStock() {
  try {
    // Get all products that need checking
    const products = await Product.getAllPendingChecks();

    for (const product of products) {
      try {
        const stock = await checkStock(product.url);
        
        // Update last_checked timestamp
        await Product.updateLastChecked(product.id);

        // Insert into history table
        await Product.addStockHistory(product.id, stock);

        logger.info(`Updated stock for product ${product.id}: ${stock}`);
      } catch (error) {
        logger.error(`Error checking stock for product ${product.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Database error:', error);
    throw error;
  }
}

// Run the stock checker
updateProductStock().catch(error => {
  logger.error('Application error:', error);
  process.exit(1);
});