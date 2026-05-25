#!/usr/bin/env bash
set -euo pipefail

echo "=== Internal Health Checks ==="

echo "Checking frontend..."
if ! curl -fsS http://127.0.0.1:3000/ >/dev/null 2>&1; then
  echo "ERROR: Frontend health check failed" >&2
  exit 1
fi
echo "✓ Frontend OK"

echo "Checking backend..."
if ! curl -fsS http://127.0.0.1:5001/health >/dev/null 2>&1; then
  echo "ERROR: Backend health check failed" >&2
  exit 1
fi
echo "✓ Backend OK"

echo "Checking model-api..."
if ! curl -fsS http://127.0.0.1:8080/health >/dev/null 2>&1; then
  echo "ERROR: Model API health check failed" >&2
  exit 1
fi
echo "✓ Model API OK"

echo "Checking rag-backend..."
if ! curl -fsS http://127.0.0.1:8000/health >/dev/null 2>&1; then
  echo "ERROR: RAG Backend health check failed" >&2
  exit 1
fi
echo "✓ RAG Backend OK"

echo "Checking telegram-bot..."
if ! curl -fsS http://127.0.0.1:5050/health >/dev/null 2>&1; then
  echo "ERROR: Telegram Bot health check failed" >&2
  exit 1
fi
echo "✓ Telegram Bot OK"

echo ""
echo "=== Public Health Checks ==="

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
echo "Health checks completed"
