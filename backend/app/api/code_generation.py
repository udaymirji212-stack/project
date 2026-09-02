from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.generated_file import GeneratedFile
from app.models.requirement import RequirementAnalysis
from app.schemas.code_generation import (
    CodeGenTriggerRequest,
    GeneratedFileResponse,
)
from app.services.code_generator_engine import CodeGeneratorEngine

router = APIRouter(prefix="/projects/{project_id}/code-generation", tags=["Code Generation"])


@router.post("/generate", response_model=List[GeneratedFileResponse])
def trigger_code_generation(
    payload: CodeGenTriggerRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    req = db.query(RequirementAnalysis).filter(RequirementAnalysis.project_id == project.id).first()
    req_dict = {
        "functional_requirements": req.functional_requirements if req else [],
    }

    generated_items = CodeGeneratorEngine.generate_full_project(
        project_name=project.name,
        idea=project.business_idea,
        tech_stack=project.preferred_tech_stack,
        requirements=req_dict,
    )

    results = []
    for item in generated_items:
        # Check if file exists
        existing_file = db.query(GeneratedFile).filter(
            GeneratedFile.project_id == project.id,
            GeneratedFile.path == item["path"]
        ).first()

        if existing_file:
            # If user edited and force_regenerate is False, skip overwriting
            if existing_file.is_user_edited and not payload.force_regenerate:
                results.append(existing_file)
                continue
            existing_file.content = item["content"]
            existing_file.size_bytes = len(item["content"].encode("utf-8"))
            existing_file.version += 1
            existing_file.updated_at = datetime.now(timezone.utc)
            results.append(existing_file)
        else:
            new_file = GeneratedFile(
                project_id=project.id,
                path=item["path"],
                filename=item["filename"],
                extension=item["extension"],
                language=item["language"],
                file_type=item["file_type"],
                content=item["content"],
                size_bytes=len(item["content"].encode("utf-8")),
                is_user_edited=False,
                version=1,
            )
            db.add(new_file)
            results.append(new_file)

    project.file_count = len(results)
    if project.current_stage in ["requirements", "srs", "architecture", "database_api", "code_generation"]:
        project.current_stage = "workspace"

    db.commit()
    for r in results:
        db.refresh(r)
    return results
