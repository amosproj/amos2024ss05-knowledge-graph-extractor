from fastapi.routing import APIRouter
from fastapi import UploadFile, File, HTTPException

import os
import monitoring

api_router = APIRouter()
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])


# Endpoint for uploading PDF documents
@api_router.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    # Check if the uploaded file type is correct
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF.")

    # Save file locally
    script_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_directory, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"filename": file.filename, "status": "uploaded successfully"}
