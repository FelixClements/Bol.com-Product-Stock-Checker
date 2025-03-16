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
//const storedProcedurePath = path.join(__dirname, '../sql/calculate_product_sales.sql');

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
      const storedProcedureSQL = `
        CREATE OR REPLACE PROCEDURE calculate_product_sales(p_product_id INTEGER)
        LANGUAGE plpgsql
        AS $$
        DECLARE
          current_record RECORD;
          previous_record RECORD;
          sales_qty INTEGER;
        BEGIN
          -- Get the latest two stock records for the product
          FOR current_record IN 
            SELECT id, product_id, stock, checked_at 
            FROM products_history 
            WHERE product_id = p_product_id 
            ORDER BY checked_at DESC 
            LIMIT 2
          LOOP
            -- If this is the first record (latest record)
            IF previous_record IS NULL THEN
              previous_record := current_record;
            ELSE
              -- Calculate sales (stock decrease) between these two records
              
              -- If stock increased (restock occurred), set sales to 0
              IF previous_record.stock >= current_record.stock THEN
                sales_qty := 0;
              ELSE
                -- Calculate positive sales (stock decreased)
                sales_qty := current_record.stock - previous_record.stock;
              END IF;
              
              -- Only insert if we have a valid period (both timestamps exist)
              IF previous_record.checked_at IS NOT NULL AND current_record.checked_at IS NOT NULL THEN
                -- Insert the sales record
                INSERT INTO products_sales (
                  product_id, 
                  sales_quantity, 
                  period_start, 
                  period_end
                ) VALUES (
                  p_product_id,
                  sales_qty,
                  current_record.checked_at,
                  previous_record.checked_at
                );
              END IF;
              
              -- Exit after processing one pair
              EXIT;
            END IF;
          END LOOP;
          
          -- Commit the transaction
          COMMIT;
        END;
        $$;
      `;
      
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