from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.requirement import RequirementAnalysis
from app.schemas.requirement import (
    RequirementAnalysisResponse,
    RequirementUpdateRequest,
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/projects/{project_id}/requirements", tags=["Requirements"])


@router.get("", response_model=RequirementAnalysisResponse)
def get_project_requirements(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    req = db.query(RequirementAnalysis).filter(RequirementAnalysis.project_id == project.id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirements analysis has not been generated for this project yet",
        )
    return req


@router.post("/generate", response_model=RequirementAnalysisResponse)
async def generate_project_requirements(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    # Call AI service
    ai_result = await ai_service.analyze_requirements(
        project_name=project.name,
        idea=project.business_idea,
        target_users=project.target_users or "",
        problem=project.main_problem or "",
        features=project.expected_features or "",
        stack=project.preferred_tech_stack,
    )

    req = db.query(RequirementAnalysis).filter(RequirementAnalysis.project_id == project.id).first()
    if req:
        req.functional_requirements = ai_result.get("functional_requirements", [])
        req.non_functional_requirements = ai_result.get("non_functional_requirements", [])
        req.user_roles = ai_result.get("user_roles", [])
        req.user_stories = ai_result.get("user_stories", [])
        req.risks_assumptions = ai_result.get("risks_assumptions", {})
        req.updated_at = datetime.now(timezone.utc)
    else:
        req = RequirementAnalysis(
            project_id=project.id,
            functional_requirements=ai_result.get("functional_requirements", []),
            non_functional_requirements=ai_result.get("non_functional_requirements", []),
            user_roles=ai_result.get("user_roles", []),
            user_stories=ai_result.get("user_stories", []),
            risks_assumptions=ai_result.get("risks_assumptions", {}),
        )
        db.add(req)

    # Advance project stage
    if project.current_stage == "requirements":
        project.current_stage = "srs"

    db.commit()
    db.refresh(req)
    return req


@router.put("", response_model=RequirementAnalysisResponse)
def update_project_requirements(
    payload: RequirementUpdateRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    req = db.query(RequirementAnalysis).filter(RequirementAnalysis.project_id == project.id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirements have not been generated yet",
        )

    if payload.functional_requirements is not None:
        req.functional_requirements = [item.model_dump() for item in payload.functional_requirements]
    if payload.non_functional_requirements is not None:
        req.non_functional_requirements = [item.model_dump() for item in payload.non_functional_requirements]
    if payload.user_roles is not None:
        req.user_roles = [item.model_dump() for item in payload.user_roles]
    if payload.user_stories is not None:
        req.user_stories = [item.model_dump() for item in payload.user_stories]
    if payload.risks_assumptions is not None:
        req.risks_assumptions = payload.risks_assumptions.model_dump()
    if payload.is_approved is not None:
        req.is_approved = payload.is_approved
        if payload.is_approved:
            req.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(req)
    return req
