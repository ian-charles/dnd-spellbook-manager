# Multi-stage build for D&D Spellbook Manager
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Accept BASE_PATH as a build argument (defaults to root)
ARG BASE_PATH=/
ENV BASE_PATH=${BASE_PATH}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy scripts for prepare hook
COPY scripts ./scripts

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build spell data and application with BASE_PATH
RUN npm run build:spells && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run expects the app to listen on port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
