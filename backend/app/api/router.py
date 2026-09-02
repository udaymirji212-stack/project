from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.requirements import router as requirements_router
from app.api.srs import router as srs_router
from app.api.architecture import router as architecture_router
from app.api.database_design import router as database_router
from app.api.api_design import router as api_design_router
from app.api.code_generation import router as code_gen_router
from app.api.workspace import router as workspace_router
from app.api.reviews import router as reviews_router
from app.api.documentation import router as documentation_router
from app.api.exports import router as exports_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(projects_router)
api_router.include_router(requirements_router)
api_router.include_router(srs_router)
api_router.include_router(architecture_router)
api_router.include_router(database_router)
api_router.include_router(api_design_router)
api_router.include_router(code_gen_router)
api_router.include_router(workspace_router)
api_router.include_router(reviews_router)
api_router.include_router(documentation_router)
api_router.include_router(exports_router)
