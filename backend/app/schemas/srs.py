from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SRSGenerateRequest(BaseModel):
    custom_instructions: Optional[str] = None


class SRSUpdateRequest(BaseModel):
    title: Optional[str] = None
    introduction: Optional[str] = None
    purpose: Optional[str] = None
    scope: Optional[str] = None
    user_classes: Optional[str] = None
    functional_requirements_text: Optional[str] = None
    non_functional_requirements_text: Optional[str] = None
    external_interfaces: Optional[str] = None
    data_requirements: Optional[str] = None
    security_requirements: Optional[str] = None
    constraints: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    full_markdown: Optional[str] = None
    changelog: Optional[str] = None


class SRSResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    version: str
    version_number: int
    introduction: Optional[str] = None
    purpose: Optional[str] = None
    scope: Optional[str] = None
    user_classes: Optional[str] = None
    functional_requirements_text: Optional[str] = None
    non_functional_requirements_text: Optional[str] = None
    external_interfaces: Optional[str] = None
    data_requirements: Optional[str] = None
    security_requirements: Optional[str] = None
    constraints: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    full_markdown: str
    changelog: Optional[str] = None
    created_at: datetime
    updated_at: datetime
