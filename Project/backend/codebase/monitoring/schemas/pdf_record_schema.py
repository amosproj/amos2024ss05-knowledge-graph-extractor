import uuid

from pydantic import BaseModel


class PDFRecordBase(BaseModel):
    pdf_name: str
    location: str


class PDFRecordCreate(PDFRecordBase):
    pdf_name: str
    location: str


class PDFRecordResponse(PDFRecordBase):
    id: uuid.UUID
    pdf_name: str
    location: str
