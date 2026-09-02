import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class RequirementAnalysis(Base):
    __tablename__ = "requirement_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)

    functional_requirements = Column(JSON, default=list) # List of {id, title, description, priority, category}
    non_functional_requirements = Column(JSON, default=list) # List of {id, title, description, category}
    user_roles = Column(JSON, default=list) # List of {id, role_name, description, permissions}
    user_stories = Column(JSON, default=list) # List of {id, as_a, i_want, so_that, acceptance_criteria: []}
    risks_assumptions = Column(JSON, default=dict) # {risks: [], assumptions: [], missing_info: []}

    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    version = Column(String(20), default="1.0.0")

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="requirements")
