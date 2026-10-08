SHELL := /bin/zsh
.DEFAULT_GOAL := help

COMPOSE := docker compose
BASE_FILES := -f docker-compose.yml
LOCAL_FILES := $(BASE_FILES) -f docker-compose.local.yml
DEV_FILES := $(BASE_FILES) -f docker-compose.dev.yml
PROD_FILES := $(BASE_FILES) -f docker-compose.prod.yml
LOCAL_ENV := --env-file .env.local
DEV_ENV := --env-file .env.dev
PROD_ENV := --env-file .env.prod
API_DIR := $(CURDIR)/SuvidhaPay-api
WEB_DIR := $(CURDIR)/SuvidhaPay-web

.PHONY: help local-up local-down local-logs local-ps local-config local-rebuild \
	dev-up dev-down dev-logs dev-ps dev-config dev-rebuild \
	prod-up prod-down prod-logs prod-ps prod-config prod-rebuild \
	api-lint api-test web-build web-lint verify shell-api shell-db shell-web local-health

help:
	@printf "\nSuvidhaPay Docker shortcuts\n\n"
	@printf "  make local-up       Start local stack\n"
	@printf "  make local-down     Stop local stack\n"
	@printf "  make local-logs     Follow local logs\n"
	@printf "  make local-ps       Show local containers\n"
	@printf "  make local-config   Show merged local compose config\n"
	@printf "  make local-rebuild  Rebuild local stack from scratch\n\n"
	@printf "  make dev-up         Start dev/staging stack\n"
	@printf "  make dev-down       Stop dev/staging stack\n"
	@printf "  make dev-logs       Follow dev/staging logs\n"
	@printf "  make dev-ps         Show dev/staging containers\n"
	@printf "  make dev-config     Show merged dev/staging compose config\n"
	@printf "  make dev-rebuild    Rebuild dev/staging stack from scratch\n\n"
	@printf "  make prod-up        Start production-style stack\n"
	@printf "  make prod-down      Stop production-style stack\n"
	@printf "  make prod-logs      Follow production-style logs\n"
	@printf "  make prod-ps        Show production-style containers\n"
	@printf "  make prod-config    Show merged production-style compose config\n"
	@printf "  make prod-rebuild   Rebuild production-style stack from scratch\n\n"
	@printf "  make api-lint       Run backend lint\n"
	@printf "  make api-test       Run backend tests\n"
	@printf "  make web-build      Build frontend production bundle\n"
	@printf "  make web-lint       Run frontend lint\n"
	@printf "  make verify         Run top-level verification checks\n"
	@printf "  make shell-api      Open a shell in the local API container\n"
	@printf "  make shell-db       Open psql in the local Postgres container\n"
	@printf "  make shell-web      Open a shell in the local web container\n"
	@printf "  make local-health   Call the local API health endpoint\n\n"

local-up:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) up -d --build

local-down:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) down

local-logs:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) logs -f

local-ps:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) ps

local-config:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) config

local-rebuild:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) down -v
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) up -d --build

dev-up:
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) up -d --build

dev-down:
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) down

dev-logs:
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) logs -f

dev-ps:
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) ps

dev-config:
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) config

dev-rebuild:
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) down -v
	$(COMPOSE) $(DEV_ENV) $(DEV_FILES) up -d --build

prod-up:
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) up -d --build

prod-down:
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) down

prod-logs:
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) logs -f

prod-ps:
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) ps

prod-config:
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) config

prod-rebuild:
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) down -v
	$(COMPOSE) $(PROD_ENV) $(PROD_FILES) up -d --build

api-lint:
	cd $(API_DIR) && npm run lint

api-test:
	cd $(API_DIR) && npm test

web-build:
	cd $(WEB_DIR) && npm run build

web-lint:
	cd $(WEB_DIR) && npm run lint

verify: local-config dev-config prod-config api-lint web-build

shell-api:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) exec api /bin/sh

shell-db:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) exec postgres psql -U postgres -d suvidhapay

shell-web:
	$(COMPOSE) $(LOCAL_ENV) $(LOCAL_FILES) exec web /bin/sh

local-health:
	curl -fsS http://localhost:3001/health | cat

