// src/api/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/products.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Add this before your routes
app.use(express.static(path.join(__dirname, '../../public')));

// Add a route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

// Routes
app.post('/api/products', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format (basic check)
    if (!url.startsWith('https://')) {
      return res.status(400).json({ error: 'URL must start with https://' });
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
    return res.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Start the server
export function startApiServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      logger.info(`API server running on port ${PORT}`);
      resolve(server);
    });
  });
}