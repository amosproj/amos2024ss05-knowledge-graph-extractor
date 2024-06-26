from datetime import datetime

from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str
    label: str
    size: int = Field(default=1)
    color: str = Field(default="#7FFFD4", description="Color aquamarine")
    topic: str
    pages: str


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    size: int = Field(default=1)
    color: str = Field(default="#f1807e", description="Color red")
    type: str = Field(default="line")


class GraphVisData(BaseModel):
    document_name: str
    graph_created_at: datetime
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class QueryInputData(BaseModel):
    text: str


class GraphQueryOutput(BaseModel):
    llm_nodes: list[str]
    spacy_nodes: list[str]
    retrieved_info: dict[str, list[tuple[str, str]]]
