// src/models/products.js

import pool from '../config/database.js';

export class Product {
  static async getAllProducts() {
    const query = `SELECT id, url, scheduled_time FROM products`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // This method is used in development mode to get all products 
  // that haven't been checked in the last day
  static async getAllPendingChecks() {
    const query = `
      SELECT id, url 
      FROM products 
      WHERE last_checked IS NULL 
         OR last_checked < NOW() - INTERVAL '1 day'
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getProductsDueForCheck() {
    const query = `
      SELECT id, url 
      FROM products 
      WHERE 
        (last_checked IS NULL OR last_checked < NOW() - INTERVAL '1 day')
        AND scheduled_time::time <= CURRENT_TIME
        AND NOT checked_today
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  static async updateLastChecked(productId) {
    const query = `
      UPDATE products 
      SET last_checked = NOW(),
          checked_today = TRUE
      WHERE id = $1
    `;
    
    await pool.query(query, [productId]);
  }

  static async resetDailyChecks() {
    // Reset checked_today flag at midnight
    const query = `
      UPDATE products 
      SET checked_today = FALSE
    `;
    
    await pool.query(query);
  }

  static async scheduleProductChecks() {
    // Schedule each product at a random time between 8AM and 11PM
    const products = await this.getAllProducts();
    
    for (const product of products) {
      // Generate random hour between 8 and 23 (11PM)
      const hour = Math.floor(Math.random() * 16) + 8;
      // Generate random minute
      const minute = Math.floor(Math.random() * 60);
      
      const scheduledTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      await pool.query(
        `UPDATE products SET scheduled_time = $1 WHERE id = $2`,
        [scheduledTime, product.id]
      );
    }
  }

  static async addStockHistory(productId, stock) {
    const query = `
      INSERT INTO products_history 
      (product_id, stock, checked_at) 
      VALUES ($1, $2, NOW())
    `;
    
    await pool.query(query, [productId, stock]);
  }

  static async getProductById(productId) {
    const query = `
      SELECT * 
      FROM products 
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [productId]);
    return rows[0];
  }

  static async addProduct(url) {
    // Generate a random time between 8AM and 11PM for new products
    const hour = Math.floor(Math.random() * 16) + 8;
    const minute = Math.floor(Math.random() * 60);
    const scheduledTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const query = `
      INSERT INTO products 
      (url, scheduled_time, checked_today) 
      VALUES ($1, $2, FALSE) 
      RETURNING id
    `;
    
    const { rows } = await pool.query(query, [url, scheduledTime]);
    return rows[0];
  }

  static async getStockHistory(productId) {
    const query = `
      SELECT * 
      FROM products_history 
      WHERE product_id = $1 
      ORDER BY checked_at DESC
    `;
    
    const { rows } = await pool.query(query, [productId]);
    return rows;
  }

  static async deleteProduct(productId) {
    try {
        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete related records from products_history first
            await client.query(
                'DELETE FROM products_history WHERE product_id = $1',
                [productId]
            );

            // Then delete the product
            const result = await client.query(
                'DELETE FROM products WHERE id = $1 RETURNING id',
                [productId]
            );

            await client.query('COMMIT');
            
            return result.rows.length > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }
}
}