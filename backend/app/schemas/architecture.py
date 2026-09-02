from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ArchitectureNode(BaseModel):
    id: str
    type: str = "customNode"
    position: Dict[str, float]
    data: Dict[str, Any]


class ArchitectureEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = True
    style: Optional[Dict[str, Any]] = None


class ArchitectureComponent(BaseModel):
    id: str
    name: str
    type: str
    layer: str
    tech: str
    responsibilities: List[str] = []
    data_flow_in: List[str] = []
    data_flow_out: List[str] = []


class DataFlowItem(BaseModel):
    from_component: str
    to_component: str
    protocol: str
    payload: str
    description: str


class Spatial3DNode(BaseModel):
    id: str
    label: str
    category: str
    position: List[float]
    color: str


class ArchitectureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    overview: Optional[str] = None
    pattern: str = "Layered Micro-modular Client-Server"
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    components: List[ArchitectureComponent] = []
    data_flows: List[DataFlowItem] = []
    spatial_3d_nodes: List[Spatial3DNode] = []
    is_approved: bool = False
    created_at: datetime
    updated_at: datetime


class ArchitectureUpdateRequest(BaseModel):
    overview: Optional[str] = None
    pattern: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None
    components: Optional[List[ArchitectureComponent]] = None
    data_flows: Optional[List[DataFlowItem]] = None
    spatial_3d_nodes: Optional[List[Spatial3DNode]] = None
    is_approved: Optional[bool] = None
