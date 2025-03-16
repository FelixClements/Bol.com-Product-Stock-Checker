// src/utils/salesCalculator.js
import pool from '../config/database.js';
import { logger } from './logger.js';

export async function calculateProductSales(productId) {
  try {
    // Call the stored procedure
    await pool.query('CALL calculate_product_sales($1)', [productId]);
    logger.info(`Sales calculation completed for product ID: ${productId}`);
    return true;
  } catch (error) {
    logger.error(`Error calculating sales for product ID: ${productId}:`, error);
    return false;
  }
}