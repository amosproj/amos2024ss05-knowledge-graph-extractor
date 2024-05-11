from fastapi import FastAPI, UploadFile, File, HTTPException
from src.utils import is_pdf

app = FastAPI()


# Endpoint for uploading PDF documents
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):

    # Check if the uploaded file type is correct
    if not is_pdf(file.filename):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF.")

    return {"filename": file.filename, "status": "uploaded successfully"}
