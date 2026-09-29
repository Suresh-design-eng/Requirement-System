from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.api.routes.health import router as health_router
from app.core.config import settings


def create_app() -> FastAPI:
  app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for a Recruitment and Hiring Management Platform.",
  )

  app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.include_router(health_router)
  app.include_router(api_router, prefix=settings.api_v1_prefix)

  return app


app = create_app()
