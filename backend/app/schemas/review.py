from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ReviewIssueItem(BaseModel):
    id: str
    category: str
    severity: str
    file_path: str
    line_number: Optional[int] = 1
    title: str
    description: str
    recommendation: str
    suggested_code_replacement: Optional[str] = None
    is_applied: bool = False


class CodeReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    summary: str
    score: int
    issues: List[ReviewIssueItem] = []
    total_issues: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    created_at: datetime


class ApplyFixRequest(BaseModel):
    issue_id: str


class TestCaseItem(BaseModel):
    name: str
    suite: str
    status: str
    duration_ms: int
    error_message: Optional[str] = None
    stdout: Optional[str] = None


class TestRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    test_type: str
    passed_count: int
    failed_count: int
    total_count: int
    execution_time_ms: int
    test_cases: List[TestCaseItem] = []
    raw_output: Optional[str] = None
    created_at: datetime
