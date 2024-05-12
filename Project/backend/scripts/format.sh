#!/bin/bash -e

APP_PATH="codebase"

ruff $APP_PATH --fix
black $APP_PATH