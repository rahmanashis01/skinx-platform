#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="${BASE_DIR:-/var/www/skinx}"
PROJECT_DIR="${PROJECT_DIR:-${BASE_DIR}/skinx_platform}"

echo "Preparing VPS directories under ${BASE_DIR}"

mkdir -p \
  "${BASE_DIR}/data/models" \
  "${BASE_DIR}/data/uploads" \
  "${BASE_DIR}/data/rag" \
  "${BASE_DIR}/logs/backend" \
  "${BASE_DIR}/logs/model-api" \
  "${BASE_DIR}/logs/rag-backend" \
  "${BASE_DIR}/logs/telegram-bot" \
  "${BASE_DIR}/secrets" \
  "${PROJECT_DIR}"

chmod 700 "${BASE_DIR}/secrets"

echo "Checking local dependencies"
command -v docker >/dev/null
docker compose version >/dev/null
command -v nginx >/dev/null

echo "Bootstrap completed"
