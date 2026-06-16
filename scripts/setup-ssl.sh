#!/usr/bin/env bash
# Run this ONCE on the VPS to get your first SSL certificates.
# After this, certbot auto-renews every 12 hours via docker compose.
#
# Prerequisites:
#   - DNS for goairclass.com, www.goairclass.com, goairclass.in, www.goairclass.in
#     must already point to this server's IP.
#   - docker compose up -d must already be running (at least nginx, backend, frontend).

set -euo pipefail

EMAIL="your-email@example.com"   # <-- change to your real email (for expiry alerts)
DOMAINS="-d goairclass.com -d www.goairclass.com -d goairclass.in -d www.goairclass.in"

APP_DIR="/opt/goairclass"
cd "$APP_DIR"

echo "==> Step 1: Start services with bootstrap (HTTP-only) nginx config..."
cp nginx/nginx.conf nginx/nginx-ssl-backup.conf
cp nginx/nginx-bootstrap.conf nginx/nginx.conf
docker compose restart nginx
sleep 3

echo "==> Step 2: Issue certificates via certbot webroot..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  $DOMAINS

echo "==> Step 3: Download recommended SSL options from Let's Encrypt..."
docker compose exec nginx sh -c "
  if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
    wget -q https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
      -O /etc/letsencrypt/options-ssl-nginx.conf
  fi
  if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
    wget -q https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
      -O /etc/letsencrypt/ssl-dhparams.pem
  fi
" 2>/dev/null || true

# Download to the certbot container's volume instead
docker compose run --rm certbot sh -c "
  if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
    wget -q https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
      -O /etc/letsencrypt/options-ssl-nginx.conf
  fi
  if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
    wget -q https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
      -O /etc/letsencrypt/ssl-dhparams.pem
  fi
"

echo "==> Step 4: Switch to full SSL nginx config..."
cp nginx/nginx-ssl-backup.conf nginx/nginx.conf
docker compose restart nginx

echo ""
echo "✓ SSL certificates issued successfully!"
echo "✓ https://goairclass.com is now live."
echo "✓ Auto-renewal is handled by the certbot container every 12 hours."
