from fastapi.routing import APIRouter

import monitoring
import graph_creator

api_router = APIRouter()
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(graph_creator.router, prefix="/graph", tags=["graph"])
