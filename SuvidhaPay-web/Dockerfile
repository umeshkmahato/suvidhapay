FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_APP_NAME=SuvidhaPay
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENV=production
ARG VITE_DEBUG=false
ARG VITE_LOG_LEVEL=info

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
	VITE_APP_NAME=$VITE_APP_NAME \
	VITE_APP_VERSION=$VITE_APP_VERSION \
	VITE_ENV=$VITE_ENV \
	VITE_DEBUG=$VITE_DEBUG \
	VITE_LOG_LEVEL=$VITE_LOG_LEVEL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
