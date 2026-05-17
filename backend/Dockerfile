# Backend (Laravel) — pinned Debian for reproducible apt installs
FROM php:8.2-fpm-bookworm

WORKDIR /app

# System deps + cleanup in one layer (correct apt lists path)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    libzip-dev \
    git \
    curl \
    libonig-dev \
    sqlite3 \
    libsqlite3-dev \
    libmagickwand-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_sqlite pdo_mysql mbstring exif pcntl bcmath gd zip

# PECL: MongoDB required; Imagick can fail on some hosts — do not block image build
RUN pecl install mongodb && docker-php-ext-enable mongodb \
    && (pecl install imagick && docker-php-ext-enable imagick || true)

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock* /app/

RUN composer install --no-dev --no-interaction --optimize-autoloader --ignore-platform-req=ext-mongodb

COPY . /app/

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/storage/logs /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache

RUN php artisan key:generate --force --no-interaction 2>/dev/null || true

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
