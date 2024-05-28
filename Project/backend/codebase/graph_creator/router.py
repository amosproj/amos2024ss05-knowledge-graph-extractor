import logging
import os
import uuid

from fastapi import APIRouter, Depends
from fastapi import UploadFile, File, HTTPException

from graph_creator.dao.graph_job_dao import GraphJobDAO
from graph_creator.schemas.graph_job import GraphJobCreate

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Endpoint for uploading PDF documents
@router.post("/upload/")
async def upload_pdf(
    file: UploadFile = File(...), graph_job_dao: GraphJobDAO = Depends()
):
    """
    Uploads a PDF document.

    Args:
        file (UploadFile): PDF document to be uploaded.
        graph_job_dao (GraphJobDAO):

    Returns:
        dict: A dictionary containing the filename and status.
            id (uuid.UUID): Id of the uploaded file
            filename (str): Name of the uploaded file.
            location (str): Location of the uploaded file.
            status (str): Status message of the file.

    Raises:
        HTTPException: If the uploaded file type is not valid (not PDF).
    """

    # Check if the uploaded file type is correct
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF.")

    # Define the directory for saving files
    documents_directory = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".media/documents"
    )
    if not os.path.exists(documents_directory):
        os.makedirs(documents_directory)
    logger.info(documents_directory)

    # Define file path
    file_path = os.path.join(documents_directory, file.filename)

    # Check if file with the same name exists
    if os.path.isfile(file_path):
        raise HTTPException(
            status_code=400,
            detail=f"File with name '{file.filename}' has already been uploaded.",
        )

    # Save file
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    logger.info(file_path)

    graph_job = GraphJobCreate(
        name=file.filename, location=file_path, status="Document uploaded"
    )
    # Check if graph job exists
    existing_graph_job = await graph_job_dao.get_graph_job_by_name(graph_job.name)

    # If graph job exists raise error
    if existing_graph_job:
        raise HTTPException(
            status_code=400,
            detail=f"Graph job with name '{graph_job.name}' has already been added.",
        )

    # Create a record in the database
    graph_job = await graph_job_dao.create_graph_job_model(graph_job=graph_job)

    return {
        "id": graph_job.id,
        "file_name": graph_job.name,
        "file_location": graph_job.location,
        "status": graph_job.status,
    }


@router.get("/graph_jobs")
async def read_graph_jobs(
    offset: int = 0, limit: int = 100, graph_job_dao: GraphJobDAO = Depends()
):
    """
    Reads all graph jobs from database

    Args:
        offset (int): Number of rows to skip.
        limit (int): Number of rows to read.
        graph_job_dao (GraphJobDAO):

    Returns:
        list(GraphJob): List of all graph jobs in database
    """

    return await graph_job_dao.get_graph_jobs(limit=limit, offset=offset)


@router.get("/graph_jobs/id/{graph_job_id}")
async def read_graph_job_by_id(
    graph_job_id: uuid.UUID, graph_job_dao: GraphJobDAO = Depends()
):
    """
    Reads a graph job by id

    Args:
        graph_job_id (uuid.UUID): ID of the graph job to be read.
        graph_job_dao (GraphJobDAO):

    Returns:
        GraphJob:

    Raises:
        HTTPException: If there is no graph job with the given ID.
    """
    graph_job = await GraphJobDAO.get_graph_job_by_id(
        graph_job_dao, graph_job_id=graph_job_id
    )
    if graph_job is None:
        raise HTTPException(status_code=404, detail="Graph job not found")
    return graph_job


@router.get("/graph_jobs/name/{graph_job_name}")
async def read_graph_job_by_name(
    graph_job_name: str, graph_job_dao: GraphJobDAO = Depends()
):
    """
    Read a graph job by name.

    Args:
        graph_job_name (str): Name
        graph_job_dao (GraphJobDAO):

    Returns:
        GraphJob

    Raises:
        HTTPException: If there is no graph job with the given name.
    """

    graph_job = await GraphJobDAO.get_graph_job_by_name(
        graph_job_dao, name=graph_job_name
    )

    if graph_job is None:
        raise HTTPException(status_code=404, detail="Graph job not found")
    return graph_job


@router.delete("/graph_jobs/name/{graph_job_name}")
async def delete_graph_job(graph_job_name: str, graph_job_dao: GraphJobDAO = Depends()):
    """
    Delete a graph job with the given name

    Args:
        graph_job_name (str): Name
        graph_job_dao (GraphJobDAO):

    Raises:
        HTTPException: If there is no graph job with the given name.
    """
    graph_job = await graph_job_dao.get_graph_job_by_name(graph_job_name)
    if graph_job is None:
        raise HTTPException(status_code=404, detail="Graph job not found")
    await graph_job_dao.delete_graph_job(graph_job)
