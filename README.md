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

Deployment is automated via GitHub Actions. See [deploy/GITHUB_SECRETS.md](./deploy/GITHUB_SECRETS.md) for setup.

**Deployment Path**: `/var/www/skinx/app/`

**Manual deployment** (on VPS):

```bash
# Navigate to deployment directory
cd /var/www/skinx/app

# Set required environment variables
export DOCKERHUB_USERNAME=your_dockerhub_username
export IMAGE_TAG=latest_or_commit_sha
export PROD_DOMAIN=skin-x.app

# Run deployment script
bash deploy/deploy-prod.sh
```

For detailed deployment instructions, see:
- [deploy/GITHUB_SECRETS.md](./deploy/GITHUB_SECRETS.md) - GitHub Actions setup
- [deploy/NGINX_INSTALL.md](./deploy/NGINX_INSTALL.md) - Nginx setup
- [deploy/env-template.md](./deploy/env-template.md) - Environment variables

## Environment Variables

Each service requires its own environment file on the VPS at `/var/www/skinx/secrets/`.

For development, each service has a `.env.example` file. See individual service directories.

## License

Proprietary - All rights reserved
