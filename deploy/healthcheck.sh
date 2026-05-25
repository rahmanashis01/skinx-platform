#!/usr/bin/env bash
set -euo pipefail

PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://skin-x.app}"

curl -fsS http://127.0.0.1:3000/ >/dev/null
curl -fsS http://127.0.0.1:5001/health >/dev/null
curl -fsS http://127.0.0.1:8080/health >/dev/null
curl -fsS http://127.0.0.1:8000/health >/dev/null
curl -fsS http://127.0.0.1:5050/health >/dev/null
curl -fsS "${PUBLIC_BASE_URL}/health" >/dev/null

echo "Health checks passed"
