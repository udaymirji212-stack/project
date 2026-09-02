from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class GeneratedFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    path: str
    filename: str
    extension: str
    language: str
    file_type: str
    content: str
    size_bytes: int
    is_user_edited: bool
    version: int
    created_at: datetime
    updated_at: datetime


class FileTreeNode(BaseModel):
    id: str
    name: str
    path: str
    type: str
    extension: Optional[str] = None
    language: Optional[str] = None
    children: Optional[List["FileTreeNode"]] = None


class FileSaveRequest(BaseModel):
    content: str


class FileCreateRequest(BaseModel):
    path: str
    content: str
    file_type: str = "source"


class CodeGenTriggerRequest(BaseModel):
    custom_instructions: Optional[str] = None
    target_components: Optional[List[str]] = None
    force_regenerate: bool = False
