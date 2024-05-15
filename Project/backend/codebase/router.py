from fastapi.routing import APIRouter

import monitoring

api_router = APIRouter()
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
