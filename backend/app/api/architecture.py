from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.architecture import ArchitectureDesign
from app.schemas.architecture import (
    ArchitectureResponse,
    ArchitectureUpdateRequest,
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/projects/{project_id}/architecture", tags=["Architecture"])


@router.get("", response_model=ArchitectureResponse)
def get_project_architecture(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    arch = db.query(ArchitectureDesign).filter(ArchitectureDesign.project_id == project.id).first()
    if not arch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Architecture diagram has not been generated for this project yet",
        )
    return arch


@router.post("/generate", response_model=ArchitectureResponse)
async def generate_project_architecture(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    arch_data = await ai_service.generate_architecture(
        project_name=project.name,
        idea=project.business_idea,
        tech_stack=project.preferred_tech_stack,
    )

    arch = db.query(ArchitectureDesign).filter(ArchitectureDesign.project_id == project.id).first()
    if arch:
        arch.overview = arch_data["overview"]
        arch.pattern = arch_data["pattern"]
        arch.components = arch_data["components"]
        arch.nodes = arch_data["nodes"]
        arch.edges = arch_data["edges"]
        arch.data_flows = arch_data["data_flows"]
        arch.spatial_3d_nodes = arch_data["spatial_3d_nodes"]
        arch.updated_at = datetime.now(timezone.utc)
    else:
        arch = ArchitectureDesign(
            project_id=project.id,
            overview=arch_data["overview"],
            pattern=arch_data["pattern"],
            components=arch_data["components"],
            nodes=arch_data["nodes"],
            edges=arch_data["edges"],
            data_flows=arch_data["data_flows"],
            spatial_3d_nodes=arch_data["spatial_3d_nodes"],
        )
        db.add(arch)

    if project.current_stage in ["requirements", "srs", "architecture"]:
        project.current_stage = "database_api"

    db.commit()
    db.refresh(arch)
    return arch


@router.put("", response_model=ArchitectureResponse)
def update_project_architecture(
    payload: ArchitectureUpdateRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    arch = db.query(ArchitectureDesign).filter(ArchitectureDesign.project_id == project.id).first()
    if not arch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Architecture design not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(arch, key, value)

    arch.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(arch)
    return arch
