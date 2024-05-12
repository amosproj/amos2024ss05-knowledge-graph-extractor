import uuid

from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_mixin, mapped_column, Mapped, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


@declarative_mixin
class TrackedModel:
    __abstract__ = True

    """Base for all models."""
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
