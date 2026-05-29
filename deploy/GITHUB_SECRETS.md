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

## Optional Variables

- `CLEANUP_DOCKER_IMAGES` - Enable/disable Docker image cleanup after deploy (default: `true`)
  - Set to `false` to skip cleanup (useful for debugging or if disk space is not a concern)
  - When `true`, removes dangling images, old build cache, and unused images older than 24 hours
  - **IMPORTANT**: Cleanup only removes unused image layers, NOT running containers or Docker volumes (data is preserved)

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

## Docker Image Cleanup

After each successful deployment, unused Docker images and build cache are automatically cleaned up (if `CLEANUP_DOCKER_IMAGES=true`). This prevents VPS disk exhaustion from accumulated image layers, especially from large model-api and rag-backend images.

**What gets cleaned:**
- Dangling images (intermediate layers from failed or old builds)
- Unused build cache
- Images unused for more than 24 hours

**What is preserved (NOT deleted):**
- Running containers and their data
- Named Docker volumes (ChromaDB, model files, uploads, secrets)
- Active image layers for currently running services

**To disable cleanup** (if needed for debugging):
Set `CLEANUP_DOCKER_IMAGES=false` in GitHub Actions environment or as a workflow variable.