import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class DatabaseDesign(Base):
    __tablename__ = "database_designs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)

    database_type = Column(String(50), default="PostgreSQL")
    # Entities: [{name, description, fields: [{name, type, is_primary, is_nullable, is_unique, default, description}], indexes: [], relations: [{target_entity, type, foreign_key, on_delete}]}]
    entities = Column(JSON, default=list)
    relationships = Column(JSON, default=list) # [{source, target, type, foreign_key, label}]
    indexes_and_constraints = Column(JSON, default=list)

    sql_schema_ddl = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="database_design")


class ApiSpecification(Base):
    __tablename__ = "api_specifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    tag = Column(String(100), default="General")
    method = Column(String(10), nullable=False) # GET, POST, PUT, DELETE, PATCH
    path = Column(String(255), nullable=False)
    summary = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    auth_required = Column(Boolean, default=True)
    required_role = Column(String(50), default="authenticated")

    request_headers = Column(JSON, default=list)
    query_params = Column(JSON, default=list)
    path_params = Column(JSON, default=list)
    request_body_schema = Column(JSON, default=dict)
    response_success_schema = Column(JSON, default=dict)
    response_error_schemas = Column(JSON, default=list)

    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="api_specifications")
