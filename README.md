# Stock Checker Application

A Node.js application that automatically checks product stock levels on bol.com using Puppeteer. The application includes a web interface for managing product URLs and scheduling automated stock checks.

## Features

- Web interface for managing product URLs
- Automated stock checking at scheduled intervals
- PostgreSQL database for storing product data and stock history
- Docker support for easy deployment
- Error handling with screenshots
- Logging system
- REST API endpoints

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 14+

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stock-checker.git
cd stock-checker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockchecker
DB_USER=postgres
DB_PASSWORD=yourpassword
API_PORT=3000
```

## Running with Docker

1. Build and start the containers:
```bash
docker-compose up -d
```

2. The application will be available at `http://localhost:3000`

## Running Locally

1. Start PostgreSQL database
2. Run the application:
```bash
npm start
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product
- `DELETE /api/products/:id` - Delete a product

## Project Structure

```
├── .github/workflows      # GitHub Actions workflows
├── public                 # Static files
├── src
│   ├── api               # API endpoints
│   ├── config            # Database configuration
│   ├── constants         # Application constants
│   ├── models            # Database models
│   ├── services          # Business logic
│   └── utils             # Utility functions
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Development Mode vs Production Mode

- Development Mode: Checks all products immediately without scheduling
- Production Mode: Schedules checks between 8 AM and 11 PM
