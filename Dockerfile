FROM node:18-slim
 
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and set proper permissions
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Create log directories and set ownership *before* installing npm packages
# and *before* switching user, ensuring node user can write here.
RUN mkdir -p /usr/src/app/logs/screenshots && \
    chown -R node:node /usr/src/app/logs

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Set up log forwarding in production only
# This creates symlinks, doesn't affect directory permissions.
RUN if [ "$NODE_ENV" = "production" ]; then \
        mkdir -p /usr/src/app/logs && \
        ln -sf /dev/stdout /usr/src/app/logs/combined.log && \
        ln -sf /dev/stderr /usr/src/app/logs/error.log; \
    fi

# Declare the logs directory as a potential volume mount point.
VOLUME ["/usr/src/app/logs"]

# Set non-root user
USER node

# Run the app
CMD [ "npm", "start" ]
