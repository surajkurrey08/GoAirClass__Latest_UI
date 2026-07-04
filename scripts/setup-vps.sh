#!/usr/bin/env bash
# First-time VPS setup script for GoAirClass
# Run as root or a sudo user on Ubuntu 22.04 / 24.04

set -euo pipefail

APP_DIR="/opt/goairclass"
REPO_URL="https://github.com/onlinegologistics/GoAirClass_V3.git"

echo "==> Installing Docker and firewall tools..."
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg lsb-release ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "==> Starting Docker..."
systemctl enable --now docker

echo "==> Configuring firewall..."
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 80/tcp >/dev/null 2>&1 || true
ufw allow 443/tcp >/dev/null 2>&1 || true
ufw --force enable

echo "==> Cloning repo..."
mkdir -p "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR" || (cd "$APP_DIR" && git pull)

echo "==> Setting up .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ""
  echo "ACTION REQUIRED: Edit $APP_DIR/.env with your real secrets before continuing."
  echo "Then re-run: cd $APP_DIR && docker compose up -d"
  exit 0
fi

echo "==> Starting services..."
cd "$APP_DIR"
docker compose up -d --build

echo ""
echo "✓ GoAirClass is running at http://$(curl -s ifconfig.me)"
