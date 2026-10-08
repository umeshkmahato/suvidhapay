# Environment Configuration Reference

This file is the short reference for environment variables after the Docker/env cleanup.

For setup steps, use `ENV_SETUP_GUIDE.md`.
For Docker commands, use `DOCKER_COMPOSE_GUIDE.md`.

## Root Docker Compose variables

These belong in the root env files such as `.env.local`, `.env.dev`, and `.env.prod`.

| Variable | Purpose | Example |
|---|---|---|
| `COMPOSE_PROJECT_NAME` | Isolates containers, networks, and volumes per environment | `suvidhapay-local` |
| `WEB_PORT` | Host port for the frontend container | `3000` |
| `API_PORT` | Host port for the API container | `3001` |
| `DB_PORT` | Host port for Postgres in local/dev overrides | `5432` |
| `ADMINER_PORT` | Host port for Adminer in local override | `8080` |
| `NODE_ENV` | Backend runtime mode | `development` / `production` |
| `FRONTEND_URL` | Allowed frontend origin for backend CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | `change-me` |
| `JWT_EXPIRY` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `30d` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Requests allowed per window | `100` |
| `LOG_LEVEL` | Backend log verbosity | `debug` / `info` |
| `DB_NAME` | Postgres database name | `suvidhapay` |
| `DB_USER` | Postgres username | `postgres` |
| `DB_PASSWORD` | Postgres password | `postgres` |
| `VITE_API_BASE_URL` | Frontend API URL baked into Docker build | `http://localhost:3001/api` |
| `VITE_APP_NAME` | Frontend application name | `SuvidhaPay` |
| `VITE_APP_VERSION` | Frontend version label | `1.0.0` |
| `VITE_ENV` | Frontend environment label | `local` / `development` / `production` |
| `VITE_DEBUG` | Frontend debug toggle | `true` / `false` |
| `VITE_LOG_LEVEL` | Frontend log verbosity | `debug` / `info` / `error` |

## App-local backend variables

These belong in `SuvidhaPay-api/.env` when running the backend directly.

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | Backend listen port for local npm workflow | `3001` |
| `NODE_ENV` | Backend runtime mode | `development` |
| `DB_HOST` | Database host for direct runtime | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `suvidhapay` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT signing secret | `change-me` |
| `JWT_EXPIRY` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `30d` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit count | `100` |
| `LOG_LEVEL` | Log level | `debug` |
| `LOG_DIR` | Log directory | `./logs` |

## App-local frontend variables

These belong in `SuvidhaPay-web/.env` when running the frontend directly.

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | API endpoint used by Vite app | `http://localhost:3001/api` |
| `VITE_APP_NAME` | UI label | `SuvidhaPay` |
| `VITE_APP_VERSION` | Version label | `1.0.0` |
| `VITE_ENV` | Frontend env label | `development` |
| `VITE_DEBUG` | Debug toggle | `true` |
| `VITE_LOG_LEVEL` | Log verbosity | `debug` |

## Notes

- Root Docker env files and app-local `.env` files are intentionally different.
- The backend local default was aligned to `3001` to avoid clashing with the frontend dev server on `3000`.
- The Dockerized frontend uses build-time Vite env injection rather than runtime container env injection.
