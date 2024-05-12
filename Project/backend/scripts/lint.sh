#!/bin/bash -e

APP_PATH="codebase"

ruff $APP_PATH
black $APP_PATH --check
