from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class FunctionalRequirementItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str = "High"
    category: str = "Core Feature"


class NonFunctionalRequirementItem(BaseModel):
    id: str
    title: str
    description: str
    category: str = "Performance"


class UserRoleItem(BaseModel):
    id: str
    role_name: str
    description: str
    permissions: List[str] = []


class UserStoryItem(BaseModel):
    id: str
    as_a: str
    i_want: str
    so_that: str
    acceptance_criteria: List[str] = []


class RisksAssumptions(BaseModel):
    risks: List[str] = []
    assumptions: List[str] = []
    missing_info: List[str] = []


class RequirementAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    functional_requirements: List[FunctionalRequirementItem] = []
    non_functional_requirements: List[NonFunctionalRequirementItem] = []
    user_roles: List[UserRoleItem] = []
    user_stories: List[UserStoryItem] = []
    risks_assumptions: RisksAssumptions = RisksAssumptions()
    is_approved: bool = False
    approved_at: Optional[datetime] = None
    version: str = "1.0.0"
    created_at: datetime
    updated_at: datetime


class RequirementUpdateRequest(BaseModel):
    functional_requirements: Optional[List[FunctionalRequirementItem]] = None
    non_functional_requirements: Optional[List[NonFunctionalRequirementItem]] = None
    user_roles: Optional[List[UserRoleItem]] = None
    user_stories: Optional[List[UserStoryItem]] = None
    risks_assumptions: Optional[RisksAssumptions] = None
    is_approved: Optional[bool] = None
