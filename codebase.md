# .vscode\launch.json

```json
{
    "version": "0.2.0",
    "configurations": [
      {
        "type": "node",
        "request": "launch",
        "name": "Launch Program",
        "skipFiles": [
          "<node_internals>/**"
        ],
        "program": "${workspaceFolder}/puppeteer.js" // Adjust to match your main file
      },
      {
        "type": "node",
        "request": "attach",
        "name": "Attach to Process",
        "processId": "Process Picker",
        "skipFiles": [
          "<node_internals>/**"
        ]
      }
    ]
  }
```

# combined.log

```log
{"cause":{},"level":"error","message":"Error adding product to cart: Timed out after waiting 5000ms","name":"TimeoutError","stack":"TimeoutError: Timed out after waiting 5000ms\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/puppeteer/common/util.js:237:19\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1944:31\n    at OperatorSubscriber2._this._next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1001:9)\n    at Subscriber2.next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:704:12)\n    at AsyncAction2.<anonymous> (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:2288:20)\n    at AsyncAction2._execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1368:12)\n    at AsyncAction2.execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1357:22)\n    at AsyncScheduler2.flush (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1435:26)\n    at listOnTimeout (node:internal/timers:594:17)\n    at process.processTimers (node:internal/timers:529:7)"}

```

# docker-compose.yml

```yml
version: '3.8'

services:
  stock-checker:
    build: .
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=stockchecker
      - DB_USER=postgres
      - DB_PASSWORD=yourpassword
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=stockchecker
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=yourpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

# Dockerfile

```
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    --no-install-recommends

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Run the app
CMD [ "npm", "start" ]
```

# error.log

```log
{"cause":{},"level":"error","message":"Error adding product to cart: Timed out after waiting 5000ms","name":"TimeoutError","stack":"TimeoutError: Timed out after waiting 5000ms\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/puppeteer/common/util.js:237:19\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1944:31\n    at OperatorSubscriber2._this._next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1001:9)\n    at Subscriber2.next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:704:12)\n    at AsyncAction2.<anonymous> (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:2288:20)\n    at AsyncAction2._execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1368:12)\n    at AsyncAction2.execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1357:22)\n    at AsyncScheduler2.flush (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1435:26)\n    at listOnTimeout (node:internal/timers:594:17)\n    at process.processTimers (node:internal/timers:529:7)"}

```

# logs\combined.log

```log
{"level":"info","message":"Updated stock for product 100: 61"}
{"level":"info","message":"Updated stock for product 101: 20"}
{"level":"info","message":"Updated stock for product 102: 56"}
{"level":"info","message":"Updated stock for product 103: 56"}
{"cause":{},"level":"error","message":"Error adding product to cart: Timed out after waiting 5000ms","name":"TimeoutError","stack":"TimeoutError: Timed out after waiting 5000ms\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/puppeteer/common/util.js:237:19\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1944:31\n    at OperatorSubscriber2._this._next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1001:9)\n    at Subscriber2.next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:704:12)\n    at AsyncAction2.<anonymous> (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:2288:20)\n    at AsyncAction2._execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1368:12)\n    at AsyncAction2.execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1357:22)\n    at AsyncScheduler2.flush (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1435:26)\n    at listOnTimeout (node:internal/timers:594:17)\n    at process.processTimers (node:internal/timers:529:7)"}
{"cause":{},"level":"error","message":"Error checking stock for product 104: Timed out after waiting 5000ms","name":"TimeoutError","stack":"TimeoutError: Timed out after waiting 5000ms\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/puppeteer/common/util.js:237:19\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1944:31\n    at OperatorSubscriber2._this._next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1001:9)\n    at Subscriber2.next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:704:12)\n    at AsyncAction2.<anonymous> (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:2288:20)\n    at AsyncAction2._execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1368:12)\n    at AsyncAction2.execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1357:22)\n    at AsyncScheduler2.flush (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1435:26)\n    at listOnTimeout (node:internal/timers:594:17)\n    at process.processTimers (node:internal/timers:529:7)"}
{"level":"info","message":"Updated stock for product 105: 17"}
{"level":"info","message":"Updated stock for product 106: 42"}

```

# logs\error.log

```log
{"cause":{},"level":"error","message":"Error adding product to cart: Timed out after waiting 5000ms","name":"TimeoutError","stack":"TimeoutError: Timed out after waiting 5000ms\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/puppeteer/common/util.js:237:19\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1944:31\n    at OperatorSubscriber2._this._next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1001:9)\n    at Subscriber2.next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:704:12)\n    at AsyncAction2.<anonymous> (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:2288:20)\n    at AsyncAction2._execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1368:12)\n    at AsyncAction2.execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1357:22)\n    at AsyncScheduler2.flush (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1435:26)\n    at listOnTimeout (node:internal/timers:594:17)\n    at process.processTimers (node:internal/timers:529:7)"}
{"cause":{},"level":"error","message":"Error checking stock for product 104: Timed out after waiting 5000ms","name":"TimeoutError","stack":"TimeoutError: Timed out after waiting 5000ms\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/puppeteer/common/util.js:237:19\n    at file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1944:31\n    at OperatorSubscriber2._this._next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1001:9)\n    at Subscriber2.next (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:704:12)\n    at AsyncAction2.<anonymous> (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:2288:20)\n    at AsyncAction2._execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1368:12)\n    at AsyncAction2.execute (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1357:22)\n    at AsyncScheduler2.flush (file:///C:/Users/Maart/Documents/github/product_stock_checker_JS/node_modules/puppeteer-core/lib/esm/third_party/rxjs/rxjs.js:1435:26)\n    at listOnTimeout (node:internal/timers:594:17)\n    at process.processTimers (node:internal/timers:529:7)"}

```

# package.json

```json
{
  "name": "stock-checker",
  "version": "1.0.0",
  "description": "Stock checker for bol.com products",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "debug": "node --inspect-brk src/app.js"
  },
  "author": "Maart",
  "license": "ISC",
  "dependencies": {
    "puppeteer": "^24.4.0",
    "winston": "^3.17.0",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  }
}

```

# src\app.js

```js
// src/app.js

import { checkStock } from './services/stockChecker.js';
import { Product } from './models/products.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/logs/combined.log' }),
  ],
});

async function updateProductStock() {
  try {
    // Get all products that need checking
    const products = await Product.getAllPendingChecks();

    for (const product of products) {
      try {
        const stock = await checkStock(product.url);
        
        // Update last_checked timestamp
        await Product.updateLastChecked(product.id);

        // Insert into history table
        await Product.addStockHistory(product.id, stock);

        logger.info(`Updated stock for product ${product.id}: ${stock}`);
      } catch (error) {
        logger.error(`Error checking stock for product ${product.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Database error:', error);
    throw error;
  }
}

// Run the stock checker
updateProductStock().catch(error => {
  logger.error('Application error:', error);
  process.exit(1);
});
```

# src\config\database.js

```js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export default pool;
```

# src\models\products.js

```js
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
```

# src\services\stockChecker.js

```js
import puppeteer from 'puppeteer';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export async function checkStock(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    page.setDefaultTimeout(5000);

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Handle cookie consent
    try {
      await page.waitForSelector('#js-first-screen-accept-all-button', { visible: true });
      await page.click('#js-first-screen-accept-all-button');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.info('Cookie consent modal not found or already handled');
      throw error;
    }

    // Handle country/language modal
    try {
      await page.waitForSelector('#modalWindow > div.modal__window.js_modal_window > button', { visible: true });
      await page.locator('#modalWindow > div.modal__window.js_modal_window > button').click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.info('Country/language modal not found or already handled');
      throw error;
    }

    // add to cart
    try {
      await page.locator('xpath//html/body/div[1]/main/div/div[1]/div[2]/div[2]/section[1]/div[2]/div[1]/span/a').click();
      await new Promise(resolve => setTimeout(resolve, 1000));     
    } catch (error) {
      logger.error('Error adding product to cart:', error);
      throw error;
    }

    // button to got to cart
    try {
      await page.locator('xpath//html/body/div[3]/div[2]/div[3]/div[1]/div/div[2]/a').click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error('Error going to cart:', error);
      throw error;
    }

    // selecting the meer option
    try {
      await page.waitForSelector('xpath//html/body/div/main/wsp-basket-application/div[2]/div[1]/div/div[5]/div[1]/div/div/select');
      await page.select('select', 'Meer');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error('Error selecting the meer option:', error);
      throw error;
    }

    // change the quantity
    try {
      await page.locator('xpath//html/body/div/main/wsp-basket-application/div[2]/div[1]/div/div[5]/div[1]/div/div[1]/input').fill('500');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) { 
      logger.error('Error changing the quantity:', error);
      throw error;
    }

    // get the stock value
    try {
      const product_stock = await page.waitForSelector('xpath//html/body/div/main/wsp-basket-application/div[2]/div[2]/div/div[1]/div[1]/span');
      const stock_value = await product_stock?.evaluate(el => el.getAttribute('data-amount'));
      return parseInt(stock_value, 10);
    } catch (error) {
      logger.error('Error checking stock:', error);
      throw error;
    }

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

