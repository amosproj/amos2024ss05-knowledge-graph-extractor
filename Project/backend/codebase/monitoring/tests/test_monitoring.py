import os
import pytest
from reportlab.pdfgen import canvas
from starlette import status

MONITORING_API = "monitoring"


def test_health_check(client):
    url = client.app.url_path_for("health_check")
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.api
def test_upload_pdf(client):

    # Create a PDF file for testing
    pdf_file = "test_document.pdf"
    file_path = os.path.join("monitoring/tests/", pdf_file)

    file = canvas.Canvas(file_path)
    file.drawString(100, 750, "This is a test PDF!")
    file.save()

    # Upload PDF file
    with open(file_path, "rb") as f:
        response = client.post(
            client.app.url_path_for("upload_pdf"),
            files={"file": (pdf_file, f, "application/pdf")},
        )

    # Check the response
    assert response.status_code == 200
    assert response.json() == {"filename": pdf_file, "status": "uploaded successfully"}

    # Check if the file was saved in the correct directory
    saved_file_path = os.path.join("monitoring/documents", pdf_file)
    assert os.path.exists(saved_file_path)

    # Remove the test files
    os.remove(file_path)
    os.remove(saved_file_path)