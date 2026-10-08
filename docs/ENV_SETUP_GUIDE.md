# Environment Setup Guide

This guide documents the cleaned environment strategy for SuvidhaPay.

## The important split

There are **two different kinds of env files** in this repository.

### A. Root env files for Docker Compose

Located in the project root:
- `.env.local`
- `.env.dev`
- `.env.prod`
- `.env.example`

These are used when running Docker Compose. They control:
- published host ports
- compose project names
- backend runtime variables injected by Compose
- frontend Vite build arguments during Docker image build

### B. App-local env files for direct npm workflows

Located inside each app:
- `SuvidhaPay-api/.env`
- `SuvidhaPay-web/.env`

Create them from:
- `SuvidhaPay-api/.env.example`
- `SuvidhaPay-web/.env.example`

These are used only when you run `npm run dev`, `npm start`, or `npm run build` directly in the app folders.

## Docker setup

### Local stack

```bash
cd ~/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

### Dev / staging stack

```bash
cd ~/SuvidhaPay
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### Production-style stack

```bash
cd ~/SuvidhaPay
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Local app setup without Docker

### Backend

```bash
cd ~/SuvidhaPay/SuvidhaPay-api
cp .env.example .env
npm install
npm run migrate
npm run dev
```

Key local backend defaults:
- `PORT=3001`
- `DB_HOST=localhost`
- `FRONTEND_URL=http://localhost:3000`

### Frontend

```bash
cd ~/SuvidhaPay/SuvidhaPay-web
cp .env.example .env
npm install
npm run dev
```

Key local frontend defaults:
- `VITE_API_BASE_URL=http://localhost:3001/api`

## Environment files at a glance

### `.env.local`
Use for local Docker work on one machine.

Highlights:
- `COMPOSE_PROJECT_NAME=suvidhapay-local`
- exposes Postgres and Adminer
- uses local URLs and dev-friendly logging

### `.env.dev`
Use for shared development or staging.

Highlights:
- `COMPOSE_PROJECT_NAME=suvidhapay-dev`
- enables restart-friendly behavior through `docker-compose.dev.yml`
- no Adminer by default

### `.env.prod`
Use only for production-like deployment.

Highlights:
- `COMPOSE_PROJECT_NAME=suvidhapay-prod`
- requires replacing placeholder secrets
- builds the frontend with production API/domain values

## Security checklist for `.env.prod`

Before using `.env.prod`:
- replace `DB_PASSWORD`
- replace `JWT_SECRET`
- replace `FRONTEND_URL`
- replace `VITE_API_BASE_URL`
- verify `NODE_ENV=production`

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Common mistakes to avoid

### Do not copy root env files into app folders

The root env files are Compose-oriented and assume container networking.

### Do not expect runtime env injection to change the built frontend image

For Vite, `VITE_*` values must be available during `npm run build`. The cleaned Docker workflow now handles that through compose build args.

### Do not run backend and frontend both on `3000` locally

The backend local example uses `3001` so the frontend Vite dev server can stay on `3000`.

## Verification

Check the merged Docker config:

```bash
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml config
```

Check the backend health endpoint:

```bash
curl http://localhost:3001/health
```
