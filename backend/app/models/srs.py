import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class SRSDocument(Base):
    __tablename__ = "srs_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), default="Software Requirements Specification")
    version = Column(String(20), default="1.0.0")
    version_number = Column(Integer, default=1)

    # 11 Structured IEEE sections
    introduction = Column(Text, nullable=True)
    purpose = Column(Text, nullable=True)
    scope = Column(Text, nullable=True)
    user_classes = Column(Text, nullable=True)
    functional_requirements_text = Column(Text, nullable=True)
    non_functional_requirements_text = Column(Text, nullable=True)
    external_interfaces = Column(Text, nullable=True)
    data_requirements = Column(Text, nullable=True)
    security_requirements = Column(Text, nullable=True)
    constraints = Column(Text, nullable=True)
    acceptance_criteria = Column(Text, nullable=True)

    # Full aggregated Markdown
    full_markdown = Column(Text, nullable=False)

    changelog = Column(Text, default="Initial generated version")

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="srs_documents")
