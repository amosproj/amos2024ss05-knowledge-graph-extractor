from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> {}:
    """
    Checks the health of a project.

    It returns 200 if the project is healthy.
    """
    return {"message": "Hello World, I am healthy! :D"}
