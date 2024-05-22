from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from common.dependencies import get_db_session
from monitoring.models.pdf_record_model import PDFRecord
from monitoring.schemas.pdf_record_schema import PDFRecordCreate


class PDFRecordDAO:
    """Class for accessing PDFRecord table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def get_record_by_id(self, record_id: int) -> PDFRecord:
        """
        Get a PDF record by the id of PDF.
        """
        return self.session.query(PDFRecord).filter(PDFRecord.id == record_id)

    async def get_record_by_name(self, pdf_name: str) -> PDFRecord:
        """
        Get a PDF record by the name of PDF.
        """
        return self.session.query(PDFRecord).filter(PDFRecord.pdf_name == pdf_name)

    async def get_records(self, skip: int = 0, limit: int = 100) -> List[PDFRecord]:
        """
        Get all PDF records with limit/offset pagination.
        """
        return self.session.query(PDFRecord).offset(skip).limit(limit).all()

    async def create_record_model(self, record: PDFRecordCreate):
        """
        Add a new PDF Record to the session.
        """

        # Check if record for the PDF exists
        existing_record = self.get_record_by_name(record.pdf_name)

        if existing_record:
            raise ValueError(
                f"PDF with name '{record.pdf_name}' has already been uploaded."
            )

        new_pdf_record = PDFRecord(pdf_name=record.pdf_name, location=record.location)

        self.session.add(new_pdf_record)
        await self.session.commit()
        await self.session.refresh(new_pdf_record)
        return new_pdf_record

    async def delete_pdf_record(self, pdf_name: str) -> PDFRecord:
        """
        Delete the PDF record by the name of PDF.
        """

        pdf_record = self.get_record_by_name(pdf_name)
        if pdf_record:
            await self.session.delete(pdf_record)
            await self.session.commit()
