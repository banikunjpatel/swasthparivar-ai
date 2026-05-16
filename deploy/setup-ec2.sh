#!/usr/bin/env bash
# deploy/setup-ec2.sh
# Run once on a fresh AWS EC2 Ubuntu 22.04 instance.
# Usage: bash setup-ec2.sh

set -euo pipefail

REPO_URL="https://github.com/banikunjpatel/swasthparivar-ai.git"  # update if different
APP_DIR="/home/ubuntu/swasthparivar-ai"
NGINX_SITE="swasth-backend"

echo "=== [1/7] System update ==="
sudo apt-get update -y && sudo apt-get upgrade -y

echo "=== [2/7] Install Docker ==="
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker ubuntu
  echo "Docker installed. NOTE: log out and back in (or newgrp docker) for group to take effect."
fi

# Docker Compose v2 plugin
if ! docker compose version &>/dev/null 2>&1; then
  sudo apt-get install -y docker-compose-plugin
fi

echo "=== [3/7] Install Nginx & Certbot ==="
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== [4/7] Clone / update repo ==="
if [ -d "$APP_DIR" ]; then
  echo "Repo already exists — pulling latest..."
  git -C "$APP_DIR" fetch origin && git -C "$APP_DIR" reset --hard origin/feature/prakriti
else
  git clone --branch feature/prakriti "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "=== [5/7] Copy .env ==="
if [ ! -f ".env" ]; then
  echo "ERROR: Place your production .env file at $APP_DIR/.env and re-run."
  echo "See .env.production.example for required variables."
  exit 1
fi

echo "=== [6/7] Configure Nginx ==="
# Replace placeholder domain in nginx config
read -rp "Enter your domain or EC2 public IP (e.g. api.swasthparivar.com): " DOMAIN
sed "s/YOUR_DOMAIN_OR_IP/$DOMAIN/g" "$APP_DIR/nginx/nginx.conf" \
  | sudo tee "/etc/nginx/sites-available/$NGINX_SITE" > /dev/null

sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" "/etc/nginx/sites-enabled/$NGINX_SITE"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# SSL — skip if IP only (can't issue cert for bare IP)
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "IP address detected — skipping Certbot. Access over HTTP only."
  echo "Update nginx/nginx.conf to remove SSL block if using IP directly."
else
  echo "Obtaining Let's Encrypt certificate for $DOMAIN..."
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"
fi

echo "=== [7/7] Build & start container ==="
docker compose -f "$APP_DIR/docker-compose.yml" pull || true
docker compose -f "$APP_DIR/docker-compose.yml" up -d --build

echo ""
echo "✅  Setup complete!"
echo "   Backend:  http://$DOMAIN/health"
echo "   API docs: http://$DOMAIN/docs"
echo ""
echo "Next steps:"
echo "  - Point your frontend VITE_API_URI to https://$DOMAIN/api/v1"
echo "  - Add $DOMAIN to ALLOWED_ORIGINS in .env and redeploy"
