#!/bin/sh
set -e
cd /app

# Ensure writable dirs when bind-mounting from Windows
mkdir -p storage/logs bootstrap/cache 2>/dev/null || true
chmod -R ug+rwX storage bootstrap/cache 2>/dev/null || true

# Bind-mount hides image vendor — install deps when missing
if [ ! -f vendor/autoload.php ] && [ -f composer.json ]; then
  composer install --no-interaction --optimize-autoloader --ignore-platform-req=ext-mongodb
fi

if [ -f artisan ]; then
  php artisan key:generate --force --no-interaction 2>/dev/null || true
  php artisan migrate --force --no-interaction 2>/dev/null || true
fi

exec "$@"
