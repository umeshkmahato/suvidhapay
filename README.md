# SuvidhaPay

Municipal collection management system built with React, Node.js/Express, PostgreSQL, and Docker.

## Start here

- Use this `README.md` for the main day-to-day workflow.
- Do **not** copy the root Docker env files into `SuvidhaPay-api/` or `SuvidhaPay-web/`.

## Quick start

### Option 1: Full stack with Docker

Local development stack:

```bash
cd ~/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Staging/development stack:

```bash
cd ~/SuvidhaPay
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Production-style stack:

```bash
cd ~/SuvidhaPay
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Or use the new shortcuts:

```bash
make local-up
make dev-up
make prod-up
make verify
```

Access points:
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432` in local/dev overrides
- Adminer: `http://localhost:8080` in local override only

The API container now bootstraps the database automatically on startup by running migrations and seed data before launching the server. This makes a fresh Docker bring-up immediately usable for Phase 1 login and vehicle workflows.

### Option 2: Run apps locally without Docker

1. Backend:

```bash
cd ~/SuvidhaPay/SuvidhaPay-api
cp .env.example .env
npm install
npm run migrate
npm run dev
```

2. Frontend:

```bash
cd ~/SuvidhaPay/SuvidhaPay-web
cp .env.example .env
npm install
npm run dev
```

In local app mode the backend defaults to port `3001`, which matches the frontend Vite proxy and API client fallback.

## Cleaned Docker structure

The Docker setup now follows a shared-base pattern:

- `docker-compose.yml` - common services and shared configuration
- `docker-compose.local.yml` - local-only overrides like Adminer and exposed Postgres
- `docker-compose.dev.yml` - restart-oriented dev/staging overrides
- `docker-compose.prod.yml` - production override layer

This removes the old 90% duplication between compose files.

## Environment file strategy

There are two env scopes and they are intentionally separate:

### 1. Root env files for Docker Compose

- `.env.local`
- `.env.dev`
- `.env.prod`
- `.env.example`

These files drive Compose interpolation, host port mappings, image build args, and container runtime variables.

### 2. App-local env files for running npm scripts directly

- `SuvidhaPay-api/.env`
- `SuvidhaPay-web/.env`

Create those by copying each app's own `.env.example`.

Do **not** copy the root Docker env files into the app directories; they serve a different purpose.

## Common commands

Shortcut help:

```bash
make help
```

Run the top-level verification workflow:

```bash
make verify
```

Start local stack:

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

View status:

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml ps
```

View logs:

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml logs -f
```

Stop stack:

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down
```

Reset database volume:

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down -v
```

Equivalent Makefile shortcuts:

```bash
make local-up
make local-ps
make local-logs
make local-down
make local-rebuild
make api-lint
make web-build
make local-health
```

## Validation notes

Important cleanup fixes included:
- Frontend `VITE_*` variables are now passed at image build time, which is the correct pattern for Vite builds inside Docker.
- Local backend defaults now use port `3001`, matching the frontend proxy and docs.
- Compose project names isolate local, dev, and prod resources so volumes do not collide.
- App images now use `npm ci` and `.dockerignore` files for cleaner, more reproducible builds.


## Project structure

```text
SuvidhaPay/
├── SuvidhaPay-api/
├── SuvidhaPay-web/
├── docker-compose.yml
├── docker-compose.local.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── *.md
```

## Troubleshooting

### Ports already in use

```bash
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

### Check merged Compose config

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml config
```

### Rebuild from scratch

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down -v
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```
