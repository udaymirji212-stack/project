import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class CodeReview(Base):
    __tablename__ = "code_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    summary = Column(Text, nullable=False)
    score = Column(Integer, default=95) # Score out of 100

    # Issues: [{id, category, severity, file_path, line_number, title, description, recommendation, suggested_code_replacement, is_applied}]
    issues = Column(JSON, default=list)

    total_issues = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    project = relationship("Project", back_populates="code_reviews")


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    test_type = Column(String(50), default="unit") # unit, integration, security
    passed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    execution_time_ms = Column(Integer, default=0)

    # Test cases: [{name, suite, status: 'PASSED'|'FAILED', duration_ms, error_message, stdout}]
    test_cases = Column(JSON, default=list)
    raw_output = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    project = relationship("Project", back_populates="test_runs")
