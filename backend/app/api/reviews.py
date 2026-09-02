from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.code_review import CodeReview, TestRun
from app.models.generated_file import GeneratedFile
from app.schemas.review import (
    CodeReviewResponse,
    ApplyFixRequest,
    TestRunResponse,
)
from app.services.test_runner_service import TestRunnerService

router = APIRouter(prefix="/projects/{project_id}/reviews", tags=["Reviews & Testing"])


@router.get("", response_model=Optional[CodeReviewResponse])
def get_latest_review(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    review = db.query(CodeReview).filter(CodeReview.project_id == project.id).order_by(CodeReview.created_at.desc()).first()
    return review


@router.post("/run", response_model=CodeReviewResponse)
def run_code_review(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    files = db.query(GeneratedFile).filter(GeneratedFile.project_id == project.id).all()
    file_list = [{"path": f.path, "content": f.content} for f in files]

    result = TestRunnerService.run_security_and_quality_review(
        project_name=project.name,
        file_list=file_list
    )

    review = CodeReview(
        project_id=project.id,
        summary=result["summary"],
        score=result["score"],
        issues=result["issues"],
        total_issues=result["total_issues"],
        critical_count=result["critical_count"],
        high_count=result["high_count"],
        medium_count=result["medium_count"],
        low_count=result["low_count"],
    )
    db.add(review)
    project.issue_count = result["total_issues"]

    db.commit()
    db.refresh(review)
    return review


@router.post("/apply-fix", response_model=CodeReviewResponse)
@router.post("/apply-fix/{issue_id}", response_model=CodeReviewResponse)
def apply_review_fix(
    issue_id: Optional[str] = None,
    payload: Optional[ApplyFixRequest] = None,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    target_id = issue_id or (payload.issue_id if payload else None)
    if not target_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Issue ID is required")

    review = db.query(CodeReview).filter(CodeReview.project_id == project.id).order_by(CodeReview.created_at.desc()).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No code review found")

    updated_issues = []
    found = False
    for issue in review.issues:
        issue_copy = dict(issue)
        if issue_copy.get("id") == target_id:
            issue_copy["is_applied"] = True
            found = True
        updated_issues.append(issue_copy)

    if not found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue ID not found in review")

    review.issues = updated_issues
    flag_modified(review, "issues")

    # Recalculate counts
    unresolved = [i for i in updated_issues if not i.get("is_applied")]
    project.issue_count = len(unresolved)

    db.commit()
    db.refresh(review)
    return review


@router.get("/tests", response_model=Optional[TestRunResponse])
def get_latest_test_run(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    test_run = db.query(TestRun).filter(TestRun.project_id == project.id).order_by(TestRun.created_at.desc()).first()
    return test_run


@router.post("/tests/run", response_model=TestRunResponse)
def run_project_tests(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    result = TestRunnerService.execute_test_suite(project_name=project.name)

    test_run = TestRun(
        project_id=project.id,
        test_type=result["test_type"],
        passed_count=result["passed_count"],
        failed_count=result["failed_count"],
        total_count=result["total_count"],
        execution_time_ms=result["execution_time_ms"],
        test_cases=result["test_cases"],
        raw_output=result["raw_output"],
    )
    db.add(test_run)
    project.test_count = result["passed_count"]

    if project.current_stage in ["requirements", "srs", "architecture", "database_api", "code_generation", "workspace"]:
        project.current_stage = "review_testing"

    db.commit()
    db.refresh(test_run)
    return test_run
