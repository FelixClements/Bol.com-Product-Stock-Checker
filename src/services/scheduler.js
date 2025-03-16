// src/services/scheduler.js
import { Product } from '../models/products.js';
import { logger } from '../utils/logger.js';
import { checkStockAndCalculateSales } from './stockChecker.js';

export class Scheduler {
  constructor() {
    this.isRunning = false;
    this.isProductionMode = process.env.NODE_ENV === 'production';
    
    if (this.isProductionMode) {
      logger.info('Running in PRODUCTION mode - using scheduled checks');
    } else {
      logger.info('Running in DEVELOPMENT mode - skipping scheduled checks');
    }
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Stock checker scheduler started');
    
    if (this.isProductionMode) {
      // Schedule initial check times if needed - production only
      await Product.scheduleProductChecks();
      
      // Start the scheduler loop
      this.scheduleNextCheck();
    } else {
      // In development, just run all checks immediately once
      await this.runAllChecks();
    }
  }

  async runAllChecks() {
    try {
      // In dev mode, get all products that haven't been checked in the last day
      const products = await Product.getAllPendingChecks();
      
      logger.info(`DEV MODE: Checking ${products.length} products`);
      
      for (const product of products) {
        try {
          const stock = await checkStockAndCalculateSales(product.url, product.id);
          await Product.addStockHistory(product.id, stock);
          await Product.updateLastChecked(product.id);
          logger.info(`Updated stock for product ${product.id}: ${stock}`);
        } catch (error) {
          logger.error(`Error checking stock for product ${product.id}:`, error);
        }
      }
      
      logger.info('DEV MODE: All checks completed');
    } catch (error) {
      logger.error('Error running dev mode checks:', error);
    }
  }

  async scheduleNextCheck() {
    if (!this.isRunning || !this.isProductionMode) return;
    
    try {
      // Check if it's a new day (midnight) to reset checked_today flags
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        await Product.resetDailyChecks();
        logger.info('Reset daily product check flags');
      }
      
      // Only process products between 8AM and 11PM
      if (now.getHours() >= 8 && now.getHours() < 23) {
        // Get products that are due for checking at the current time
        const products = await Product.getProductsDueForCheck();
        
        if (products.length > 0) {
          logger.info(`Checking ${products.length} products scheduled for now`);
          
          // Process each product one by one
          for (const product of products) {
            try {
              const stock = await checkStockAndCalculateSales(product.url, product.id);
              await Product.addStockHistory(product.id, stock);
              await Product.updateLastChecked(product.id);
              logger.info(`Updated stock for product ${product.id}: ${stock}`);
            } catch (error) {
              logger.error(`Error checking stock for product ${product.id}:`, error);
            }
            
            // Add a small delay between product checks to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
    } catch (error) {
      logger.error('Scheduler error:', error);
    }
    
    // Schedule the next check in 1 minute
    setTimeout(() => this.scheduleNextCheck(), 60000);
  }

  stop() {
    this.isRunning = false;
    logger.info('Stock checker scheduler stopped');
  }
}