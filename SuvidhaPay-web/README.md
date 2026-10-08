# SuvidhaPay Web
React + Vite frontend for SuvidhaPay.
React + Vite frontend for SuvidhaPay.
Use the frontend's own env exampledocker compose --env-file .env.local -cd /Users/u```
## Local runtime setup
Key variables in `SuvidhaPay-api/.env.example`:
Use the frontend's own env example when running outside Docker:
npm run build
npm run preview
cd /Users/um747e/learning/six-pillers/SuvidhaPay/SuvidhaPay-web
cp .env.example .env
npm run format
npm run dev
```

Default local expectations:
- frontend runs on `http://localhost:3000`
- API requests target `http://localhost:3001/api`

## Docker

The frontend image is normally built through the root compose workflow:
```
```bash
cd /Users/um747e/learning/six-pillers/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

## Environment variables

Key variables in `SuvidhaPay-web/.env.example`:
- `VITE_API_BASE_URL=http://localhost:3001/api`
- `VITE_APP_NAME=SuvidhaPay`
- `VITE_APP_VERSION=1.0.0`
- `VITE_ENV=development`
- `VITE_DEBUG=true`
- `VITE_LOG_LEVEL=debug`

## Useful commands

```bash
- In Docker, `VITE_*` values are baked into the image at build time.
