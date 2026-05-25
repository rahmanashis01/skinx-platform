# skinX Platform - Production Monorepo

AI-powered skin condition analysis platform with comprehensive dermatological insights.

## Architecture

This is a production-ready microservices monorepo containing:

### Services

- **frontend/** - React/Vite web application
- **backend/** - Node.js/Express API server
- **model-api/** - Python FastAPI service for ML model inference
- **rag-backend/** - Python service for RAG-based AI assistant
- **telegram-bot/** - Telegram bot integration

### Infrastructure

- **nginx/** - Reverse proxy configurations
- **deploy/** - Deployment scripts and configurations
- **.github/workflows/** - CI/CD pipelines

## Technology Stack

- **Frontend**: React, Vite, TailwindCSS, Auth0
- **Backend**: Node.js, Express, PostgreSQL, SendGrid
- **Model API**: Python, FastAPI, PyTorch, Transformers
- **RAG**: Python, OpenRouter, Vector DB
- **Telegram**: Node.js, Telegram Bot API
- **Infrastructure**: Docker, Nginx, GitHub Actions

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)

### Local Development

Each service can be run independently. See individual service READMEs:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Model API README](./model-api/README.md)
- [RAG Backend README](./rag-backend/README.md)
- [Telegram Bot README](./telegram-bot/README.md)

### Production Deployment

```bash
# Build and deploy all services
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

Each service requires its own `.env` file. See `.env.example` in each service directory.

## License

Proprietary - All rights reserved
