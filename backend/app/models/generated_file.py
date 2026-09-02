import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class GeneratedFile(Base):
    __tablename__ = "generated_files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Relative path e.g. "backend/app/main.py", "frontend/src/App.tsx"
    path = Column(String(500), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    extension = Column(String(50), nullable=False)
    language = Column(String(50), default="plaintext")
    file_type = Column(String(50), default="source") # frontend, backend, database, config, test, docker, docs

    content = Column(Text, nullable=False)
    size_bytes = Column(Integer, default=0)

    is_user_edited = Column(Boolean, default=False)
    version = Column(Integer, default=1)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="generated_files")
