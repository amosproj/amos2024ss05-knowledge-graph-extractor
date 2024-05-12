from typing import List

from fastapi import APIRouter, Depends

from monitoring.dao.healthcheck_dao import HealthCheckDAO
from monitoring.schemas.healthcheck import HealthCheckResponse

router = APIRouter()


@router.get("/health")
async def health_check() -> {}:
    """
    Checks the health of a project.

    It returns 200 if the project is healthy.
    """
    return {"message": "Hello World, I am healthy! :D"}


@router.post("/create")
async def create_check(check_dao: HealthCheckDAO = Depends()) -> {}:
    """
    Checks the health of a project.

    It returns 200 if the project is healthy.
    """
    await check_dao.create_healthcheck_model()
    return {"message": "Created successfully!"}


@router.get("/list-checks", response_model=List[HealthCheckResponse])
async def get_dummy_models(
        limit: int = 10,
        offset: int = 0,
        check_dao: HealthCheckDAO = Depends(),
) -> List[HealthCheckResponse]:
    """
    Retrieve all health-check objects from the database.

    Args:
        limit: limit of check objects, defaults to 10
        offset: offset of check objects, defaults to 0
        check_dao: DAO for health-check models

    Returns:
        list of check objects from database
    """

    return await check_dao.get_all_healthchecks(limit=limit, offset=offset)
