from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    business_idea: str = Field(..., min_length=10)
    target_users: Optional[str] = None
    main_problem: Optional[str] = None
    expected_features: Optional[str] = None
    preferred_tech_stack: str = "React + FastAPI + PostgreSQL"
    constraints: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    business_idea: Optional[str] = None
    target_users: Optional[str] = None
    main_problem: Optional[str] = None
    expected_features: Optional[str] = None
    preferred_tech_stack: Optional[str] = None
    constraints: Optional[str] = None
    current_stage: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    name: str
    description: Optional[str] = None
    business_idea: str
    target_users: Optional[str] = None
    main_problem: Optional[str] = None
    expected_features: Optional[str] = None
    preferred_tech_stack: str
    constraints: Optional[str] = None
    current_stage: str
    status: str
    file_count: int = 0
    test_count: int = 0
    issue_count: int = 0
    metadata_info: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime


class DashboardStatsResponse(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_generated_files: int
    total_reviews_run: int
    total_tests_passed: int
    current_user_name: str
