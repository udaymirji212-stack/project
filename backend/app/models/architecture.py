import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class ArchitectureDesign(Base):
    __tablename__ = "architecture_designs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)

    overview = Column(Text, nullable=True)
    pattern = Column(String(100), default="Layered Micro-modular Client-Server")

    # React Flow Diagram structure: nodes and edges
    nodes = Column(JSON, default=list) # [{id, type, position, data: {label, category, tech, description, status}}]
    edges = Column(JSON, default=list) # [{id, source, target, label, animated, style}]

    # Structured component breakdowns
    components = Column(JSON, default=list) # [{id, name, type, layer, tech, responsibilities, data_flow_in, data_flow_out}]
    data_flows = Column(JSON, default=list) # [{from_component, to_component, protocol, payload, description}]

    # 3D spatial layout cache
    spatial_3d_nodes = Column(JSON, default=list) # [{id, position: [x, y, z], color, label}]

    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="architecture")
