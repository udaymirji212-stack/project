import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.generated_file import GeneratedFile
from app.schemas.code_generation import (
    GeneratedFileResponse,
    FileSaveRequest,
    FileCreateRequest,
    FileTreeNode,
)

router = APIRouter(prefix="/projects/{project_id}/workspace", tags=["Workspace"])


def build_tree_from_files(files: List[GeneratedFile]) -> List[Dict[str, Any]]:
    root: Dict[str, Any] = {}

    for f in files:
        parts = f.path.split("/")
        current = root
        for i, part in enumerate(parts):
            if i == len(parts) - 1:
                # File node
                current[part] = {
                    "id": f.id,
                    "name": part,
                    "path": f.path,
                    "type": "file",
                    "extension": f.extension,
                    "language": f.language,
                    "file_type": f.file_type,
                    "is_user_edited": f.is_user_edited,
                    "size_bytes": f.size_bytes,
                }
            else:
                # Folder node
                if part not in current:
                    current[part] = {"__folder__": True, "name": part, "children": {}}
                current = current[part]["children"]

    def convert_dict_to_list(d: Dict[str, Any], current_path: str = "") -> List[Dict[str, Any]]:
        nodes = []
        for name, item in d.items():
            if item.get("__folder__"):
                folder_path = f"{current_path}/{name}" if current_path else name
                nodes.append({
                    "id": f"folder-{folder_path}",
                    "name": name,
                    "path": folder_path,
                    "type": "folder",
                    "children": convert_dict_to_list(item["children"], folder_path)
                })
            else:
                nodes.append(item)
        
        # Sort folders first, then files alphabetically
        nodes.sort(key=lambda x: (0 if x["type"] == "folder" else 1, x["name"].lower()))
        return nodes

    return convert_dict_to_list(root)


@router.get("/tree")
def get_workspace_tree(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    files = db.query(GeneratedFile).filter(GeneratedFile.project_id == project.id).all()
    return build_tree_from_files(files)


@router.get("/files", response_model=List[GeneratedFileResponse])
def get_all_workspace_files(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    return db.query(GeneratedFile).filter(GeneratedFile.project_id == project.id).all()


@router.get("/files/{file_id}", response_model=GeneratedFileResponse)
def get_workspace_file_by_id(
    file_id: str,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    file = db.query(GeneratedFile).filter(
        GeneratedFile.id == file_id,
        GeneratedFile.project_id == project.id
    ).first()
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found in project")
    return file


@router.put("/files/{file_id}", response_model=GeneratedFileResponse)
def save_workspace_file(
    file_id: str,
    payload: FileSaveRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    file = db.query(GeneratedFile).filter(
        GeneratedFile.id == file_id,
        GeneratedFile.project_id == project.id
    ).first()
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found in project")

    file.content = payload.content
    file.size_bytes = len(payload.content.encode("utf-8"))
    file.is_user_edited = True
    file.version += 1
    file.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(file)
    return file


@router.post("/files", response_model=GeneratedFileResponse, status_code=status.HTTP_201_CREATED)
def create_custom_file(
    payload: FileCreateRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    clean_path = payload.path.strip().lstrip("/")
    filename = os.path.basename(clean_path)
    extension = filename.split(".")[-1] if "." in filename else ""
    
    lang_map = {
        "py": "python",
        "ts": "typescript",
        "tsx": "typescript",
        "js": "javascript",
        "jsx": "javascript",
        "json": "json",
        "html": "html",
        "css": "css",
        "md": "markdown",
        "yml": "yaml",
        "yaml": "yaml",
        "sql": "sql",
        "dockerfile": "dockerfile",
    }
    language = lang_map.get(extension.lower(), "plaintext")

    existing = db.query(GeneratedFile).filter(
        GeneratedFile.project_id == project.id,
        GeneratedFile.path == clean_path
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File already exists at this path")

    file = GeneratedFile(
        project_id=project.id,
        path=clean_path,
        filename=filename,
        extension=extension,
        language=language,
        file_type=payload.file_type,
        content=payload.content,
        size_bytes=len(payload.content.encode("utf-8")),
        is_user_edited=True,
        version=1,
    )
    db.add(file)
    db.commit()
    db.refresh(file)
    return file


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_file(
    file_id: str,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    file = db.query(GeneratedFile).filter(
        GeneratedFile.id == file_id,
        GeneratedFile.project_id == project.id
    ).first()
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    db.delete(file)
    db.commit()
    return None
