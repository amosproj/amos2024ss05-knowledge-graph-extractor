import uuid

from pydantic import BaseModel, ConfigDict


class GraphJobBase(BaseModel):
    name: str
    location: str
    status: str


class GraphJobCreate(GraphJobBase):
    pass


class GraphJobResponse(GraphJobBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
