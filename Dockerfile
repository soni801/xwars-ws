FROM node:20-alpine AS build

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy application source
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine

# Create app directory and set permissions
WORKDIR /app

# Add non-root user for security
RUN addgroup -S nestjs && \
    adduser -S nestjs -G nestjs

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies only
RUN pnpm install --prod

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Change ownership of the app directory to the non-root user
RUN chown -R nestjs:nestjs /app

# Switch to non-root user
USER nestjs

# Health check - using TCP connection check since we don't have a dedicated health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD nc -z localhost 3000 || exit 1

# Command to run the application with proper signal handling
CMD ["node", "dist/main"]
