# SuvidhaPay Quick Reference

## Start stacks

### Local Docker

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Shortcut:

```bash
make local-up
```

### Dev / staging Docker

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### Production-style Docker

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Access

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- Postgres: `localhost:5432` in local/dev
- Adminer: `http://localhost:8080` in local only

## Local npm workflow

### Backend

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay/SuvidhaPay-api
cp .env.example .env
npm install
npm run migrate
npm run dev
```

### Frontend

```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay/SuvidhaPay-web
cp .env.example .env
npm install
npm run dev
```

## Most useful Docker commands

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml ps
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml logs -f
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml down -v
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml config
```

## Makefile shortcuts

```bash
make help
make local-up
make local-logs
make local-down
make dev-up
make prod-up
make api-lint
make web-build
make verify
make local-health
```

## Files to know

- `docker-compose.yml` - shared Compose base
- `docker-compose.local.yml` - local override
- `docker-compose.dev.yml` - dev/staging override
- `docker-compose.prod.yml` - production override
- `.env.local` / `.env.dev` / `.env.prod` - root Compose env files
- `SuvidhaPay-api/.env.example` - backend local runtime example
- `SuvidhaPay-web/.env.example` - frontend local runtime example

## Key cleanup decisions

- Frontend Docker env now uses build-time Vite args
- Local backend now defaults to `3001`
- Compose overrides are thin instead of duplicated
- Compose project names isolate volumes across environments
