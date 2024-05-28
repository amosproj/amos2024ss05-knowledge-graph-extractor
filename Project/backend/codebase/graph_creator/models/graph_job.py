import uuid

from sqlalchemy import Column, String, Uuid

from common.models import TrackedModel, Base


class GraphJob(Base, TrackedModel):
    """Class for representing a table for
    graph jobs in the database"""

    # Define the table name
    __tablename__ = "graph_job"
    __table_args__ = {"extend_existing": True}

    # Define the columns
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, nullable=False)
