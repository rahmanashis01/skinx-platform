#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/skinx/app}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_DIR}/docker-compose.prod.yml}"
DEPLOY_SERVICE="${DEPLOY_SERVICE:-all}"

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

echo "=== SkinX Deployment ==="
echo "Service: ${DEPLOY_SERVICE}"
echo "Image Tag: ${IMAGE_TAG}"
echo ""

# Deploy based on service selection
if [[ "${DEPLOY_SERVICE}" == "all" ]]; then
  # Full deployment - pull and restart all services
  echo "Pulling latest images for all services..."
  docker compose -f "${COMPOSE_FILE}" pull

  echo "Starting all services..."
  docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

  echo "Service status:"
  docker compose -f "${COMPOSE_FILE}" ps

  # Run full healthcheck if executable
  if [[ -x deploy/healthcheck.sh ]]; then
    echo ""
    echo "Running health checks..."
    PROD_DOMAIN="${PROD_DOMAIN:-}" deploy/healthcheck.sh
  fi

elif [[ "${DEPLOY_SERVICE}" =~ ^(frontend|backend|model-api|rag-backend|telegram-bot)$ ]]; then
  # Service-specific deployment
  echo "Pulling latest image for ${DEPLOY_SERVICE}..."
  docker compose -f "${COMPOSE_FILE}" pull "${DEPLOY_SERVICE}"

  echo "Restarting ${DEPLOY_SERVICE} service..."
  docker compose -f "${COMPOSE_FILE}" up -d --no-deps "${DEPLOY_SERVICE}"

  echo "Service status:"
  docker compose -f "${COMPOSE_FILE}" ps "${DEPLOY_SERVICE}"

  # Run targeted health check with retries
  echo ""
  echo "Running targeted health check for ${DEPLOY_SERVICE}..."

  MAX_RETRIES=30
  RETRY_DELAY=2
  attempt=1

  case "${DEPLOY_SERVICE}" in
    frontend)
      HEALTH_URL="http://127.0.0.1:3000/"
      ;;
    backend)
      HEALTH_URL="http://127.0.0.1:5001/health"
      ;;
    model-api)
      HEALTH_URL="http://127.0.0.1:8080/health"
      ;;
    rag-backend)
      HEALTH_URL="http://127.0.0.1:8000/health"
      ;;
    telegram-bot)
      HEALTH_URL="http://127.0.0.1:5050/health"
      ;;
  esac

  while [ $attempt -le $MAX_RETRIES ]; do
    if curl -fsS "${HEALTH_URL}" >/dev/null 2>&1; then
      echo "✓ ${DEPLOY_SERVICE} is healthy"
      break
    fi

    if [ $attempt -lt $MAX_RETRIES ]; then
      echo "  Attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
      attempt=$((attempt + 1))
    else
      echo "ERROR: ${DEPLOY_SERVICE} health check failed after ${MAX_RETRIES} attempts" >&2
      echo "Manual check: curl -fsS ${HEALTH_URL}" >&2
      exit 1
    fi
  done

else
  echo "ERROR: Invalid DEPLOY_SERVICE value: ${DEPLOY_SERVICE}" >&2
  echo "Valid values: all, frontend, backend, model-api, rag-backend, telegram-
bot" >&2
  exit 1
fi

echo ""
echo "✓ Deployment completed successfully"
