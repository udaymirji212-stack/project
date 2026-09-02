from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.requirement import RequirementAnalysis
from app.models.srs import SRSDocument
from app.schemas.srs import (
    SRSResponse,
    SRSGenerateRequest,
    SRSUpdateRequest,
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/projects/{project_id}/srs", tags=["SRS"])


@router.get("", response_model=SRSResponse)
def get_project_srs(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    srs = db.query(SRSDocument).filter(SRSDocument.project_id == project.id).order_by(SRSDocument.version_number.desc()).first()
    if not srs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SRS document has not been generated for this project yet",
        )
    return srs


@router.post("/generate", response_model=SRSResponse)
async def generate_project_srs(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    req = db.query(RequirementAnalysis).filter(RequirementAnalysis.project_id == project.id).first()
    req_dict = {
        "functional_requirements": req.functional_requirements if req else [],
        "non_functional_requirements": req.non_functional_requirements if req else [],
    }

    srs_data = await ai_service.generate_srs(
        project_name=project.name,
        idea=project.business_idea,
        req_data=req_dict,
        tech_stack=project.preferred_tech_stack,
    )

    # Check for existing version
    existing_count = db.query(SRSDocument).filter(SRSDocument.project_id == project.id).count()
    new_version_num = existing_count + 1
    version_str = f"1.{new_version_num - 1}.0" if new_version_num > 1 else "1.0.0"

    srs = SRSDocument(
        project_id=project.id,
        title=srs_data["title"],
        version=version_str,
        version_number=new_version_num,
        introduction=srs_data["introduction"],
        purpose=srs_data["purpose"],
        scope=srs_data["scope"],
        user_classes=srs_data["user_classes"],
        functional_requirements_text=srs_data["functional_requirements_text"],
        non_functional_requirements_text=srs_data["non_functional_requirements_text"],
        external_interfaces=srs_data["external_interfaces"],
        data_requirements=srs_data["data_requirements"],
        security_requirements=srs_data["security_requirements"],
        constraints=srs_data["constraints"],
        acceptance_criteria=srs_data["acceptance_criteria"],
        full_markdown=srs_data["full_markdown"],
        changelog=f"Generated version {version_str}",
    )
    db.add(srs)

    if project.current_stage in ["requirements", "srs"]:
        project.current_stage = "architecture"

    db.commit()
    db.refresh(srs)
    return srs


@router.put("", response_model=SRSResponse)
def update_project_srs(
    payload: SRSUpdateRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    srs = db.query(SRSDocument).filter(SRSDocument.project_id == project.id).order_by(SRSDocument.version_number.desc()).first()
    if not srs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SRS document not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(srs, key, value)

    srs.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(srs)
    return srs
