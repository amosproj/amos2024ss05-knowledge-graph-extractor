from fastapi.routing import APIRouter
from fastapi import UploadFile, File, HTTPException
from pathlib import Path

import monitoring

api_router = APIRouter()
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])


# Endpoint for uploading PDF documents
@api_router.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    # Check if the uploaded file type is correct
    if not Path(file.filename).suffix.lower() == ".pdf":
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF.")

    return {"filename": file.filename, "status": "uploaded successfully"}
