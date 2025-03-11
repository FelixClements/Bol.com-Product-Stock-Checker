// src/models/products.js

import pool from '../config/database.js';

export class Product {
  static async getAllPendingChecks() {
    const query = `
      SELECT id, url 
      FROM products 
      WHERE last_checked < NOW() - INTERVAL '1 hour' 
      OR last_checked IS NULL
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  static async updateLastChecked(productId) {
    const query = `
      UPDATE products 
      SET last_checked = NOW() 
      WHERE id = $1
    `;
    
    await pool.query(query, [productId]);
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
    const query = `
      INSERT INTO products 
      (url) 
      VALUES ($1) 
      RETURNING id
    `;
    
    const { rows } = await pool.query(query, [url]);
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
}