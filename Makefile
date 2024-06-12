#Root Makefile 

.PHONY: all start stop help backend frontend lint format lint-all format-all

all: help

build-dev:
	@$(MAKE) -C Project/backend build-dev
	@$(MAKE) -C Project/frontend start-dev

stop-dev:
	@$(MAKE) -C Project/backend stop-dev
	@$(MAKE) -C Project/frontend stop-dev

# Pass through to backend Makefile
backend-%:
	@$(MAKE) -C Project/backend $*

# Pass through to frontend Makefile
frontend-%:
	@$(MAKE) -C Project/frontend $*

lint:
	@$(MAKE) -C Project/backend lint
	@$(MAKE) -C Project/frontend lint

format:
	@$(MAKE) -C Project/backend format
	@$(MAKE) -C Project/frontend format

lint-all: lint
format-all: format

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  build-dev          - Start both frontend and backend"
	@echo "  stop-dev           - Stop both frontend and backend"
	@echo "  backend-<cmd>      - Run a backend command (e.g., make backend-build-dev)"
	@echo "  frontend-<cmd>     - Run a frontend command (e.g., make frontend-start-dev)"
	@echo "  lint               - Lint both frontend and backend"
	@echo "  format             - Format both frontend and backend"
	@echo "  help               - Show this help message"
