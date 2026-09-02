from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_user_project
from app.models.project import Project
from app.models.documentation import DocumentationItem
from app.schemas.documentation import (
    DocumentationItemResponse,
    DocumentationUpdateRequest,
)

router = APIRouter(prefix="/projects/{project_id}/docs", tags=["Documentation"])


@router.get("", response_model=List[DocumentationItemResponse])
def get_project_documentation(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    docs = db.query(DocumentationItem).filter(DocumentationItem.project_id == project.id).order_by(DocumentationItem.order.asc()).all()
    return docs


@router.post("/generate", response_model=List[DocumentationItemResponse])
def generate_project_documentation(
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    clean_name = project.name.lower().replace(" ", "_")

    doc_specs = [
        {
            "doc_type": "readme",
            "title": "README.md",
            "order": 1,
            "content": f"""# {project.name}

> {project.business_idea}

## Overview
{project.name} is an enterprise-grade web platform engineered using {project.preferred_tech_stack}.

### Key Highlights
- **Architecture**: Decoupled Client-Server Micro-modular design
- **Authentication**: JWT Access & Refresh Token Rotation with Argon2/Bcrypt
- **Database**: PostgreSQL 16 with ACID consistency and connection pooling
- **Validation**: Strict Pydantic v2 schemas and TypeScript contracts

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.12+ (for local backend development)

### Launching with Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
"""
        },
        {
            "doc_type": "installation",
            "title": "Installation Guide",
            "order": 2,
            "content": f"""# Installation & Local Setup Guide

Follow these steps to run **{project.name}** locally in development mode.

## 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 3. Database Initialization
Ensure PostgreSQL is running locally on port 5432 with database `{clean_name}_db`.
"""
        },
        {
            "doc_type": "api_docs",
            "title": "API Specification",
            "order": 3,
            "content": f"""# REST API Specification

All protected endpoints require the HTTP Header:
`Authorization: Bearer <access_token>`

## Core Endpoints
- `POST /api/auth/register`: Create a new user profile
- `POST /api/auth/login`: Issue JWT token pair
- `POST /api/auth/refresh`: Rotate refresh token
- `GET /api/records`: Fetch domain records
- `POST /api/records`: Create new domain record
- `DELETE /api/records/{{id}}`: Delete record by ID
"""
        },
        {
            "doc_type": "architecture",
            "title": "Architecture Overview",
            "order": 4,
            "content": f"""# System Architecture & Design

### Architectural Pattern
Decoupled Layered Architecture composed of:
1. **Presentation Layer**: React 18 TypeScript Single Page Application (SPA).
2. **Gateway & Domain Layer**: FastAPI asynchronous REST service.
3. **Persistence Layer**: PostgreSQL with SQLAlchemy 2.0 ORM.
4. **Security & RBAC**: Granular token validation and role policies.
"""
        },
        {
            "doc_type": "deployment",
            "title": "Deployment & Production Guide",
            "order": 5,
            "content": f"""# Production Deployment Guide

## Production Checklist
1. Generate high-entropy 32+ character `SECRET_KEY`.
2. Configure SSL/TLS certificates via Nginx or Cloudflare reverse proxy.
3. Ensure PostgreSQL database is encrypted at rest and automated backups are enabled.
4. Set CORS whitelist to production domain only.
"""
        }
    ]

    # Clear old docs
    db.query(DocumentationItem).filter(DocumentationItem.project_id == project.id).delete()

    created_docs = []
    for spec in doc_specs:
        doc = DocumentationItem(
            project_id=project.id,
            doc_type=spec["doc_type"],
            title=spec["title"],
            order=spec["order"],
            markdown_content=spec["content"],
        )
        db.add(doc)
        created_docs.append(doc)

    if project.current_stage != "completed":
        project.current_stage = "documentation"

    db.commit()
    for d in created_docs:
        db.refresh(d)
    return created_docs


@router.put("/{doc_id}", response_model=DocumentationItemResponse)
def update_documentation_item(
    doc_id: str,
    payload: DocumentationUpdateRequest,
    project: Project = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    doc = db.query(DocumentationItem).filter(
        DocumentationItem.id == doc_id,
        DocumentationItem.project_id == project.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documentation item not found")

    doc.markdown_content = payload.markdown_content
    doc.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(doc)
    return doc
