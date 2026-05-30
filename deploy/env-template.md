# Production Secret File Templates

Create these files on the VPS under `/var/www/skinx/secrets/`.

## `/var/www/skinx/secrets/backend.env`

Required for production:

```dotenv
PORT=5001
NODE_ENV=production

# Email Service (SendGrid via SMTP)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxx_your_sendgrid_api_key_here
EMAIL_FROM=noreply@skin-x.app
EMAIL_FROM_NAME=SkinX Support

# Turnstile Widget Verification (Server-side secret key)
TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxxxxxxxxxx
OTP_EXPIRY_MINUTES=10
MAX_OTP_ATTEMPTS=5
RESEND_COOLDOWN_SECONDS=60
FRONTEND_URL=https://skin-x.app
AUTH0_AUDIENCE=
AUTH0_ISSUER_BASE_URL=
MODEL_API_URL=http://model-api:8080
RAG_API_URL=http://rag-backend:8000
UPLOAD_DIR=/app/uploads
MODEL_TYPE=rest_api
MODEL_API_TIMEOUT_MS=120000
MODEL_API_KEY=
USE_MOCK_FALLBACK=false

# PostgreSQL Database Configuration - REQUIRED FOR PRODUCTION
USE_DATABASE=true
DATABASE_URL=postgresql://skinx:your_strong_password@postgres:5432/skinx
POSTGRES_DB=skinx
POSTGRES_USER=skinx
POSTGRES_PASSWORD=your_strong_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DB_MAX_CONNECTIONS=20
DB_STATEMENT_TIMEOUT=30000
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false
```

## `/var/www/skinx/secrets/model-api.env`

```dotenv
MODEL_DIR=
CLASS_CSV_PATH=
EFFICIENTNET_MODEL_PATH=
MEDSAM_MODEL_PATH=
MOBILENET_MODEL_PATH=

# Image Validation Thresholds (production tuning)
SKIN_VALIDATION_THRESHOLD=0.70
MIN_SKIN_COLOR_RATIO=0.15

LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=
OPENROUTER_BASE_URL=
LLM_TIMEOUT_SECONDS=12
PORT=
HOST=
DEBUG=
```

## `/var/www/skinx/secrets/rag-backend.env`

```dotenv
CHUNKS_PATH=/app/data/chunks/skinx_chunks.json
SYSTEM_PROMPT_PATH=/app/data/system_prompt.md
CHROMA_PERSIST_DIR=/app/data/chroma_db
CHROMA_COLLECTION_NAME=
EMBEDDING_MODEL_NAME=
TOP_K=
RAG_PORT=
MAX_CONTEXT_CHARS=
DEBUG_RAG=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_FALLBACK_MODEL=
```

## `/var/www/skinx/secrets/telegram-bot.env`

```dotenv
TELEGRAM_BOT_TOKEN=
BOT_MODE=
BOT_PORT=
BACKEND_API_URL=
MODEL_API_URL=
WEBHOOK_URL=
WEBHOOK_SECRET=
```
