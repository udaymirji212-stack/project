from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.core.database import get_db
from app.core.deps import get_current_user, get_user_project
from app.models.user import User
from app.models.project import Project
from app.models.generated_file import GeneratedFile
from app.models.code_review import CodeReview, TestRun
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    DashboardStatsResponse,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects_query = db.query(Project).filter(Project.owner_id == current_user.id)
    total_projects = projects_query.count()
    active_projects = projects_query.filter(Project.status == "in_progress").count()
    completed_projects = projects_query.filter(Project.status == "completed").count()

    # Total files generated across all user projects
    project_ids = [p.id for p in projects_query.all()]
    total_files = 0
    total_reviews = 0
    total_tests_passed = 0

    if project_ids:
        total_files = db.query(GeneratedFile).filter(GeneratedFile.project_id.in_(project_ids)).count()
        total_reviews = db.query(CodeReview).filter(CodeReview.project_id.in_(project_ids)).count()
        test_runs = db.query(TestRun).filter(TestRun.project_id.in_(project_ids)).all()
        total_tests_passed = sum(tr.passed_count for tr in test_runs)

    return DashboardStatsResponse(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_projects=completed_projects,
        total_generated_files=total_files,
        total_reviews_run=total_reviews,
        total_tests_passed=total_tests_passed,
        current_user_name=current_user.full_name,
    )


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    search: Optional[str] = Query(None, description="Search term across name or idea"),
    status: Optional[str] = Query(None, description="Filter by status: in_progress, completed, archived"),
    stage: Optional[str] = Query(None, description="Filter by workflow stage"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.owner_id == current_user.id)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(or_(Project.name.ilike(search_fmt), Project.business_idea.ilike(search_fmt)))

    if status:
        query = query.filter(Project.status == status)

    if stage:
        query = query.filter(Project.current_stage == stage)

    query = query.order_by(Project.updated_at.desc())
    projects = query.all()

    # Update dynamic file count for each project
    for p in projects:
        p.file_count = db.query(GeneratedFile).filter(GeneratedFile.project_id == p.id).count()

    return projects


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        owner_id=current_user.id,
        name=payload.name,
        business_idea=payload.business_idea,
        target_users=payload.target_users,
        main_problem=payload.main_problem,
        expected_features=payload.expected_features,
        preferred_tech_stack=payload.preferred_tech_stack,
        constraints=payload.constraints,
        current_stage="requirements",
        status="in_progress",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project: Project = Depends(get_user_project), db: Session = Depends(get_db)):
    project.file_count = db.query(GeneratedFile).filter(GeneratedFile.project_id == project.id).count()
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    payload: ProjectUpdate,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    project.file_count = db.query(GeneratedFile).filter(GeneratedFile.project_id == project.id).count()
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    db.delete(project)
    db.commit()
    return None
