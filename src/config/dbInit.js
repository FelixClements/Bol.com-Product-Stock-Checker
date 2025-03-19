// src/config/dbInit.js
import pool from './database.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  `,
  products_sales: `
    CREATE TABLE IF NOT EXISTS products_sales (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      sales_quantity INTEGER NOT NULL,
      period_start TIMESTAMP NOT NULL,
      period_end TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
};

// SQL for stored procedure
const storedProcedurePath = path.join(__dirname, '../sql/calculate_product_sales.sql');

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

    // Create stored procedure
    try {
      const storedProcedureSQL = fs.readFileSync(storedProcedurePath, 'utf-8');
      await client.query(storedProcedureSQL);
      logger.info('Stored procedure "calculate_product_sales" created successfully');
    } catch (error) {
      logger.error('Error creating stored procedure:', error);
      throw error;
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