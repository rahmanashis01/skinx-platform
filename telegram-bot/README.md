# SkinX Telegram Bot — Phase 1

AI-assisted skin health assistant delivered via Telegram.

---

## Project Structure

```
skinx-telegram-bot/
├── bot.js                  # Entry point — bot initialisation and command handlers
├── package.json
├── .env.example            # Environment variable template
├── README.md
├── services/               # Phase 2+: skinxService.js (RAG), photoService.js
├── utils/
│   ├── logger.js           # Lightweight structured logger
│   └── constants.js        # Shared command strings & endpoint paths
├── tmp/                    # Temporary file storage (e.g. uploaded images)
└── logs/                   # Log file output (future)
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your `TELEGRAM_BOT_TOKEN`:

```
TELEGRAM_BOT_TOKEN=
```

> Create a bot and get a token via [@BotFather](https://t.me/BotFather) on Telegram.

### 3. Run the bot

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token from @BotFather | *(required)* |
| `BOT_MODE` | `polling` (local dev) or `webhook` (production) | `polling` |
| `BOT_PORT` | HTTP server port (used in webhook mode) | `5050` |
| `BACKEND_API_URL` | Base URL of the SkinX Node.js backend | `http://backend:5001` |
| `MODEL_API_URL` | Internal model-api base URL (reserved for direct integration) | `http://model-api:8080` |
| `WEBHOOK_URL` | Public HTTPS URL for webhook delivery | — |
| `WEBHOOK_SECRET` | Secret token for webhook verification | — |

---

## Commands

| Command | Description |
|---|---|
| `/start` | Welcome message and bot introduction |
| `/help` | Show all available commands |
| `/ask` | *(Phase 2)* Ask a skin-health question via RAG |
| `/scan` | *(Phase 2)* Upload a skin image for AI screening |

---

## Architecture

```
Telegram User
     │
     ▼
SkinX Telegram Bot  (this service — Node.js)
     │
     ├─ POST /api/ask                (Phase 2 — text Q&A via RAG)
     └─ POST /api/analyze-photo/public  (Phase 2 — image analysis)
          │
          ▼
     SkinX Backend  (existing Node.js service)
```

This bot is a **standalone service** — it must not be merged into the existing SkinX backend.

---

## Development Phases

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | Project skeleton, `/start`, `/help` |
| Phase 2 | 🔜 | `/ask` command → `POST /api/ask` |
| Phase 3 | 🔜 | `/scan` command → `POST /api/analyze-photo/public` |
| Phase 4 | 🔜 | Webhook mode + production deployment |

---

## License

MIT
