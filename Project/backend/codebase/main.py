from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# CORS-configuration
origins = [
    "http://localhost:8080",
    "http://localhost:8000",
    "*",  # Allow all origins for now
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main router for the API.
app.include_router(router=api_router, prefix="/api")
