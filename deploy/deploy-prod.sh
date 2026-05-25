#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/skinx/skinx_platform}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_DIR}/docker-compose.prod.yml}"

: "${DOCKERHUB_USERNAME:?DOCKERHUB_USERNAME is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

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

docker compose -f "${COMPOSE_FILE}" pull
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans
docker compose -f "${COMPOSE_FILE}" ps
