// src/app.js

import { checkStock } from './services/stockChecker.js';
import { Product } from './models/products.js';
import { logger } from './utils/logger.js';

async function updateProductStock() {
  try {
    // Get all products that need checking
    const products = await Product.getAllPendingChecks();

    for (const product of products) {
      try {
        const stock = await checkStock(product.url);
        
        // Insert into history table
        await Product.addStockHistory(product.id, stock);
        
        // Update last_checked timestamp
        await Product.updateLastChecked(product.id);

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