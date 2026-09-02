import os
from typing import List, Dict, Any


class CodeGeneratorEngine:
    @staticmethod
    def generate_full_project(project_name: str, idea: str, tech_stack: str = "", requirements: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        clean_name = project_name.lower().replace(" ", "_").replace("-", "_")
        files: List[Dict[str, Any]] = []

        # 1. Backend: main.py
        main_py = f'''"""
{project_name} — High-Performance API Gateway
Generated via AI Requirement-to-Code Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router
from app.core.config import settings

app = FastAPI(
    title="{project_name} API",
    description="Automated production API for {idea}",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    return {{"status": "healthy", "service": "{project_name}", "version": "1.0.0"}}

# Attach Core API Router
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
'''
        files.append({
            "path": "backend/app/main.py",
            "filename": "main.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": main_py
        })

        # 2. Backend: config.py
        config_py = f'''from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "{project_name}"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/{clean_name}_db"
    SECRET_KEY: str = "change_this_secret_key_in_production_environments_32_chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")


settings = Settings()
'''
        files.append({
            "path": "backend/app/core/config.py",
            "filename": "config.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": config_py
        })

        # 3. Backend: models/record.py
        models_py = '''import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    records = relationship("DomainRecord", back_populates="owner", cascade="all, delete-orphan")


class DomainRecord(Base):
    __tablename__ = "domain_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="active")
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="records")
'''
        files.append({
            "path": "backend/app/models/record.py",
            "filename": "record.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": models_py
        })

        # 4. Backend: schemas/record.py
        schemas_py = '''from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(..., min_length=8)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class RecordCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    status: str = "active"
    payload: Optional[Dict[str, Any]] = None


class RecordOut(BaseModel):
    id: str
    owner_id: str
    title: str
    status: str
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
'''
        files.append({
            "path": "backend/app/schemas/record.py",
            "filename": "record.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": schemas_py
        })

        # 5. Backend: api/records.py
        router_py = f'''from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.record import RecordCreate, RecordOut

router = APIRouter(prefix="/records", tags=["Records"])


@router.get("", response_model=List[RecordOut])
async def list_records():
    """Retrieve all active domain records for {project_name}."""
    return []


@router.post("", response_model=RecordOut, status_code=status.HTTP_201_CREATED)
async def create_record(item: RecordCreate):
    """Create a new domain record with validated schema."""
    import uuid
    from datetime import datetime, timezone
    return RecordOut(
        id=str(uuid.uuid4()),
        owner_id="system-user",
        title=item.title,
        status=item.status,
        payload=item.payload or {{}},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
'''
        files.append({
            "path": "backend/app/api/records.py",
            "filename": "records.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": router_py
        })

        # 6. Backend: api/__init__.py
        files.append({
            "path": "backend/app/api/__init__.py",
            "filename": "__init__.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": '''from fastapi import APIRouter
from app.api.records import router as records_router

router = APIRouter()
router.include_router(records_router)
'''
        })

        # 7. Backend: Dockerfile
        files.append({
            "path": "backend/Dockerfile",
            "filename": "Dockerfile",
            "extension": "dockerfile",
            "language": "dockerfile",
            "file_type": "docker",
            "content": '''FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'''
        })

        # 8. Backend: requirements.txt
        files.append({
            "path": "backend/requirements.txt",
            "filename": "requirements.txt",
            "extension": "txt",
            "language": "plaintext",
            "file_type": "config",
            "content": '''fastapi>=0.115.0
uvicorn[standard]>=0.30.0
sqlalchemy>=2.0.30
pydantic>=2.7.0
pydantic-settings>=2.3.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
psycopg2-binary>=2.9.9
email-validator>=2.0.0
httpx>=0.27.0
pytest>=8.2.0
pytest-asyncio>=0.23.0
'''
        })

        # 9. Frontend: App.tsx
        frontend_app_tsx = f'''import React, {{ useState }} from 'react';
import {{ Layout, ShieldCheck, Database, Server, RefreshCw, Plus }} from 'lucide-react';

interface DomainRecord {{
  id: string;
  title: string;
  status: string;
  created_at: string;
}}

export default function App() {{
  const [records, setRecords] = useState<DomainRecord[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = (e: React.FormEvent) => {{
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: DomainRecord = {{
      id: Math.random().toString(36).substring(7),
      title: newTitle,
      status: 'active',
      created_at: new Date().toISOString()
    }};
    setRecords([item, ...records]);
    setNewTitle('');
  }};

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0D2818] font-sans antialiased p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-[#0D2818]/15 pb-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#84CC16] bg-[#0D2818] px-3 py-1 rounded-full">
              Production Client
            </span>
            <h1 className="text-4xl font-serif font-bold text-[#0D2818] mt-2">{project_name}</h1>
            <p className="text-sm text-[#0D2818]/70 mt-1">{idea}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Connected
            </span>
          </div>
        </header>

        <div className="bg-white rounded-2xl p-6 border border-[#0D2818]/10 shadow-sm">
          <form onSubmit={{handleCreate}} className="flex gap-4">
            <input
              type="text"
              value={{newTitle}}
              onChange={{(e) => setNewTitle(e.target.value)}}
              placeholder="Enter new record item or parameter..."
              className="flex-1 px-4 py-3 rounded-full border border-[#0D2818]/20 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#0D2818] text-white hover:bg-[#163E2B] transition-all font-medium inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#84CC16]" />
              Add Record
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#0D2818]/10 shadow-sm space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#0D2818]">Domain Records</h2>
          {{records.length === 0 ? (
            <div className="text-center py-12 text-[#0D2818]/50 text-sm">
              No records created yet. Add a new record above to get started.
            </div>
          ) : (
            <div className="divide-y divide-[#0D2818]/10">
              {{records.map((rec) => (
                <div key={{rec.id}} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-[#0D2818]">{{rec.title}}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#0D2818]/15 font-mono text-[#0D2818]/80">
                    {{rec.status}}
                  </span>
                </div>
              ))}}
            </div>
          )}}
        </div>
      </div>
    </div>
  );
}}
'''
        files.append({
            "path": "frontend/src/App.tsx",
            "filename": "App.tsx",
            "extension": "tsx",
            "language": "typescript",
            "file_type": "frontend",
            "content": frontend_app_tsx
        })

        # 10. Frontend: package.json
        files.append({
            "path": "frontend/package.json",
            "filename": "package.json",
            "extension": "json",
            "language": "json",
            "file_type": "config",
            "content": f'''{{
  "name": "{clean_name}-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }},
  "dependencies": {{
    "lucide-react": "^0.395.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }},
  "devDependencies": {{
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.3.1"
  }}
}}
'''
        })

        # 11. Root: docker-compose.yml
        files.append({
            "path": "docker-compose.yml",
            "filename": "docker-compose.yml",
            "extension": "yml",
            "language": "yaml",
            "file_type": "docker",
            "content": f'''version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: {clean_name}_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: {clean_name}_db
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: {clean_name}_backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/{clean_name}_db
      SECRET_KEY: production_jwt_secret_token_key_32_chars
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    container_name: {clean_name}_frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  db_data:
'''
        })

        # 12. Tests: test_api.py
        files.append({
            "path": "backend/tests/test_api.py",
            "filename": "test_api.py",
            "extension": "py",
            "language": "python",
            "file_type": "test",
            "content": '''import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_records_endpoint():
    response = client.get("/api/records")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_record():
    payload = {"title": "Test Domain Entity", "status": "active"}
    response = client.post("/api/records", json=payload)
    assert response.status_code == 201
    assert response.json()["title"] == "Test Domain Entity"
'''
        })

        # 13. Environment Template: .env.example
        files.append({
            "path": ".env.example",
            "filename": ".env.example",
            "extension": "example",
            "language": "plaintext",
            "file_type": "config",
            "content": f'''# Environment Variables for {project_name}
PROJECT_NAME={project_name}
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{clean_name}_db
SECRET_KEY=your_production_secret_key_32_characters_long
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
'''
        })

        return files
