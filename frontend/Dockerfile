FROM node:20-alpine

WORKDIR /app

# Add necessary build tools and dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && npm install -g npm@latest

# Create app directory and set permissions
RUN mkdir -p /app/node_modules && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Install dependencies
COPY --chown=node:node package*.json ./
RUN npm install

# Copy the rest of the code
COPY --chown=node:node . .

# Expose Vite dev server port
EXPOSE 3000

# Start development server with host flag
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]