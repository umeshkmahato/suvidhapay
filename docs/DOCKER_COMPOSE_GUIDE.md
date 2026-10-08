# Docker Compose Guide

This project now uses a **shared base compose file** with **small environment-specific overrides**.

## File layout

- `docker-compose.yml` - common services and defaults
- `docker-compose.local.yml` - local-only helpers
- `docker-compose.dev.yml` - dev/staging behavior
- `docker-compose.prod.yml` - production behavior

## Why this structure

Before cleanup, the compose files were mostly duplicated. The current setup keeps shared configuration in one place and limits each override file to the behavior that is truly environment-specific.

## Recommended commands

If you prefer shorter commands, use the root `Makefile`:

```bash
make help
```

For a quick top-level sanity check:

```bash
make verify
```

### Local

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Shortcut:

```bash
make local-up
```

Local stack includes:
- PostgreSQL exposed on `localhost:5432`
- API on `http://localhost:3001`
- Web on `http://localhost:3000`
- Adminer on `http://localhost:8080`

### Dev / staging

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Shortcut:

```bash
make dev-up
```

Dev/staging stack includes:
- Restart policies enabled
- PostgreSQL exposed on `localhost:5432`
- No Adminer by default

### Production-style

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Shortcut:

```bash
make prod-up
```

Production notes:
- Replace all placeholder secrets first
- Frontend build values come from `.env.prod`
- Restart policies are enabled
- Postgres is not published to the host by default

## Common operations

### Check merged config

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml config
```

### Check status

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml ps
```

### View logs

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml logs -f
```

### Stop stack

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down
```

### Remove stack and volumes

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down -v
```

### Open Postgres shell

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml exec postgres psql -U postgres -d suvidhapay
```

Shortcut:

```bash
make shell-db
```

### Open API shell

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml exec api /bin/sh
```

Shortcut:

```bash
make shell-api
```

### Check local API health

```bash
make local-health
```

## Build/runtime behavior worth knowing

### Frontend env handling

The frontend is built with Vite, so `VITE_*` variables must be available **during image build**, not only when the Nginx container starts.

That is now handled correctly through compose build arguments in `docker-compose.yml`.

### Resource isolation

Each environment sets its own `COMPOSE_PROJECT_NAME`, which prevents local, dev, and prod runs on the same machine from reusing the same named volume accidentally.

### Health checks

- `postgres` uses `pg_isready`
- `api` checks `GET /health`
- `web` image exposes Nginx with a simple health check

## Best practices adopted

- Use `docker compose` instead of legacy `docker-compose`
- Keep one shared compose base
- Keep override files small
- Build frontend env into the image explicitly
- Use `.dockerignore` in each app context
- Use `npm ci` for reproducible image builds
- Run the API container as a non-root user

## Troubleshooting

### Port conflict

```bash
lsof -i :3000
lsof -i :3001
lsof -i :5432
lsof -i :8080
```

### Compose interpolation issue

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml config | cat
```

### Rebuild without cache

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml build --no-cache
```
