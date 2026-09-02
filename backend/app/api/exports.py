from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.generated_file import GeneratedFile
from app.models.documentation import DocumentationItem
from app.services.zip_export_service import ZipExportService

router = APIRouter(prefix="/projects/{project_id}/export", tags=["Project Export"])


@router.get("/zip")
def download_project_zip(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    files = db.query(GeneratedFile).filter(GeneratedFile.project_id == project.id).all()
    docs = db.query(DocumentationItem).filter(DocumentationItem.project_id == project.id).all()

    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot export empty project. Please generate codebase files before downloading."
        )

    zip_buffer = ZipExportService.create_project_zip(
        project_name=project.name,
        files=files,
        docs=docs
    )

    clean_filename = f"{project.name.lower().replace(' ', '_')}_source.zip"

    # Mark project as completed upon successful export
    project.status = "completed"
    project.current_stage = "completed"
    db.commit()

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={clean_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )
