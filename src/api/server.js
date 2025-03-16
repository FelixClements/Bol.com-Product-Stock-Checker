// src/api/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.getAllProducts();
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
    const stock = await checkStock(product.url);
    
    // Update the database
    await Product.addStockHistory(productId, stock);
    await Product.updateLastChecked(productId);
    
    logger.info(`Manual stock check completed for product ID: ${productId}, stock: ${stock}`);
    
    return res.json({ 
      message: 'Stock check completed successfully',
      product: productId,
      stock: stock
    });
    
  } catch (error) {
    logger.error('Error running manual stock check:', error);
    return res.status(500).json({ 
      error: 'Failed to run stock check',
      details: error.message 
    });
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