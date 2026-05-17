FROM php:8.4-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    mysql-client

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html/backend

# Set permissions
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/sh -D appuser
RUN chown -R appuser:appgroup /var/www/html

USER appuser

EXPOSE 9000
CMD ["php-fpm"]
