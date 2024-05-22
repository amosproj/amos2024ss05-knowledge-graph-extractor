import uuid

from common.models import TrackedModel, Base
from sqlalchemy import Column, String, Uuid


class PDFRecord(Base, TrackedModel):
    """Class for representing a table for
    PDF Record in the database"""

    # Define the table name
    __tablename__ = "pdf_records"
    __table_args__ = {"extend_existing": True}

    # Define the columns
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    pdf_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
