import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class DocumentationItem(Base):
    __tablename__ = "documentation_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    doc_type = Column(String(50), nullable=False) # readme, installation, api_docs, architecture, database, user_guide, deployment
    title = Column(String(255), nullable=False)
    order = Column(Integer, default=0)
    markdown_content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="documentation_items")
