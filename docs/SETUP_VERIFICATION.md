# Setup Verification
## What was cleaned up
- Reduced heavy duplication across Docker Compose files
- Standardized Docker commands on `docker compose`
- Separated root Compose env files from app-local runtime `.env` files
- Fixed frontend Docker env handling for Vite build-time variables
- Aligned local backend defaults to port `3001`
- Added `.dockerignore` files and reproducible `npm ci` image builds
- Added environment-specific Compose project names to avoid volume collisions
## Current Compose model
| File | Role |
|---|---|
| `docker-compose.yml` | Shared base services |
| `docker-compose.local.yml` | Local-only extras |
| `docker-compose.dev.yml` | Dev/staging override |
| `docker-compose.prod.yml` | Production override |
## Validation checklist
### Compose validation
Use these commands to validate the merged configs:
```bash
cd ~/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml config
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml config
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml config
```
### App validation
Backend local config expectations:
- default port `3001`
- local DB host `localhost`
- frontend CORS origin `http://localhost:3000`
Frontend local config expectations:
- API base URL `http://localhost:3001/api`
### Image build improvements verified in config
- frontend build args are wired from root env files
- API container health check targets `/health`
- Postgres uses health checks before API startup
- non-root Node execution is configured in the API image
## Recommended smoke tests
```bash
curl http://localhost:3001/health
```
```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml ps
```
```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml logs -f
```
## Documentation source of truth
- `README.md` for the overall setup
- `DOCKER_COMPOSE_GUIDE.md` for Docker workflow
- `ENV_SETUP_GUIDE.md` for env-file usage
- `ENVIRONMENT_CONFIGURATION.md` for variable reference
