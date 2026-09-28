import sys
from pathlib import Path

# Ensure project root is in sys.path so 'services' and root packages can be imported
_PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging, logger
from app.api.routes import health, analyses, testbed


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info(
        f"Starting {settings.app_name} (env={settings.app_env}, sim_mode={settings.simulation_mode})"
    )
    yield
    logger.info(f"Shutting down {settings.app_name}")


app = FastAPI(
    title=settings.app_name,
    description="AI-Powered IPsec VPN Protocol Analyzer and Security Assessment Framework API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check
app.include_router(health.router)

# API v1 Endpoints
app.include_router(analyses.router, prefix=settings.api_prefix)
app.include_router(testbed.router, prefix=settings.api_prefix)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.app_name,
        "version": "0.1.0",
        "status": "online",
        "documentation": "/docs",
        "simulation_mode": settings.simulation_mode,
    }
