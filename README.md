# Product Stock Checker

Product Stock Checker is a Node.js application that monitors the stock level and sales history of bol.com products. It uses headless browser automation (via Puppeteer) to check stock availability and leverages a PostgreSQL database to store product data, stock history, and calculated sales figures. The application also exposes a REST API and comes with a web-based dashboard for managing product URLs and viewing sales trends.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Locally (Development Mode)](#locally-development-mode)
  - [Using Docker & Docker Compose](#using-docker--docker-compose)
- [CI/CD](#cicd)
- [API Endpoints](#api-endpoints)
- [Scheduler & Stock Checking](#scheduler--stock-checking)
- [Logging & Error Handling](#logging--error-handling)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

Product Stock Checker monitors bol.com products by:
- Automatically checking stock levels using Puppeteer.
- Scheduling checks throughout the day (production mode) or running them immediately (development mode).
- Calculating sales data via a PostgreSQL stored procedure.
- Exposing a RESTful API for managing products and retrieving sales/stock history.
- Providing a web interface to add product URLs and view detailed sales dashboards.

---

## Features

- **Automated Stock Checks:** Leverages Puppeteer to simulate user interactions—handling cookie consents, modal dialogs, and cart operations—to determine product stock.
- **Sales Calculation:** Uses a stored procedure to calculate sales quantities based on historical stock data.
- **Scheduling:** In production, stock checks are scheduled between 8 AM and 11 PM with daily resets; in development, all pending checks run immediately.
- **REST API & Dashboard:** Endpoints for adding/deleting products, manual stock checks, retrieving sales data, and a frontend dashboard for visualization.
- **Dockerized Deployment:** Includes a Dockerfile and Docker Compose configuration to run the application alongside a PostgreSQL database.
- **CI/CD Pipeline:** GitHub Actions workflow automatically builds and pushes Docker images upon changes to the main branch.
- **Robust Logging:** Uses Winston for logging with support for file-based logs in development and console logging in production.

---

## Technologies Used

- **Node.js & Express:** Application runtime and API framework.
- **PostgreSQL:** Storage for products, stock history, and sales data.
- **Puppeteer:** Headless browser for automating stock checks.
- **Docker / Docker Compose:** Containerization and local orchestration.
- **GitHub Actions:** CI/CD for building & publishing Docker images.
- **Chart.js:** Rendering interactive sales charts in the dashboard.
- **Winston:** Logging and error management.

---

## Project Structure

```
.
├── .github
│   └── workflows
│       └── docker-image.yml         # GitHub Actions for Docker build & push
├── docker-compose.yml               # Multi-container deployment configuration
├── Dockerfile                       # Docker build instructions
├── package.json                     # Node.js dependencies and scripts
├── public
│   ├── index.html                   # Main UI for managing product URLs
│   └── sales.html                   # Sales dashboard UI
└── src
    ├── api
    │   └── server.js                # Express API endpoints
    ├── app.js                       # Application entry point; starts DB, API, scheduler
    ├── config
    │   ├── database.js              # PostgreSQL connection configuration
    │   └── dbInit.js                # Initializes tables and stored procedure
    ├── constants
    │   └── stockCheckerSteps.js     # Defines steps and selectors for the stock checker
    ├── models
    │   └── products.js              # Data model for CRUD operations and sales data
    ├── services
    │   ├── scheduler.js             # Schedules periodic stock checks
    │   └── stockChecker.js          # Automates stock check flow using Puppeteer
    ├── sql
    │   └── calculate_product_sales.sql   # Stored procedure to calculate product sales
    └── utils                        # Utility modules for error handling, logging, and screenshots
         ├── errorHandler.js
         ├── logger.js
         ├── salesCalculator.js
         └── screenshot.js
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 12 or later)
- **Docker & Docker Compose** (optional, for containerized deployment)

### Environment Variables

Create a `.env` file in the root directory and add the following (modify as needed):

```
NODE_ENV=development
API_PORT=3000
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=stockchecker
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_SSL=false
```

*Note:* In production, set `NODE_ENV=production` and configure `DB_SSL` as required.

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/product_stock_checker.git
   cd product_stock_checker
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Database Initialization:**

   On startup, the application automatically creates the necessary tables and stored procedure using `src/config/dbInit.js`.  
   Make sure your PostgreSQL instance is running and accessible.

---

## Running the Application

### Locally (Development Mode)

To run the application locally:

```bash
npm start
```

This command will:
- Load environment variables from `.env`
- Initialize the database (running table creation and stored procedure scripts)
- Start the Express API server on the port defined (default is 3000)
- In development mode, execute all pending stock checks immediately rather than scheduling them

Access the web interface by navigating to [http://localhost:3000](http://localhost:3000).

### Using Docker & Docker Compose

The repository includes a `Dockerfile` and a `docker-compose.yml` file to simplify deployment.

1. **Build and Run Containers:**

   ```bash
   docker-compose up --build
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000).  
   PostgreSQL will run as a separate container on port 5432, and persistent volumes are configured for both application logs and database data.

---

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/docker-image.yml`) that:

- Triggers on pushes or pull requests to the `main` branch
- Logs in to the GitHub Container Registry (`ghcr.io`)
- Extracts metadata for tags and labels automatically
- Builds and pushes the Docker image according to the defined configuration

Make sure to configure any necessary GitHub repository secrets (like `GITHUB_TOKEN`) for a smooth CI/CD process.

---

## API Endpoints

The application exposes several REST endpoints:

- **`POST /api/products`**  
  Add a new product URL for monitoring (validates URL format and trims query parameters).

- **`GET /api/products`**  
  Retrieve all products along with scheduled checking time, last check status, and 30-day sales data.

- **`DELETE /api/products/:id`**  
  Remove a product by its ID (includes deletion of associated history and sales records).

- **`POST /api/products/:id/check`**  
  Manually trigger a stock check for a specific product.

- **`GET /api/products/:id/sales`**  
  Retrieve aggregated sales data (30, 60, and 90 days) for a product.

- **`GET /api/products/:id/sales/daily?days=30`**  
  Retrieve daily sales data for a defined period.

- **`GET /api/products/:id/stockhistory`**  
  Get the complete stock history for a product.

- **`DELETE /api/stockhistory/:stockhistoryid`**  
  Delete a specific stock history record.

- **`PUT /api/stockhistory/:stockhistoryid`**  
  Update an existing stock history record (e.g., manual corrections).

- **`POST /api/products/:id/recalculatesales`**  
  Recalculate sales data for a product using the stored procedure.

The frontend UIs (`index.html` & `sales.html`) interact with these endpoints to manage product URLs and visualize sales trends.

---

## Scheduler & Stock Checking

- **Scheduler:**  
  Implemented in `src/services/scheduler.js`, it either schedules checks between 8 AM and 11 PM (production) or runs all pending checks immediately (development).

- **Stock Checker:**  
  Using Puppeteer in `src/services/stockChecker.js`, the application automates the steps needed to check stock—handling cookie consents, modal dialogs, cart interactions, and finally retrieving the stock quantity.

- **Sales Calculation:**  
  After a stock check, sales are calculated using the stored procedure defined in `src/sql/calculate_product_sales.sql` and executed via `src/utils/salesCalculator.js`.

---

## Logging & Error Handling

- **Logging:**  
  Configured using Winston (see `src/utils/logger.js`). In development, logs are written to files under the `logs` directory; in production, logs are output to the console.

- **Error Handling:**  
  Custom error handling is implemented in `src/utils/errorHandler.js` which captures and logs errors along with screenshots (saved in `logs/screenshots`) whenever a step in the stock check fails.

---

## Contributing

Contributions are welcome! If you have ideas for improvement or new features, please fork the repository, make your changes, and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for more details.

---

## Author

Felix Clements

---

Happy stock checking!