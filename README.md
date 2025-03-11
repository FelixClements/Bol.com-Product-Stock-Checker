# Stock Checker

This project is a Node.js application that checks the stock availability of products on bol.com using Puppeteer. It uses a PostgreSQL database to store product URLs and track their stock history.

## Features

*   **Automated Stock Checking:** Periodically checks the stock of products based on their URLs.
*   **Database Storage:** Stores product information and stock history in a PostgreSQL database.
*   **Logging:** Uses Winston for comprehensive logging, including errors and informational messages.
*   **Error Handling:** Implements robust error handling with screenshot capture for debugging.
*   **Dockerized:** Easily deployable with Docker and Docker Compose.

## Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or higher)
*   [Docker](https://www.docker.com/)
*   [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Configure Environment Variables:**

    Create a `.env` file in the project root directory and define the following environment variables:

    ```
    DB_HOST=db
    DB_PORT=5432
    DB_NAME=stockchecker
    DB_USER=postgres
    DB_PASSWORD=yourpassword
    ```

    **Important:** Replace `yourpassword` with a strong, secure password for your PostgreSQL database.

3.  **Build and Run with Docker Compose:**

    ```bash
    docker-compose up --build
    ```

    This command will:

    *   Build the Docker image for the `stock-checker` service.
    *   Start the PostgreSQL database (`db`) and the `stock-checker` application.
    *   Link the services together so the application can connect to the database.

4.  **Accessing Logs:**

    Logs are stored in the `/logs` directory within the container. You can access them by:

    *   Using `docker logs <container_id>` to view logs in the console.
    *   Accessing the logs files directly by mounting a volume in your `docker-compose.yml`.

## Project Structure

````
stock-checker/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── src/
│   ├── app.js             # Main application entry point
│   ├── config/
│   │   └── database.js    # Database connection configuration
│   ├── constants/
│   │   └── stockCheckerSteps.js #  Defines steps for the stock checking process.
│   ├── models/
│   │   └── products.js    # Database model for products
│   ├── services/
│   │   └── stockChecker.js # Contains the logic to check stock on bol.com
│   ├── utils/
│   │   ├── errorHandler.js # Custom error handling.
│   │   ├── logger.js       # Winston logger configuration
│   │   └── screenshot.js   # Screenshot utility for error debugging
├── .env                # Environment variables
├── README.md
````

## Usage

After starting the application, it will automatically begin checking the stock of products listed in the `products` table of the PostgreSQL database.

*   **Adding Products:** You will need to implement your own mechanism to add product URLs to the `products` table. This could be a simple API endpoint, a command-line tool, or direct database insertion. The `src/models/products.js` file contains methods for interacting with the `products` table.

## Configuration

*   **Database Configuration:** The database connection details are configured using environment variables defined in the `.env` file.
*   **Stock Checking Interval:** The frequency at which products are checked for stock can be adjusted in the `src/app.js` file by modifying the interval at which the `updateProductStock` function is called (you'll need to add this interval logic yourself).
*   **Puppeteer Configuration:** The Puppeteer browser options can be configured in the `src/services/stockChecker.js` file.

## Database Schema

The application uses the following database tables:

*   **products:**

    *   `id` (SERIAL PRIMARY KEY)
    *   `url` (TEXT NOT NULL)
    *   `last_checked` (TIMESTAMP)

*   **products\_history:**

    *   `id` (SERIAL PRIMARY KEY)
    *   `product_id` (INTEGER REFERENCES products(id))
    *   `stock` (INTEGER)
    *   `checked_at` (TIMESTAMP)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or report bugs.

## License

[ISC](LICENSE) (You may want to create and add a license file)