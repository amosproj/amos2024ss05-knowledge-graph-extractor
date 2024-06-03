import logging
import os
import uuid

import tempfile
from typing import Optional


from fastapi import APIRouter, Depends, Response
from fastapi import UploadFile, File, HTTPException, BackgroundTasks

from graph_creator.dao.graph_job_dao import GraphJobDAO
from graph_creator.schemas.graph_job import GraphJobCreate
from graph_creator.pdf_handler import process_pdf_into_chunks
from graph_creator.gemini import process_chunks
import shutil
import mimetypes
from graph_creator.schemas.graph_vis import GraphVisData
from graph_creator.services.netx_graphdb import NetXGraphDB

import graph_creator.graph_creator_main as graph_creator_main
from graph_creator.utils.const import GraphStatus

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/process_pdf/")
async def process_pdf(file: UploadFile = File(...)):
    # todo- clean up, not being used
    """
    Process a PDF file into chunks and generate a response using LLM.

    Args:
        file (UploadFile): The uploaded PDF file.

    Returns:
        dict: A dictionary containing the response generated by LLM.
    """
    # Save uploaded PDF file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        filename = tmp.name

    try:
        # Check if the file is a PDF by MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type != "application/pdf":
            raise ValueError("Uploaded file is not a PDF based on MIME type.")

        # Process PDF into chunks
        chunks = process_pdf_into_chunks(filename)
        text_chunks = [
            {"text": chunk.page_content} for chunk in chunks
        ]  # Assuming chunk has 'page_content' attribute

        # Define the prompt template
        prompt_template = "Give all valid relation in the given: {text_content}"

        # Generate response using LLM
        response_json = process_chunks(text_chunks, prompt_template)

        return {"response": response_json}
    finally:
        os.remove(filename)


# Endpoint for uploading PDF documents
@router.post("/upload/")
async def upload_pdf(
    file: UploadFile = File(...),
    graph_job_dao: GraphJobDAO = Depends()
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
        name=file.filename, location=file_path, status=GraphStatus.DOC_UPLOADED
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


@router.post("/create_graph/{graph_job_id}")
async def create_graph(
    graph_job_id: uuid.UUID,
    graph_job_dao: GraphJobDAO = Depends(),
):
    g_job = await graph_job_dao.get_graph_job_by_id(graph_job_id)

    if not g_job:
        raise HTTPException(status_code=404, detail="Graph job not found")
    if g_job.status != GraphStatus.DOC_UPLOADED:
        raise HTTPException(
            status_code=400, detail="Graph job status is not `Document uploaded`"
        )

    # trigger graph creation
    # background_tasks.add_task(graph_creator_main.process_file_to_graph, graph_job)
    graph_creator_main.process_file_to_graph(g_job)

    g_job.status = GraphStatus.GRAPH_READY
    graph_job_dao.session.add(g_job)
    await graph_job_dao.session.commit()
    return Response(
        content={"id": g_job.id, "status": GraphStatus.GRAPH_READY},
        status_code=201
    )


@router.get("/visualize/{graph_job_id}")
async def get_graph_data_for_visualization(
    graph_job_id: uuid.UUID,
    node: Optional[str] = None,
    adj_depth: int = 1,
    graph_job_dao: GraphJobDAO = Depends(),
    netx_services: NetXGraphDB = Depends(),
) -> GraphVisData:
    g_job = await graph_job_dao.get_graph_job_by_id(graph_job_id)

    if not g_job:
        raise HTTPException(status_code=404, detail="Graph job not found")
    if g_job.status != GraphStatus.GRAPH_READY:
        raise HTTPException(
            status_code=400, detail="A graph needs to be created for this job first!"
        )
    return netx_services.graph_data_for_visualization(
        g_job.id, node=node, adj_depth=adj_depth
    )

