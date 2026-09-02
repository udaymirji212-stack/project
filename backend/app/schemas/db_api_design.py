from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict


class EntityField(BaseModel):
    name: str
    type: str # VARCHAR, UUID, INTEGER, BOOLEAN, TIMESTAMP, JSON, TEXT, DECIMAL
    is_primary: bool = False
    is_nullable: bool = False
    is_unique: bool = False
    default: Optional[str] = None
    description: Optional[str] = None


class EntityRelation(BaseModel):
    target_entity: str
    type: str # one-to-many, many-to-one, one-to-one, many-to-many
    foreign_key: Optional[str] = None
    on_delete: str = "CASCADE"


class EntityItem(BaseModel):
    name: str
    description: str
    fields: List[EntityField] = []
    indexes: List[str] = []
    relations: List[EntityRelation] = []


class DatabaseDesignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    database_type: str = "PostgreSQL"
    entities: List[EntityItem] = []
    relationships: List[Dict[str, Any]] = []
    indexes_and_constraints: List[Dict[str, Any]] = []
    sql_schema_ddl: Optional[str] = None
    is_approved: bool = False
    created_at: datetime
    updated_at: datetime


class DatabaseDesignUpdate(BaseModel):
    database_type: Optional[str] = None
    entities: Optional[List[EntityItem]] = None
    relationships: Optional[List[Dict[str, Any]]] = None
    indexes_and_constraints: Optional[List[Dict[str, Any]]] = None
    sql_schema_ddl: Optional[str] = None
    is_approved: Optional[bool] = None


class ApiEndpointItem(BaseModel):
    id: Optional[str] = None
    tag: str = "General"
    method: str # GET, POST, PUT, DELETE, PATCH
    path: str
    summary: str
    description: Optional[str] = None
    auth_required: bool = True
    required_role: str = "authenticated"
    request_headers: List[Dict[str, Any]] = []
    query_params: List[Dict[str, Any]] = []
    path_params: List[Dict[str, Any]] = []
    request_body_schema: Any = {}
    response_success_schema: Any = {}
    response_error_schemas: List[Dict[str, Any]] = []
    is_approved: bool = True


class ApiSpecificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    tag: str
    method: str
    path: str
    summary: str
    description: Optional[str] = None
    auth_required: bool
    required_role: str
    request_headers: List[Dict[str, Any]] = []
    query_params: List[Dict[str, Any]] = []
    path_params: List[Dict[str, Any]] = []
    request_body_schema: Any = {}
    response_success_schema: Any = {}
    response_error_schemas: List[Dict[str, Any]] = []
    is_approved: bool
    created_at: datetime
    updated_at: datetime
