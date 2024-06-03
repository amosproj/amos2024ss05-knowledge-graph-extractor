#Root Makefile 

.PHONY: all start stop help backend

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

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  build-dev          - Start both frontend and backend"
	@echo "  stop-dev           - Stop both frontend and backend"
	@echo "  backend-<cmd>  - Run a backend command (e.g., make backend-build-dev)"
	@echo "    Available backend commands:"
	@echo "      backend-build-dev    - Build the backend development environment"
	@echo "      backend-stop-dev     - Stop the backend development environment"
	@echo "      backend-lint         - Run linter on the backend"
	@echo "      backend-format       - Run formatter on the backend"
	@echo "      backend-test         - Run tests on the backend"
	@echo "      backend-migrations   - Create migration files for the backend"
	@echo "      backend-migrate      - Run migrations for the backend"
	@echo "  help           - Show this help message"
