from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.db_api_design import DatabaseDesign, ApiSpecification
from app.models.requirement import RequirementAnalysis
from app.schemas.db_api_design import (
    DatabaseDesignResponse,
    DatabaseDesignUpdate,
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/projects/{project_id}/database", tags=["Database Design"])


@router.get("", response_model=DatabaseDesignResponse)
def get_project_database_design(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    design = db.query(DatabaseDesign).filter(DatabaseDesign.project_id == project.id).first()
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database schema has not been generated for this project yet",
        )
    return design


@router.post("/generate", response_model=DatabaseDesignResponse)
async def generate_project_database_and_api(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    req = db.query(RequirementAnalysis).filter(RequirementAnalysis.project_id == project.id).first()
    req_dict = {
        "functional_requirements": req.functional_requirements if req else [],
    }

    result = await ai_service.generate_database_and_api(
        project_name=project.name,
        idea=project.business_idea,
        req_data=req_dict,
    )

    db_data = result["database"]
    design = db.query(DatabaseDesign).filter(DatabaseDesign.project_id == project.id).first()
    if design:
        design.database_type = db_data["database_type"]
        design.entities = db_data["entities"]
        design.relationships = db_data["relationships"]
        design.indexes_and_constraints = db_data["indexes_and_constraints"]
        design.sql_schema_ddl = db_data["sql_schema_ddl"]
        design.updated_at = datetime.now(timezone.utc)
    else:
        design = DatabaseDesign(
            project_id=project.id,
            database_type=db_data["database_type"],
            entities=db_data["entities"],
            relationships=db_data["relationships"],
            indexes_and_constraints=db_data["indexes_and_constraints"],
            sql_schema_ddl=db_data["sql_schema_ddl"],
        )
        db.add(design)

    # Populate API endpoints as well
    db.query(ApiSpecification).filter(ApiSpecification.project_id == project.id).delete()
    for ep in result["endpoints"]:
        endpoint = ApiSpecification(
            project_id=project.id,
            tag=ep.get("tag", "General"),
            method=ep["method"],
            path=ep["path"],
            summary=ep["summary"],
            description=ep.get("description"),
            auth_required=ep.get("auth_required", True),
            required_role=ep.get("required_role", "authenticated"),
            request_headers=ep.get("request_headers", []),
            query_params=ep.get("query_params", []),
            path_params=ep.get("path_params", []),
            request_body_schema=ep.get("request_body_schema", {}),
            response_success_schema=ep.get("response_success_schema", {}),
            response_error_schemas=ep.get("response_error_schemas", []),
            is_approved=True,
        )
        db.add(endpoint)

    if project.current_stage in ["requirements", "srs", "architecture", "database_api"]:
        project.current_stage = "code_generation"

    db.commit()
    db.refresh(design)
    return design


@router.put("", response_model=DatabaseDesignResponse)
def update_project_database_design(
    payload: DatabaseDesignUpdate,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    design = db.query(DatabaseDesign).filter(DatabaseDesign.project_id == project.id).first()
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database design not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(design, key, value)

    design.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(design)
    return design
