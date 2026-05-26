# GitHub Actions Required Configuration

Configure these before running `.github/workflows/deploy-prod.yml`:

## Required Secrets

Navigate to: `Settings → Secrets and variables → Actions → Secrets`

Add the following repository secrets:

- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Your Docker Hub access token (generate at hub.docker.com)
- `VPS_HOST` - VPS IP address (e.g., `1.2.3.4`)
- `VPS_USER` - VPS SSH user (e.g., `ubuntu`)
- `VPS_SSH_KEY` - Private SSH key for VPS access (full key content)
- `VPS_PORT` - SSH port (typically `22`)

## Required Variables

Navigate to: `Settings → Secrets and variables → Actions → Variables`

Add the following repository variable:

- `PROD_DOMAIN` - Production domain (e.g., `skin-x.app`)

## Workflow Behavior

- **Pull Request to main**: Validation only (no deployment)
- **Push to main**: Build, push to Docker Hub, and deploy to VPS
- **Manual workflow_dispatch**: Build, push, and deploy on demand

## VPS Requirements

The VPS must have these secret files at `/var/www/skinx/secrets/`:
- `backend.env`
- `model-api.env`
- `rag-backend.env`
- `telegram-bot.env`

See [env-template.md](./env-template.md) for required environment variables.

## Deployment Path

All files are deployed to: `/var/www/skinx/app/`
