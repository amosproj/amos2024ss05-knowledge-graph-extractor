import datetime
import uuid

from pydantic import BaseModel, ConfigDict


class HealthCheckResponse(BaseModel):
    id: uuid.UUID
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
