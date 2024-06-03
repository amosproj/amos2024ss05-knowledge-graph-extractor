from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str
    label: str
    size: int = Field(default=1)
    color: str = Field(default="#7FFFD4", description="Color aquamarine")


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    size: int = Field(default=1)
    color: str = Field(default="#f1807e", description="Color red")
    type: str = Field(default="line")


class GraphVisData(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
