import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    business_idea = Column(Text, nullable=False)
    target_users = Column(Text, nullable=True)
    main_problem = Column(Text, nullable=True)
    expected_features = Column(Text, nullable=True)
    preferred_tech_stack = Column(String(255), default="React + FastAPI + PostgreSQL")
    constraints = Column(Text, nullable=True)

    # Status & Workflow Stage
    # stages: 'requirements', 'srs', 'architecture', 'database_api', 'code_generation', 'workspace', 'review_testing', 'documentation', 'completed'
    current_stage = Column(String(50), default="requirements")
    status = Column(String(50), default="in_progress") # in_progress, completed, archived

    # Metrics cache
    file_count = Column(Integer, default=0)
    test_count = Column(Integer, default=0)
    issue_count = Column(Integer, default=0)

    metadata_info = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    owner = relationship("User", back_populates="projects")
    requirements = relationship("RequirementAnalysis", back_populates="project", cascade="all, delete-orphan", uselist=False)
    srs_documents = relationship("SRSDocument", back_populates="project", cascade="all, delete-orphan")
    architecture = relationship("ArchitectureDesign", back_populates="project", cascade="all, delete-orphan", uselist=False)
    database_design = relationship("DatabaseDesign", back_populates="project", cascade="all, delete-orphan", uselist=False)
    api_specifications = relationship("ApiSpecification", back_populates="project", cascade="all, delete-orphan")
    generated_files = relationship("GeneratedFile", back_populates="project", cascade="all, delete-orphan")
    code_reviews = relationship("CodeReview", back_populates="project", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="project", cascade="all, delete-orphan")
    documentation_items = relationship("DocumentationItem", back_populates="project", cascade="all, delete-orphan")
