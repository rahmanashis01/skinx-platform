#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# SkinX Deployment Health Check Script
# ============================================================================
# Checks internal services and optionally public endpoints.
# Internal checks retry up to 30 times with 2-second delays.
# Public checks warn only (DNS/SSL may not be ready on first deploy).
#
# Frontend health checks:
# - Internal: Checks Docker container at 127.0.0.1:3000 (build artifact source)
# - Public: Checks Nginx static serving at 127.0.0.1/ (production serving)
# ============================================================================

MAX_RETRIES=30
RETRY_DELAY=2

# ----------------------------------------------------------------------------
# Helper: Retry health check
# ----------------------------------------------------------------------------
check_service() {
  local service_name="$1"
  local url="$2"
  local attempt=1

  echo "Checking ${service_name}..."

  while [ $attempt -le $MAX_RETRIES ]; do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      echo "✓ ${service_name} OK"
      return 0
    fi

    if [ $attempt -lt $MAX_RETRIES ]; then
      echo "  Attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
      attempt=$((attempt + 1))
    else
      echo "ERROR: ${service_name} health check failed after ${MAX_RETRIES} attempts" >&2
      return 1
    fi
  done
}

# ============================================================================
# Internal Health Checks (Required - Fail Hard)
# ============================================================================

echo "=== Internal Health Checks ==="
echo ""

check_service "Frontend Container" "http://127.0.0.1:3000/" || exit 1
check_service "Backend" "http://127.0.0.1:5001/health" || exit 1
check_service "Model API" "http://127.0.0.1:8080/health" || exit 1
check_service "RAG Backend" "http://127.0.0.1:8000/health" || exit 1
check_service "Telegram Bot" "http://127.0.0.1:5050/health" || exit 1

# ============================================================================
# Static Frontend Serving Check (Production)
# ============================================================================

echo ""
echo "=== Static Frontend Serving Check (Production) ==="
echo ""

# Check if static files directory exists and has content
if [[ -d /var/www/skinx/frontend-static && -n "$(ls -A /var/www/skinx/frontend-static 2>/dev/null)" ]]; then
  echo "✓ Frontend static files directory exists: /var/www/skinx/frontend-static/"

  # Count files
  FILE_COUNT=$(find /var/www/skinx/frontend-static -type f | wc -l)
  echo "  Contains ${FILE_COUNT} files"
else
  echo "WARNING: Frontend static files directory is empty or missing" >&2
  echo "  Expected: /var/www/skinx/frontend-static/" >&2
  echo "  This is expected on first deployment before deploy-prod.sh completes" >&2
fi

# Check Nginx serving static frontend
# If PROD_DOMAIN is set, check the public HTTPS endpoint
# Otherwise, warn and skip (http://127.0.0.1/ may return 404 without Host header)
if [[ -n "${PROD_DOMAIN:-}" ]]; then
  NGINX_URL="https://${PROD_DOMAIN}/"
  check_service "Nginx Frontend (Static)" "${NGINX_URL}" || exit 1
else
  echo "WARNING: Nginx Frontend (Static) check skipped (PROD_DOMAIN not set)"
  echo "  Static files directory check passed. Public HTTPS endpoint will be checked in public health checks."
fi

# ============================================================================
# Public Health Checks (Optional - Warn Only)
# ============================================================================

echo ""
echo "=== Public Health Checks ==="
echo ""

if [[ -n "${PROD_DOMAIN:-}" ]]; then
  PUBLIC_URL="https://${PROD_DOMAIN}"

  echo "Checking public URL: ${PUBLIC_URL}"
  if ! curl -fsS "${PUBLIC_URL}" >/dev/null 2>&1; then
    echo "WARNING: Public URL check failed (${PUBLIC_URL})"
    echo "This is expected if DNS/Cloudflare/SSL is not ready yet"
  else
    echo "✓ Public URL OK"
  fi

  echo "Checking public health endpoint: ${PUBLIC_URL}/health"
  if ! curl -fsS "${PUBLIC_URL}/health" >/dev/null 2>&1; then
    echo "WARNING: Public health endpoint check failed (${PUBLIC_URL}/health)"
    echo "This is expected if DNS/Cloudflare/SSL is not ready yet"
  else
    echo "✓ Public health endpoint OK"
  fi
else
  echo "PROD_DOMAIN not set - skipping public health checks"
  echo "Set PROD_DOMAIN to enable public endpoint validation"
fi

echo ""
echo "✓ Health checks completed successfully"
