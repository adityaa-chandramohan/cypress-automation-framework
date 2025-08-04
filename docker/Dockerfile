# Multi-stage Dockerfile for Cypress automation framework

# Stage 1: Base image with Node.js and system dependencies
FROM cypress/base:18.16.0 as base

# Set working directory
WORKDIR /workspace

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    xvfb \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    libatspi2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r cypress && useradd -r -g cypress -G audio,video cypress \
    && mkdir -p /home/cypress/Downloads \
    && chown -R cypress:cypress /home/cypress \
    && chown -R cypress:cypress /workspace

# Stage 2: Development image with all dependencies
FROM base as development

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Install Cypress binary
RUN npx cypress install

# Verify Cypress installation
RUN npx cypress verify

# Copy application code
COPY --chown=cypress:cypress . .

# Create directories for reports and screenshots
RUN mkdir -p cypress/screenshots cypress/videos cypress/reports \
    && chown -R cypress:cypress cypress/

# Switch to non-root user
USER cypress

# Expose port for Cypress Dashboard
EXPOSE 3000

# Default command
CMD ["npm", "run", "cy:run"]

# Stage 3: Production image (minimal)
FROM base as production

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install Cypress binary
RUN npx cypress install && npx cypress verify

# Copy built application and configuration
COPY --chown=cypress:cypress cypress.config.ts ./
COPY --chown=cypress:cypress src/ ./src/
COPY --chown=cypress:cypress tests/ ./tests/
COPY --chown=cypress:cypress cypress/support/ ./cypress/support/
COPY --chown=cypress:cypress configs/ ./configs/

# Create necessary directories
RUN mkdir -p cypress/screenshots cypress/videos cypress/reports \
    && chown -R cypress:cypress cypress/

# Switch to non-root user
USER cypress

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD npx cypress verify || exit 1

# Default command for production
CMD ["npm", "run", "cy:run:headless"]

# Stage 4: CI/CD optimized image
FROM cypress/included:12.17.4 as ci

WORKDIR /workspace

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for CI)
RUN npm ci

# Copy application code
COPY . .

# Create user and set permissions
RUN groupadd -r cypress && useradd -r -g cypress cypress \
    && mkdir -p /home/cypress \
    && chown -R cypress:cypress /home/cypress \
    && chown -R cypress:cypress /workspace

# Create reports directory
RUN mkdir -p cypress/screenshots cypress/videos cypress/reports allure-results \
    && chown -R cypress:cypress cypress/ \
    && chown -R cypress:cypress allure-results/

USER cypress

# Default command for CI
CMD ["npm", "run", "cy:run"]