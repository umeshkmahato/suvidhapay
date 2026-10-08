# SuvidhaPay API
Node.js + Express backend for SuvidhaPay.
## Local runtime setup
Use the backend's own env example when running outside Docker:
```bash
cd ~/SuvidhaPay/SuvidhaPay-api
cp .env.example .env
npm install
npm run migrate
npm run dev
```
Default local expectations:
- API runs on `http://localhost:3001`
- frontend origin is `http://localhost:3000`
- local database host is `localhost`
## Docker
The API container is built from `Dockerfile` and is normally started through the root compose files:
```bash
cd ~/SuvidhaPay
docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```
## Environment variables
Key variables in `SuvidhaPay-api/.env.example`:
- `PORT=3001`
- `NODE_ENV=development`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=suvidhapay`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `JWT_SECRET=your-super-secret-jwt-key-change-in-production`
- `FRONTEND_URL=http://localhost:3000`
## Useful commands
```bash
npm run dev
npm run migrate
npm run seed
npm run test
npm run lint
```
## Notes
- The Docker image uses `npm ci --omit=dev` for reproducible installs.
- The container health check targets `GET /health`.
- For repo-wide Docker usage, prefer the root docs: `README.md`, `DOCKER_COMPOSE_GUIDE.md`, and `ENV_SETUP_GUIDE.md`.
