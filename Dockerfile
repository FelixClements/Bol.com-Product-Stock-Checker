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

# Create volume for logs and screenshots
VOLUME ["/usr/src/app/logs"]

# Set non-root user
USER node

# Run the app
CMD [ "npm", "start" ]
