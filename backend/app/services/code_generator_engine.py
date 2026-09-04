import os
import re
from typing import List, Dict, Any
from app.services.domain_analyzer import DomainAnalyzer


class CodeGeneratorEngine:
    @classmethod
    def generate_full_project(
        cls,
        project_name: str,
        idea: str,
        tech_stack: str = "",
        requirements: Dict[str, Any] = None,
    ) -> List[Dict[str, Any]]:
        clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', project_name.lower().strip())
        profile = DomainAnalyzer.analyze_project(
            project_name=project_name,
            idea=idea,
            stack=tech_stack,
        )

        domain = profile.get("domain", "enterprise")
        primary_entity = profile.get("primary_entity", "Record")
        secondary_entity = profile.get("secondary_entity", "Item")
        table_name = primary_entity.lower() + "s"
        entity_snake = primary_entity.lower()

        files: List[Dict[str, Any]] = []

        # ---------------------------------------------------------
        # 1. Backend: main.py
        # ---------------------------------------------------------
        main_py = f'''"""
{project_name} — High-Performance Production API Gateway
Domain: {domain.upper()}
Generated via AI Requirement-to-Code Platform
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("{clean_name}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing relational database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down service...")


app = FastAPI(
    title="{project_name} API",
    description="Production-ready REST API for {idea}",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {{request.method}} {{request.url.path}}: {{exc}}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={{"detail": "An internal server error occurred."}},
    )


@app.get("/health", tags=["Health"])
async def health_check():
    return {{
        "status": "healthy",
        "service": "{project_name}",
        "domain": "{domain}",
        "version": "1.0.0",
    }}


# Attach API Routes
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
            "content": main_py,
        })

        # ---------------------------------------------------------
        # 2. Backend: config.py
        # ---------------------------------------------------------
        config_py = f'''from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "{project_name}"
    DATABASE_URL: str = "sqlite:///./{clean_name}.db"
    SECRET_KEY: str = "super_secure_jwt_secret_key_32_characters_long_for_dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")


settings = Settings()
'''
        files.append({
            "path": "backend/app/core/config.py",
            "filename": "config.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": config_py,
        })

        # ---------------------------------------------------------
        # 3. Backend: database.py
        # ---------------------------------------------------------
        database_py = '''from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
'''
        files.append({
            "path": "backend/app/core/database.py",
            "filename": "database.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": database_py,
        })

        # ---------------------------------------------------------
        # 4. Backend: security.py
        # ---------------------------------------------------------
        security_py = '''import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        from app.models.user import User
        return db.query(User).filter(User.id == user_id).first()
    except JWTError:
        return None
'''
        files.append({
            "path": "backend/app/core/security.py",
            "filename": "security.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": security_py,
        })

        # ---------------------------------------------------------
        # 5. Backend: models/user.py
        # ---------------------------------------------------------
        models_user_py = f'''import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    {table_name} = relationship("{primary_entity}", back_populates="owner", cascade="all, delete-orphan")
'''
        files.append({
            "path": "backend/app/models/user.py",
            "filename": "user.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": models_user_py,
        })

        # ---------------------------------------------------------
        # 6. Backend: models/domain_models.py (Tailored to Domain)
        # ---------------------------------------------------------
        if domain == "fintech":
            models_domain_py = '''import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_name = Column(String(100), nullable=False)
    account_type = Column(String(50), default="checking")
    currency = Column(String(10), default="USD")
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    owner = relationship("User", foreign_keys=[user_id])
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(String(36), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    merchant = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), default="debit")
    category = Column(String(50), default="General", index=True)
    status = Column(String(30), default="completed", index=True)
    transaction_date = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    owner = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
'''
        elif domain == "healthtech":
            models_domain_py = '''import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medical_record_number = Column(String(50), unique=True, nullable=False, index=True)
    date_of_birth = Column(String(20), nullable=False)
    blood_group = Column(String(10), default="O+")
    emergency_contact = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    owner = relationship("User", foreign_keys=[user_id])
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    doctor_name = Column(String(100), nullable=False)
    scheduled_time = Column(DateTime(timezone=True), default=utcnow)
    status = Column(String(30), default="scheduled", index=True)
    triage_severity = Column(String(20), default="Routine")
    chief_complaint = Column(Text, nullable=False)
    consultation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    owner = relationship("User", back_populates="appointments")
    patient = relationship("Patient", back_populates="appointments")
'''
        elif domain == "ai_knowledge":
            models_domain_py = '''import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_type = Column(String(30), default="pdf")
    total_chunks = Column(Integer, default=0)
    status = Column(String(30), default="indexed", index=True)
    content_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="knowledge_documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, default=0)
    chunk_text = Column(Text, nullable=False)
    token_count = Column(Integer, default=128)
    embedding_dim = Column(Integer, default=1536)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    document = relationship("KnowledgeDocument", back_populates="chunks")
'''
        else:
            models_domain_py = f'''import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class {primary_entity}(Base):
    __tablename__ = "{table_name}"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="General", index=True)
    status = Column(String(50), default="active", index=True)
    priority = Column(String(20), default="medium")
    data_payload = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="{table_name}")
'''
        files.append({
            "path": f"backend/app/models/{entity_snake}.py",
            "filename": f"{entity_snake}.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": models_domain_py,
        })

        # ---------------------------------------------------------
        # 7. Backend: schemas/auth.py & schemas/domain.py
        # ---------------------------------------------------------
        schemas_auth_py = '''from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
'''
        files.append({
            "path": "backend/app/schemas/auth.py",
            "filename": "auth.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": schemas_auth_py,
        })

        schemas_domain_py = f'''from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class {primary_entity}Base(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = "General"
    status: Optional[str] = "active"
    priority: Optional[str] = "medium"
    data_payload: Optional[Dict[str, Any]] = None


class {primary_entity}Create({primary_entity}Base):
    pass


class {primary_entity}Update(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    data_payload: Optional[Dict[str, Any]] = None


class {primary_entity}Response({primary_entity}Base):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DomainStatsResponse(BaseModel):
    total_count: int
    active_count: int
    completed_count: int
    recent_activity: List[{primary_entity}Response]
'''
        files.append({
            "path": f"backend/app/schemas/{entity_snake}.py",
            "filename": f"{entity_snake}.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": schemas_domain_py,
        })

        # ---------------------------------------------------------
        # 8. Backend: api/auth.py
        # ---------------------------------------------------------
        api_auth_py = '''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user_optional
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user_optional)):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user
'''
        files.append({
            "path": "backend/app/api/auth.py",
            "filename": "auth.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": api_auth_py,
        })

        # ---------------------------------------------------------
        # 9. Backend: api/domain.py (Real Database CRUD Router)
        # ---------------------------------------------------------
        api_domain_py = f'''import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.models.{entity_snake} import {primary_entity}
from app.schemas.{entity_snake} import (
    {primary_entity}Create,
    {primary_entity}Update,
    {primary_entity}Response,
    DomainStatsResponse,
)

router = APIRouter(prefix="/{table_name}", tags=["{primary_entity} Management"])


def get_or_create_default_user(db: Session, current_user: Optional[User]) -> User:
    if current_user:
        return current_user
    user = db.query(User).first()
    if not user:
        from app.core.security import get_password_hash
        user = User(
            email="demo@{clean_name}.com",
            full_name="Demo Operator",
            hashed_password=get_password_hash("password123"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("", response_model=List[{primary_entity}Response])
def list_{table_name}(
    search: Optional[str] = Query(None, description="Search by title or category"),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query({primary_entity})
    if search:
        query = query.filter(
            or_(
                {primary_entity}.title.ilike(f"%{{search}}%"),
                {primary_entity}.category.ilike(f"%{{search}}%"),
            )
        )
    if status_filter:
        query = query.filter({primary_entity}.status == status_filter)

    records = query.order_by({primary_entity}.created_at.desc()).offset(offset).limit(limit).all()
    return records


@router.post("", response_model={primary_entity}Response, status_code=status.HTTP_201_CREATED)
def create_{entity_snake}(
    payload: {primary_entity}Create,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    owner = get_or_create_default_user(db, user)
    record = {primary_entity}(
        id=str(uuid.uuid4()),
        user_id=owner.id,
        title=payload.title,
        category=payload.category or "General",
        status=payload.status or "active",
        priority=payload.priority or "medium",
        data_payload=payload.data_payload or {{}},
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/stats", response_model=DomainStatsResponse)
def get_{entity_snake}_stats(
    db: Session = Depends(get_db),
):
    total = db.query({primary_entity}).count()
    active = db.query({primary_entity}).filter({primary_entity}.status == "active").count()
    completed = db.query({primary_entity}).filter({primary_entity}.status.in_(["completed", "resolved", "indexed"])).count()
    recent = db.query({primary_entity}).order_by({primary_entity}.created_at.desc()).limit(5).all()

    return DomainStatsResponse(
        total_count=total,
        active_count=active,
        completed_count=completed,
        recent_activity=recent,
    )


@router.get("/{{id}}", response_model={primary_entity}Response)
def get_{entity_snake}_by_id(
    id: str,
    db: Session = Depends(get_db),
):
    record = db.query({primary_entity}).filter({primary_entity}.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{primary_entity} record not found"
        )
    return record


@router.put("/{{id}}", response_model={primary_entity}Response)
def update_{entity_snake}(
    id: str,
    payload: {primary_entity}Update,
    db: Session = Depends(get_db),
):
    record = db.query({primary_entity}).filter({primary_entity}.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{primary_entity} record not found"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{{id}}", status_code=status.HTTP_204_NO_CONTENT)
def delete_{entity_snake}(
    id: str,
    db: Session = Depends(get_db),
):
    record = db.query({primary_entity}).filter({primary_entity}.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{primary_entity} record not found"
        )
    db.delete(record)
    db.commit()
    return None
'''
        files.append({
            "path": f"backend/app/api/{table_name}.py",
            "filename": f"{table_name}.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": api_domain_py,
        })

        # ---------------------------------------------------------
        # 10. Backend: api/router.py
        # ---------------------------------------------------------
        api_router_py = f'''from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.{table_name} import router as {table_name}_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router({table_name}_router)
'''
        files.append({
            "path": "backend/app/api/router.py",
            "filename": "router.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": api_router_py,
        })

        # ---------------------------------------------------------
        # 11. Backend: tests/test_api.py (Automated Runnable Test Suite)
        # ---------------------------------------------------------
        tests_py = f'''import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={{"check_same_thread": False}})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "{project_name}"


def test_user_registration_and_login():
    email = "tester@domain.com"
    password = "secretpassword123"
    
    # Register
    reg_res = client.post("/api/auth/register", json={{
        "email": email,
        "full_name": "Senior Test Engineer",
        "password": password
    }})
    assert reg_res.status_code == 201
    token_data = reg_res.json()
    assert "access_token" in token_data
    assert token_data["email"] == email

    # Login
    login_res = client.post("/api/auth/login", json={{
        "email": email,
        "password": password
    }})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_{entity_snake}_crud_operations():
    # 1. Create Record
    create_payload = {{
        "title": "Primary Automated Test Entity",
        "category": "HighPriority",
        "status": "active",
        "priority": "critical",
        "data_payload": {{"test_key": "test_val"}}
    }}
    create_res = client.post("/api/{table_name}", json=create_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    record_id = created["id"]
    assert created["title"] == create_payload["title"]

    # 2. List Records
    list_res = client.get("/api/{table_name}")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(item["id"] == record_id for item in items)

    # 3. Get Details
    get_res = client.get(f"/api/{table_name}/{{record_id}}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == record_id

    # 4. Update
    update_res = client.put(f"/api/{table_name}/{{record_id}}", json={{"status": "completed"}})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "completed"

    # 5. Delete
    del_res = client.delete(f"/api/{table_name}/{{record_id}}")
    assert del_res.status_code == 204
'''
        files.append({
            "path": "backend/tests/test_api.py",
            "filename": "test_api.py",
            "extension": "py",
            "language": "python",
            "file_type": "backend",
            "content": tests_py,
        })

        # ---------------------------------------------------------
        # 12. Backend: requirements.txt & Dockerfile
        # ---------------------------------------------------------
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
bcrypt==4.0.1
python-multipart>=0.0.9
httpx>=0.27.0
pytest>=8.2.0
pytest-asyncio>=0.23.0
email-validator>=2.0.0
''',
        })

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
''',
        })

        # ---------------------------------------------------------
        # 13. Frontend: App.tsx (Interactive, Domain-Specific UI)
        # ---------------------------------------------------------
        raw_frontend_template = '''import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Database,
  Server,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Activity,
  Zap,
} from 'lucide-react';

interface __PRIMARY_ENTITY__Item {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function App() {
  const [records, setRecords] = useState<__PRIMARY_ENTITY__Item[]>([
    {
      id: 'rec-001',
      title: 'Initial __PRIMARY_ENTITY__ Workflow Entry',
      category: 'Production',
      status: 'active',
      priority: 'high',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rec-002',
      title: 'Secondary Automated Domain Record',
      category: 'Compliance',
      status: 'completed',
      priority: 'medium',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Core');
  const [newPriority, setNewPriority] = useState('medium');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch = rec.title.toLowerCase().includes(search.toLowerCase()) ||
                          rec.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRecord: __PRIMARY_ENTITY__Item = {
      id: `rec-${Math.random().toString(36).substring(2, 7)}`,
      title: newTitle.trim(),
      category: newCategory,
      status: 'active',
      priority: newPriority,
      created_at: new Date().toISOString(),
    };

    setRecords([newRecord, ...records]);
    setNewTitle('');
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setRecords(
      records.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'completed' : 'active' } : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0D2818] font-sans antialiased p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-[#0D2818]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D2818] text-[#84CC16] text-xs font-mono font-semibold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              __DOMAIN_UPPER__ DOMAIN CONSOLE
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-[#0D2818]">
              __PROJECT_NAME__
            </h1>
            <p className="text-sm text-[#0D2818]/70 max-w-2xl leading-relaxed">
              __IDEA__
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              REST API Ready
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#0D2818] hover:bg-[#163E2B] text-white text-sm font-medium transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#84CC16]" />
              New __PRIMARY_ENTITY__
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#0D2818]/10 shadow-xs">
            <span className="text-xs uppercase font-mono tracking-wider text-[#0D2818]/60">Total __PRIMARY_ENTITY__ Records</span>
            <div className="text-3xl font-serif font-bold mt-2 text-[#0D2818]">{records.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#0D2818]/10 shadow-xs">
            <span className="text-xs uppercase font-mono tracking-wider text-[#0D2818]/60">Active Operational</span>
            <div className="text-3xl font-serif font-bold mt-2 text-emerald-700">{records.filter(r => r.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#0D2818]/10 shadow-xs">
            <span className="text-xs uppercase font-mono tracking-wider text-[#0D2818]/60">Completed Workflows</span>
            <div className="text-3xl font-serif font-bold mt-2 text-blue-700">{records.filter(r => r.status === 'completed').length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#0D2818]/10 shadow-xs">
            <span className="text-xs uppercase font-mono tracking-wider text-[#0D2818]/60">High Priority Items</span>
            <div className="text-3xl font-serif font-bold mt-2 text-amber-700">{records.filter(r => r.priority === 'high' || r.priority === 'critical').length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#0D2818]/10 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#0D2818]/40 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-[#0D2818]/20 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['all', 'active', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#0D2818] text-white'
                    : 'bg-[#FAF7F2] text-[#0D2818]/70 hover:bg-[#0D2818]/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#0D2818]/10 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#0D2818]/10 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#0D2818] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#84CC16]" />
              __PRIMARY_ENTITY__ Registry
            </h2>
            <span className="text-xs font-mono text-[#0D2818]/60">
              Showing {filteredRecords.length} of {records.length} items
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-[#0D2818]/50 text-sm space-y-2">
              <Activity className="w-8 h-8 mx-auto opacity-40 animate-pulse" />
              <p>No matching __PRIMARY_ENTITY__ records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#0D2818]/10 overflow-x-auto">
              {filteredRecords.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base text-[#0D2818]">
                        {item.title}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#0D2818]/15 font-mono text-[#0D2818]/80">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-[#0D2818]/50 font-mono">
                      ID: {item.id} • Created: {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                        item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {item.status}
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(item.id)}
                      className="p-2 rounded-full hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#0D2818]/10 shadow-xl space-y-6">
            <h3 className="text-2xl font-serif font-bold text-[#0D2818]">Create New __PRIMARY_ENTITY__</h3>
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#0D2818]/70 mb-1">
                  Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter record title..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#0D2818]/20 focus:outline-none focus:ring-2 focus:ring-[#84CC16] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#0D2818]/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#0D2818]/20 focus:outline-none focus:ring-2 focus:ring-[#84CC16] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#0D2818]/70 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#0D2818]/20 focus:outline-none focus:ring-2 focus:ring-[#84CC16] text-sm bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-zinc-200 text-sm font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#0D2818] hover:bg-[#163E2B] text-white text-sm font-medium transition-all shadow-xs cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'''
        frontend_app_tsx = (
            raw_frontend_template
            .replace("__PRIMARY_ENTITY__", primary_entity)
            .replace("__DOMAIN_UPPER__", domain.upper())
            .replace("__PROJECT_NAME__", project_name)
            .replace("__IDEA__", idea)
        )

        files.append({
            "path": "frontend/src/App.tsx",
            "filename": "App.tsx",
            "extension": "tsx",
            "language": "typescript",
            "file_type": "frontend",
            "content": frontend_app_tsx,
        })

        # ---------------------------------------------------------
        # 14. Frontend: services/api.ts
        # ---------------------------------------------------------
        frontend_api_ts = f'''const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface {primary_entity}Payload {{
  title: string;
  category?: string;
  status?: string;
  priority?: string;
  data_payload?: Record<string, any>;
}}

export const api = {{
  async list{table_name.capitalize()}(search?: string, status?: string) {{
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    const res = await fetch(`${{API_BASE_URL}}/{table_name}?${{params.toString()}}`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
  }},

  async create{primary_entity}(payload: {primary_entity}Payload) {{
    const res = await fetch(`${{API_BASE_URL}}/{table_name}`, {{
      method: 'POST',
      headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify(payload),
    }});
    if (!res.ok) throw new Error('Failed to create record');
    return res.json();
  }},

  async delete{primary_entity}(id: string) {{
    const res = await fetch(`${{API_BASE_URL}}/{table_name}/${{id}}`, {{
      method: 'DELETE',
    }});
    if (!res.ok) throw new Error('Failed to delete record');
    return true;
  }},

  async getHealth() {{
    const res = await fetch(`${{API_BASE_URL.replace('/api', '')}}/health`);
    return res.json();
  }},
}};
'''
        files.append({
            "path": "frontend/src/services/api.ts",
            "filename": "api.ts",
            "extension": "ts",
            "language": "typescript",
            "file_type": "frontend",
            "content": frontend_api_ts,
        })

        # ---------------------------------------------------------
        # 15. Root: README.md (Comprehensive Run Guide)
        # ---------------------------------------------------------
        readme_md = f'''# {project_name}

**Domain:** {domain.upper()}  
**Business Idea:** {idea}  
**Architecture:** Layered Decoupled Micro-modular (FastAPI + React 18 + PostgreSQL/SQLite)

---

## 🚀 Quick Start Guide

### 1. Run the Backend API Server

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### 2. Run Automated Pytest Test Suite

```bash
cd backend
pytest
```

### 3. Run the Frontend Client

```bash
cd frontend
npm install
npm run dev
```

- **Client Web UI:** [http://localhost:5173](http://localhost:5173)

---

## 📁 Architecture & File Layout

- `backend/app/main.py` — High-performance FastAPI application with auto-migration lifespan
- `backend/app/models/{entity_snake}.py` — SQLAlchemy ORM schema for domain entities
- `backend/app/schemas/{entity_snake}.py` — Pydantic v2 validation and response models
- `backend/app/api/{table_name}.py` — Full CRUD database endpoints with search and filters
- `backend/tests/test_api.py` — Complete test suite
- `frontend/src/App.tsx` — Interactive domain console with metrics, table filters, and modals
'''
        files.append({
            "path": "README.md",
            "filename": "README.md",
            "extension": "md",
            "language": "markdown",
            "file_type": "documentation",
            "content": readme_md,
        })

        # 16. Root: docker-compose.yml
        docker_compose_yml = f'''version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: {clean_name}_backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: sqlite:///./{clean_name}.db
      SECRET_KEY: super_secure_production_jwt_key_32_chars_long
      CORS_ORIGINS: "http://localhost:5173,http://localhost:3000"

  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    ports:
      - "5173:5173"
    depends_on:
      - backend
'''
        files.append({
            "path": "docker-compose.yml",
            "filename": "docker-compose.yml",
            "extension": "yml",
            "language": "yaml",
            "file_type": "docker",
            "content": docker_compose_yml,
        })

        # 17. Frontend: package.json
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
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0"
  }},
  "devDependencies": {{
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }}
}}
''',
        })

        return files
