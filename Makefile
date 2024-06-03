#Root Makefile 

.PHONY: all start stop help backend

all: help

build-dev:
	@$(MAKE) -C Project/backend build-dev
	@$(MAKE) -C Project/frontend start

stop-dev:
	@$(MAKE) -C Project/backend stop-dev
	@$(MAKE) -C Project/frontend stop

# Pass through to backend Makefile
backend-%:
	@$(MAKE) -C Project/backend $*

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  build-dev          - Start both frontend and backend"
	@echo "  stop-dev           - Stop both frontend and backend"
	@echo "  backend-<cmd>  - Run a backend command (e.g., make backend-build-dev)"
	@echo "  help           - Show this help message"
