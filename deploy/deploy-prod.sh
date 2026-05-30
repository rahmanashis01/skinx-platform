#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/skinx/app}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_DIR}/docker-compose.prod.yml}"
DEPLOY_SERVICE="${DEPLOY_SERVICE:-all}"
CLEANUP_DOCKER_IMAGES="${CLEANUP_DOCKER_IMAGES:-true}"

: "${DOCKERHUB_USERNAME:?DOCKERHUB_USERNAME is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

export DOCKERHUB_USERNAME
export IMAGE_TAG

# Export PROD_DOMAIN if provided
if [[ -n "${PROD_DOMAIN:-}" ]]; then
  export PROD_DOMAIN
fi

# ============================================================================
# Create required data directories (persist across deploys)
# ============================================================================
echo "Creating required data directories..."
mkdir -p /var/www/skinx/data/postgres
mkdir -p /var/www/skinx/data/rag
mkdir -p /var/www/skinx/data/uploads
mkdir -p /var/www/skinx/logs/{backend,model-api,rag-backend,telegram-bot}
echo "✓ Data directories ready"
echo ""

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

  # Copy frontend static files from container to host
  echo ""
  echo "Copying frontend static files to host..."
  mkdir -p /var/www/skinx/frontend-static
  rm -rf /var/www/skinx/frontend-static/*
  docker cp skinx-frontend:/usr/share/nginx/html/. /var/www/skinx/frontend-static/
  echo "✓ Frontend static files copied to /var/www/skinx/frontend-static/"

  # Reload Nginx to serve new frontend files
  echo ""
  echo "Validating Nginx configuration..."
  if nginx -t >/dev/null 2>&1; then
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully"
  else
    echo "ERROR: Nginx configuration validation failed" >&2
    nginx -t >&2
    exit 1
  fi

  # Run full healthcheck if executable
  if [[ -x deploy/healthcheck.sh ]]; then
    echo ""
    echo "Running health checks..."
    PROD_DOMAIN="${PROD_DOMAIN:-}" deploy/healthcheck.sh
  fi

elif [[ "${DEPLOY_SERVICE}" == "frontend" ]]; then
  # Frontend-specific deployment
  echo "Pulling latest image for frontend..."
  docker compose -f "${COMPOSE_FILE}" pull frontend

  echo "Restarting frontend service..."
  docker compose -f "${COMPOSE_FILE}" up -d --no-deps frontend

  echo "Service status:"
  docker compose -f "${COMPOSE_FILE}" ps frontend

  # Wait for container to be ready
  echo ""
  echo "Waiting for frontend container to be ready..."
  MAX_RETRIES=30
  RETRY_DELAY=2
  attempt=1

  while [ $attempt -le $MAX_RETRIES ]; do
    if curl -fsS "http://127.0.0.1:3000/" >/dev/null 2>&1; then
      echo "✓ Frontend container is ready"
      break
    fi

    if [ $attempt -lt $MAX_RETRIES ]; then
      echo "  Attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
      attempt=$((attempt + 1))
    else
      echo "ERROR: Frontend container health check failed after ${MAX_RETRIES} attempts" >&2
      exit 1
    fi
  done

  # Copy frontend static files from container to host
  echo ""
  echo "Copying frontend static files to host..."
  mkdir -p /var/www/skinx/frontend-static
  rm -rf /var/www/skinx/frontend-static/*
  docker cp skinx-frontend:/usr/share/nginx/html/. /var/www/skinx/frontend-static/
  echo "✓ Frontend static files copied to /var/www/skinx/frontend-static/"

  # Reload Nginx to serve new frontend files
  echo ""
  echo "Validating Nginx configuration..."
  if nginx -t >/dev/null 2>&1; then
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully"
  else
    echo "ERROR: Nginx configuration validation failed" >&2
    nginx -t >&2
    exit 1
  fi

elif [[ "${DEPLOY_SERVICE}" =~ ^(backend|model-api|rag-backend|telegram-bot)$ ]]; then
  # Service-specific deployment (non-frontend)
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
  echo "Valid values: all, frontend, backend, model-api, rag-backend, telegram-bot" >&2
  exit 1
fi

# ============================================================================
# Safe Docker Image Cleanup (after successful deploy and health checks)
# ============================================================================
# NOTE: model-api and rag-backend images are very large. Cleanup prevents
# disk exhaustion from accumulated image layers during repeated deploys.
#
# IMPORTANT SAFETY GUARANTEES:
# - Only removes unused images/layers (not running containers)
# - Does NOT remove Docker volumes (named volumes, ChromaDB, model files preserved)
# - Does NOT run docker system prune -a --volumes (would delete data)
# - Cleanup failures do not fail the deployment (|| true)
# ============================================================================

if [[ "${CLEANUP_DOCKER_IMAGES}" == "true" ]]; then
  echo ""
  echo "=== Docker Image Cleanup (CLEANUP_DOCKER_IMAGES=true) ==="

  # Show disk usage before cleanup
  echo ""
  echo "Disk usage BEFORE cleanup:"
  docker system df || true
  echo ""
  df -h || true

  echo ""
  echo "Cleaning up unused images and builder cache..."

  # Remove dangling images (layers not referenced by any image)
  docker image prune -f || true

  # Remove unused builder cache
  docker builder prune -f || true

  # Remove old unused images (not used in the last 24 hours)
  # This safely removes old image tags that are no longer in use
  docker image prune -a -f --filter "until=24h" || true

  # Show disk usage after cleanup
  echo ""
  echo "Disk usage AFTER cleanup:"
  docker system df || true
  echo ""
  df -h || true

  echo "✓ Docker image cleanup completed"
else
  echo ""
  echo "Docker image cleanup skipped (CLEANUP_DOCKER_IMAGES=false)"
fi

echo ""
echo "✓ Deployment completed successfully"
