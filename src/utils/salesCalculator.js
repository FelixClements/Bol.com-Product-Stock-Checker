// src/utils/salesCalculator.js
import pool from '../config/database.js';
import { logger } from './logger.js';

export async function calculateProductSales(productId) {
  const client = await pool.connect();
  await new Promise(resolve => setTimeout(resolve, 1000));
  try {
    await client.query('BEGIN');
    await client.query('CALL calculate_product_sales($1)', [productId]);
    await client.query('COMMIT');
    logger.info(`Sales calculation completed for product ID: ${productId}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Error calculating sales for product ID: ${productId}:`, error);
    return false;
  } finally {
    client.release();
  }
}