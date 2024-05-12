include .env
export $(shell sed 's/=.*//' .env)


SHELL := /bin/sh
PROJECTNAME ?= amos-knowledge-graph
APP_NAME := $(PROJECTNAME)
BACKEND_APP_NAME := $(APP_NAME)-backend
DOCKER_COMPOSE != docker compose 1> /dev/null 2> /dev/null && echo docker compose || echo docker-compose


define HELP

Manage $(PROJECTNAME). Usage:

make lint           	Run linter
make format         	Run formatter
make test           	Run tests
make build-dev      	Build and run dev environment
make stop-dev       	Stop dev environment
make all            	Show help

endef

export HELP

help:
	@echo "$$HELP"

lint:
	@bash ./scripts/lint.sh

format:
	@bash ./scripts/format.sh

test:
	@bash ./scripts/test.sh


build-dev:
	DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 $(DOCKER_COMPOSE) -f docker-compose.yml up --build -d


stop-dev:
	@$(DOCKER_COMPOSE) -f docker-compose.yml down


all: help

.PHONY: help lint format test make-migrations migrate build-dev stop-dev all
