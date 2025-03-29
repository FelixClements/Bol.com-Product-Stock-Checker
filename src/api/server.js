// src/api/server.js

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateProductSales } from '../utils/salesCalculator.js';
import { checkStock } from '../services/stockChecker.js';
import { Product } from '../models/products.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3000;

// Configure CORS based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? false  // Disable CORS in production since we're serving frontend from same origin
    : 'http://localhost:3000'  // Allow localhost in development
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files before API routes
app.use(express.static(path.join(__dirname, '../../public')));

// API routes
app.use('/api', (req, res, next) => {
  logger.info(`API Request: ${req.method} ${req.path}`);
  next();
});

// POST /api/products endpoint with URL truncation logic
app.post('/api/products', async (req, res) => {
  try {
    let { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Basic validation: URL must start with "https://"
    if (!url.startsWith('https://')) {
      return res.status(400).json({ error: 'URL must start with https://' });
    }
    
    // Remove query parameters by splitting on "?" and ensuring a trailing slash
    url = url.split('?')[0];
    if (!url.endsWith('/')) {
      url += '/';
    }

    // Check if the product already exists
    const existingProduct = await Product.getProductByUrl(url);
    if (existingProduct) {
      return res.status(400).json({ error: 'URL already exists' });
    }
    
    const newProduct = await Product.addProduct(url);
    logger.info(`Added new product with URL: ${url}`);
    
    return res.status(201).json({ 
      message: 'Product added successfully', 
      product: newProduct 
    });
  } catch (error) {
    logger.error('Error adding product:', error);
    return res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update GET /api/products to include the last_check_successful and 30-day sales
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.getAllProductsWithSales();
    // Return an empty array instead of potentially undefined
    return res.json(products || []);
  } catch (error) {
    logger.error('Error fetching products:', error);
    // Return a more specific error message
    return res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const result = await Product.deleteProduct(productId);
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    logger.info(`Deleted product with ID: ${productId}`);
    return res.json({ message: 'Product deleted successfully' });
    
  } catch (error) {
    logger.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.post('/api/products/:id/check', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get the product from the database
    const product = await Product.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Run the stock check
    logger.info(`Manual stock check triggered for product ID: ${productId}`);
    let stock;
    let successful = true;
    
    try {
      stock = await checkStock(product.url);
    } catch (error) {
      successful = false;
      logger.error(`Stock check failed for product ID: ${productId}:`, error);
      stock = 0; // Default to 0 stock if check fails
    }
    
    // Update the database with stock and status
    await Product.addStockHistory(productId, stock);
    await Product.updateLastChecked(productId, successful);
    await calculateProductSales(product.id);
    
    logger.info(`Manual stock check completed for product ID: ${productId}, stock: ${stock}, successful: ${successful}`);
    
    return res.json({ 
      message: 'Stock check completed successfully',
      product: productId,
      stock: stock,
      successful: successful
    });
    
  } catch (error) {
    logger.error('Error running manual stock check:', error);
    return res.status(500).json({ 
      error: 'Failed to run stock check',
      details: error.message 
    });
  }
});

app.get('/api/products/:id/sales', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate product ID
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Check if product exists
    const product = await Product.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get sales data for the product
    const salesData = await Product.getProductSalesByPeriod(productId);
    
    return res.json(salesData);
  } catch (error) {
    logger.error('Error fetching product sales data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch product sales data',
      details: error.message 
    });
  }
});

// GET /api/products/:id/stockhistory
app.get('/api/products/:id/stockhistory', async (req, res) => {
  try {
    const productId = req.params.id;
    // Validate product existence if needed:
    const product = await Product.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const history = await Product.getStockHistory(productId);
    return res.json(history);
  } catch (error) {
    logger.error('Error fetching stock history:', error);
    return res.status(500).json({ error: 'Failed to fetch stock history', details: error.message });
  }
});

// DELETE /api/stockhistory/:stockhistoryid
app.delete('/api/stockhistory/:stockhistoryid', async (req, res) => {
  try {
    const stockHistoryId = req.params.stockhistoryid;
    const deleteResult = await Product.deleteStockHistory(stockHistoryId);

    if (deleteResult.rows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    logger.info(`Deleted stock history record with ID: ${stockHistoryId}`);
    return res.json({ message: 'Stock history record deleted successfully' });
  } catch (error) {
    logger.error('Error deleting stock history record:', error);
    return res.status(500).json({ error: 'Failed to delete stock history record', details: error.message });
  }
});

// PUT /api/stockhistory/:stockhistoryid – update an existing stock history record (for manual change)
app.put('/api/stockhistory/:stockhistoryid', async (req, res) => {
  try {
    const stockHistoryId = req.params.stockhistoryid;
    const { stock } = req.body;
    if (isNaN(stock)) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const updateResult = await Product.updateStockHistory(stockHistoryId, stock);

    if (updateResult.rows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    logger.info(`Updated stock history record with ID: ${stockHistoryId}`);
    return res.json({ message: 'Stock history record updated successfully', updated: updateResult.rows[0] });
  } catch (error) {
    logger.error('Error updating stock history record:', error);
    return res.status(500).json({ error: 'Failed to update stock history record', details: error.message });
  }
});

// POST /api/products/:id/recalculatesales
app.post('/api/products/:id/recalculatesales', async (req, res) => {
  try {
    const productId = req.params.id;
    // Validate existence of the product.
    const product = await Product.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const success = await calculateProductSales(productId);
    if (!success) {
      return res.status(500).json({ error: 'Sales recalculation failed' });
    }
    logger.info(`Sales recalculation triggered for product ID: ${productId}`);
    return res.json({ message: 'Sales recalculation completed successfully' });
  } catch (error) {
    logger.error('Error recalculating sales:', error);
    return res.status(500).json({ error: 'Failed to recalculate sales', details: error.message });
  }
});

app.get('/api/products/:id/sales/daily', async (req, res) => {
  try {
    const productId = req.params.id;
    const days = parseInt(req.query.days) || 30; // Optionally pass ?days=30, ?days=60 etc.
    
    // Check if the product exists
    const product = await Product.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const dailySales = await Product.getDailySales(productId, days);
    return res.json({ productId, days, dailySales });
  } catch (error) {
    logger.error('Error fetching daily sales data:', error);
    return res.status(500).json({ error: 'Failed to fetch daily sales data' });
  }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Start the server
export function startApiServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      logger.info(`API server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      resolve(server);
    });
  });
}