from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.db_api_design import ApiSpecification
from app.schemas.db_api_design import (
    ApiSpecificationResponse,
    ApiEndpointItem,
)

router = APIRouter(prefix="/projects/{project_id}/api-design", tags=["API Design"])


@router.get("", response_model=List[ApiSpecificationResponse])
def list_api_endpoints(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    endpoints = db.query(ApiSpecification).filter(ApiSpecification.project_id == project.id).all()
    return endpoints


@router.post("", response_model=ApiSpecificationResponse, status_code=status.HTTP_201_CREATED)
def create_api_endpoint(
    payload: ApiEndpointItem,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    ep = ApiSpecification(
        project_id=project.id,
        tag=payload.tag,
        method=payload.method.upper(),
        path=payload.path,
        summary=payload.summary,
        description=payload.description,
        auth_required=payload.auth_required,
        required_role=payload.required_role,
        request_headers=payload.request_headers,
        query_params=payload.query_params,
        path_params=payload.path_params,
        request_body_schema=payload.request_body_schema,
        response_success_schema=payload.response_success_schema,
        response_error_schemas=payload.response_error_schemas,
        is_approved=payload.is_approved,
    )
    db.add(ep)
    db.commit()
    db.refresh(ep)
    return ep


@router.put("/{endpoint_id}", response_model=ApiSpecificationResponse)
def update_api_endpoint(
    endpoint_id: str,
    payload: ApiEndpointItem,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    ep = db.query(ApiSpecification).filter(
        ApiSpecification.id == endpoint_id,
        ApiSpecification.project_id == project.id
    ).first()
    if not ep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Endpoint not found")

    ep.tag = payload.tag
    ep.method = payload.method.upper()
    ep.path = payload.path
    ep.summary = payload.summary
    ep.description = payload.description
    ep.auth_required = payload.auth_required
    ep.required_role = payload.required_role
    ep.request_headers = payload.request_headers
    ep.query_params = payload.query_params
    ep.path_params = payload.path_params
    ep.request_body_schema = payload.request_body_schema
    ep.response_success_schema = payload.response_success_schema
    ep.response_error_schemas = payload.response_error_schemas
    ep.is_approved = payload.is_approved

    db.commit()
    db.refresh(ep)
    return ep


@router.delete("/{endpoint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_endpoint(
    endpoint_id: str,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    ep = db.query(ApiSpecification).filter(
        ApiSpecification.id == endpoint_id,
        ApiSpecification.project_id == project.id
    ).first()
    if not ep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Endpoint not found")

    db.delete(ep)
    db.commit()
    return None
