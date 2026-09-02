from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class DocumentationItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    doc_type: str
    title: str
    order: int
    markdown_content: str
    created_at: datetime
    updated_at: datetime


class DocumentationUpdateRequest(BaseModel):
    markdown_content: str
