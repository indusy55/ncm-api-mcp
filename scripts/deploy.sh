#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Pulling latest code ==="
git pull

echo "=== Building Docker images ==="
docker compose build

echo "=== Restarting services ==="
docker compose up -d --remove-orphans

echo "=== Cleaning up old images ==="
docker image prune -f

echo "=== Done ==="
echo "Platform:  http://$(curl -s ifconfig.me):80"
echo "Health:    http://localhost:3001/health"
