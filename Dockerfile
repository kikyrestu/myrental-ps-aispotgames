# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy package files
COPY frontend/package*.json ./
# Install dependencies
RUN npm install
# Copy frontend source code
COPY frontend/ ./
# Build the frontend application
RUN npm run build

# Stage 2: Serve Backend & Frontend
FROM php:8.2-apache

# Install necessary PHP extensions for MariaDB/MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache modules (mod_rewrite for routing)
RUN a2enmod rewrite headers

# Create directories
WORKDIR /var/www/html

# Copy Backend Files
COPY backend/ ./backend/

# Set up storage and uploads if needed (e.g. for member photos, though not used yet)
# RUN mkdir -p backend/storage && chown -R www-data:www-data backend/storage

# Copy Frontend Build from Stage 1
COPY --from=frontend-builder /app/frontend/dist/ ./public/

# Copy Apache VirtualHost config
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html
