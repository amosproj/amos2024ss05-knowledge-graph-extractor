import os
import tempfile
from fastapi import FastAPI, File, UploadFile
from graph_creator.pdf_handler import process_pdf_into_chunks
from graph_creator.llama3 import process_chunks
import shutil
import mimetypes

app = FastAPI(
    title="amos",
    docs_url="/",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

@app.post("/api/process_pdf/")
async def process_pdf(file: UploadFile = File(...)):
    # Save uploaded PDF file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        filename = tmp.name

    try:
        # Check if the file is a PDF by MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type != 'application/pdf':
            raise ValueError("Uploaded file is not a PDF based on MIME type.")

        # Process PDF into chunks
        chunks = process_pdf_into_chunks(filename)
        text_chunks = [{"text": chunk.page_content} for chunk in chunks]  # Assuming chunk has 'page_content' attribute

        # Define the prompt template
        prompt_template = "Give all valid relation in the given: {text_content}"

        # Generate response using LLM
        response_json = process_chunks(text_chunks, prompt_template)
        return {"response": response_json}
    finally:
        os.remove(filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)