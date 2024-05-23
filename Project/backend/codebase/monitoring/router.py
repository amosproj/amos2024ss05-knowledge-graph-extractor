import os
from typing import List

from fastapi import APIRouter, Depends
from fastapi import UploadFile, File, HTTPException

from monitoring.dao.healthcheck_dao import HealthCheckDAO
from monitoring.schemas.healthcheck import HealthCheckResponse

from monitoring.dao.pdf_record_dao import PDFRecordDAO
from monitoring.schemas.pdf_record_schema import PDFRecordBase

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


# Endpoint for uploading PDF documents
@router.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Uploads a PDF document.

    Args:
        file (UploadFile): PDF document to be uploaded.

    Returns:
        dict: A dictionary containing the filename and status.
            filename (str): Name of the uploaded file.
            status (str): Status message upload is successful.

    Raises:
        HTTPException: If the uploaded file type is not valid (not PDF).
    """

    # Check if the uploaded file type is correct
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF.")

    # Define the directory for saving files
    documents_directory = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "documents"
    )

    if not os.path.exists(documents_directory):
        os.makedirs(documents_directory)

    # Save file
    file_path = os.path.join(documents_directory, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"filename": file.filename, "status": "uploaded successfully"}


@router.post("/create_record")
async def create_record(record: PDFRecordBase, record_dao: PDFRecordDAO = Depends()):
    return record_dao.create_record_model(record=record)


@router.get("/records")
def read_records(skip: int = 0, limit: int = 100, record_dao: PDFRecordDAO = Depends()):
    records = PDFRecordDAO.get_users(record_dao, skip=skip, limit=limit)
    return records


@router.get("/records/{record_id}")
def read_record_by_id(record_id: int, record_dao: PDFRecordDAO = Depends()):
    record = PDFRecordDAO.get_user(record_dao, record_id=record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="User not found")
    return record


@router.get("/records/{record_name}")
def read_record_by_name(record_name: str, record_dao: PDFRecordDAO = Depends()):
    record = PDFRecordDAO.get_user(record_dao, pdf_name=record_name)
    if record is None:
        raise HTTPException(status_code=404, detail="User not found")
    return record


@router.delete("/records/{record_name}")
def delete_record(record_name: str, record_dao: PDFRecordDAO = Depends()):
    record = PDFRecordDAO.get_user(record_dao, pdf_name=record_name)
    if record is None:
        raise HTTPException(status_code=404, detail="User not found")
    return PDFRecordDAO.delete_pdf_record(pdf_name=record_name)
