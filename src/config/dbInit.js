// src/config/dbInit.js
import pool from './database.js';
import { logger } from '../utils/logger.js';

const tables = {
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      last_checked TIMESTAMP,
      scheduled_time TIME,
      checked_today BOOLEAN DEFAULT FALSE
    )
  `,
  products_history: `
    CREATE TABLE IF NOT EXISTS products_history (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      stock INTEGER,
      checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
};

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    // Create tables
    for (const [tableName, createTableSQL] of Object.entries(tables)) {
      try {
        await client.query(createTableSQL);
        logger.info(`Table '${tableName}' initialized successfully`);
      } catch (error) {
        logger.error(`Error creating table '${tableName}':`, error);
        throw error;
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    logger.info('Database initialization completed successfully');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    logger.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}