FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN apk add --no-cache --virtual .build-deps \
  python3 \
  make \
  g++ \
  && npm ci --omit=dev \
  && npm cache clean --force \
  && mkdir -p /app/logs \
  && apk del .build-deps

COPY --chown=node:node src ./src
COPY --chown=node:node database ./database

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["sh", "-c", "npm run start:docker"]
