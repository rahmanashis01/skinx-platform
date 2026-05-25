#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/skinx/app}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_DIR}/docker-compose.prod.yml}"

: "${DOCKERHUB_USERNAME:?DOCKERHUB_USERNAME is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

export DOCKERHUB_USERNAME
export IMAGE_TAG

# Export PROD_DOMAIN if provided
if [[ -n "${PROD_DOMAIN:-}" ]]; then
  export PROD_DOMAIN
fi

# Check required secret files exist
for secret_file in \
  /var/www/skinx/secrets/backend.env \
  /var/www/skinx/secrets/model-api.env \
  /var/www/skinx/secrets/rag-backend.env \
  /var/www/skinx/secrets/telegram-bot.env
do
  [[ -f "${secret_file}" ]] || {
    echo "Missing required secret file: ${secret_file}" >&2
    exit 1
  }
done

cd "${PROJECT_DIR}"

echo "Pulling latest images..."
docker compose -f "${COMPOSE_FILE}" pull

echo "Starting services..."
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

echo "Service status:"
docker compose -f "${COMPOSE_FILE}" ps

# Run healthcheck if executable
if [[ -x deploy/healthcheck.sh ]]; then
  echo "Running health checks..."
  PROD_DOMAIN="${PROD_DOMAIN:-}" deploy/healthcheck.sh
fi
