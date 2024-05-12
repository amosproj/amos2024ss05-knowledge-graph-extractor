from fastapi import FastAPI

from router import api_router
from settings.defaults import PROJECT_NAME

app = FastAPI(
    title=PROJECT_NAME,
    docs_url="/",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Main router for the API.
app.include_router(router=api_router, prefix="/api")
