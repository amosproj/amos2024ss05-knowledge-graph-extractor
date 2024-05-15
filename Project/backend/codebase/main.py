from fastapi import FastAPI

from lifetime import register_startup_event, register_shutdown_event
from router import api_router
from settings.defaults import PROJECT_NAME

app = FastAPI(
    title=PROJECT_NAME,
    docs_url="/",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)
register_startup_event(app)
register_shutdown_event(app)

# Main router for the API.
app.include_router(router=api_router, prefix="/api")
