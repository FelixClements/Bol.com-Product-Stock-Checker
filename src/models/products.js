// src/models/products.js

import pool from '../config/database.js';

export class Product {
  // Update the getAllProducts method to include last_check_successful
  static async getAllProducts() {
    const query = `SELECT id, url, scheduled_time, last_check_successful FROM products`;
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
        (last_checked IS NULL OR last_checked < NOW()::date)
        AND scheduled_time::time <= CURRENT_TIME
        AND NOT checked_today
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  // Update updateLastChecked to include the success parameter
  static async updateLastChecked(productId, successful = true) {
    const query = `
      UPDATE products 
      SET last_checked = NOW(),
          checked_today = TRUE,
          last_check_successful = $2
      WHERE id = $1
    `;
    
    await pool.query(query, [productId, successful]);
  }

  //update an existing stock history record (for manual change)
  static async updateStockHistory(stockHistoryId, stock) {
    const query = `
      UPDATE products_history 
      SET stock = $2 
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [stockHistoryId, stock]);
    return result; // returns the full result object with result.rows
  }

  //delete an existing stock history record
  static async deleteStockHistory(stockHistoryId) {
    const query = `
      DELETE FROM products_history 
      WHERE id = $1
      RETURNING id
    `;
    const { rows } = await pool.query(query, [stockHistoryId]);
    return rows;
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
            
            // Delete related records from products_sales
            await client.query(
              'DELETE FROM products_sales WHERE product_id = $1',
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

  static async getSalesData(productId, startDate = null, endDate = null) {
    let query = `
      SELECT * FROM products_sales
      WHERE product_id = $1
    `;
    
    const params = [productId];
    
    if (startDate) {
      query += ` AND period_end >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND period_start <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY period_end DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async getProductSalesByPeriod(productId) {
    try {
      // Current date for calculating periods
      const currentDate = new Date();
      
      // Calculate dates for 30, 60, and 90 days ago
      const date30DaysAgo = new Date(currentDate);
      date30DaysAgo.setDate(currentDate.getDate() - 30);
      
      const date60DaysAgo = new Date(currentDate);
      date60DaysAgo.setDate(currentDate.getDate() - 60);
      
      const date90DaysAgo = new Date(currentDate);
      date90DaysAgo.setDate(currentDate.getDate() - 90);
      
      // Format dates for PostgreSQL
      const formatDate = (date) => date.toISOString();
      
      // Query to calculate sales for each period
      const query = `
        SELECT
          SUM(CASE WHEN period_end >= $2 THEN sales_quantity ELSE 0 END) AS sales_30_days,
          SUM(CASE WHEN period_end >= $3 THEN sales_quantity ELSE 0 END) AS sales_60_days,
          SUM(CASE WHEN period_end >= $4 THEN sales_quantity ELSE 0 END) AS sales_90_days
        FROM products_sales
        WHERE product_id = $1
      `;
      
      const { rows } = await pool.query(query, [
        productId,
        formatDate(date30DaysAgo),
        formatDate(date60DaysAgo),
        formatDate(date90DaysAgo)
      ]);
      
      // Return the aggregated sales data, defaulting to 0 if null
      return {
        productId: parseInt(productId),
        sales30Days: parseInt(rows[0].sales_30_days || 0),
        sales60Days: parseInt(rows[0].sales_60_days || 0),
        sales90Days: parseInt(rows[0].sales_90_days || 0)
      };
    } catch (error) {
      throw new Error(`Failed to get product sales data: ${error.message}`);
    }
  }

  // Check if the product already exists
  static async getProductByUrl(url) {
    const query = `
      SELECT *
      FROM products
      WHERE url = $1
    `;
    const { rows } = await pool.query(query, [url]);
    return rows[0]; // Returns undefined if no product with that URL exists
  }

  // New method to get products with their 30-day sales data
  static async getAllProductsWithSales() {
    const query = `
      WITH last_30_day_sales AS (
        SELECT 
          product_id,
          SUM(sales_quantity) as total_sales
        FROM 
          products_sales
        WHERE 
          period_end >= NOW() - INTERVAL '30 days'
        GROUP BY 
          product_id
      )
      SELECT 
        p.id, 
        p.url, 
        p.scheduled_time, 
        p.last_check_successful,
        COALESCE(s.total_sales, 0) as sales_30_days
      FROM 
        products p
      LEFT JOIN 
        last_30_day_sales s ON p.id = s.product_id
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

}