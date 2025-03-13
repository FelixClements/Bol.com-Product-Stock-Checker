FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /usr/src/app/logs/screenshots

# Create app directory and set proper permissions
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Set up log forwarding in production only
RUN if [ "$NODE_ENV" = "production" ]; then \
        mkdir -p /usr/src/app/logs && \
        ln -sf /dev/stdout /usr/src/app/logs/combined.log && \
        ln -sf /dev/stderr /usr/src/app/logs/error.log; \
    fi

# Create volume for logs and screenshots (only used in development)
VOLUME ["/usr/src/app/logs"]

# Set non-root user
USER node

# Run the app
CMD [ "npm", "start" ]