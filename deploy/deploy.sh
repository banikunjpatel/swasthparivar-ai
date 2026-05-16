#!/usr/bin/env bash
# deploy/deploy.sh
# Manual re-deploy on EC2 (mirrors what GitHub Actions does).
# Usage:
#   bash deploy/deploy.sh            # rebuild + restart
#   bash deploy/deploy.sh --pull     # git pull first, then rebuild + restart
#   bash deploy/deploy.sh --no-cache # force full Docker rebuild

set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/swasthparivar-ai}"
COMPOSE="docker compose -f $APP_DIR/docker-compose.yml"
NO_CACHE=""

for arg in "$@"; do
  case $arg in
    --pull)     PULL=true ;;
    --no-cache) NO_CACHE="--no-cache" ;;
  esac
done

cd "$APP_DIR"

if [[ "${PULL:-false}" == "true" ]]; then
  echo "=== Pulling latest code from feature/prakriti ==="
  git fetch origin feature/prakriti
  git reset --hard origin/feature/prakriti
fi

echo "=== Building Docker image ==="
$COMPOSE build $NO_CACHE backend

echo "=== Restarting container (rolling) ==="
$COMPOSE up -d --no-deps backend

echo "=== Waiting for health check (up to 60s) ==="
for i in $(seq 1 12); do
  sleep 5
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' swasth-backend 2>/dev/null || echo "starting")
  echo "  [$i/12] Health: $STATUS"
  if [[ "$STATUS" == "healthy" ]]; then
    echo "✅  Container is healthy."
    break
  fi
  if [[ $i -eq 12 ]]; then
    echo "❌  Not healthy after 60s. Logs:"
    $COMPOSE logs --tail=100 backend
    exit 1
  fi
done

echo "=== Pruning dangling images ==="
docker image prune -f

echo ""
echo "✅  Deploy complete!"
$COMPOSE ps
