"""Main FastAPI application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection, get_database
from app.api import auth, couples, arguments, perspectives, ai_mediation, checkins, goals, subscriptions, users
from app.core.logging_config import logger
from app.core.sentry_config import init_sentry
from app.core.limiter import limiter

# Initialize Sentry before app creation
init_sentry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events: startup and shutdown."""
    # Startup
    logger.info("Starting Heka API...")
    await connect_to_mongo()
    logger.info("Heka API started successfully")
    yield
    # Shutdown
    logger.info("Shutting down Heka API...")
    await close_mongo_connection()
    logger.info("Heka API shut down")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/docs",  # Explicitly enable Swagger UI
    redoc_url="/redoc",  # Explicitly enable ReDoc
    openapi_url="/openapi.json",  # Explicitly enable OpenAPI schema
)

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Heka API",
        "version": settings.VERSION,
        "status": "running",
        "database": "MongoDB"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    Returns detailed health status.
    """
    health_status = {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": None,
        "checks": {
            "database": "unknown",
            "api": "ok"
        }
    }
    
    from datetime import datetime
    health_status["timestamp"] = datetime.utcnow().isoformat()
    
    # Check database connection
    db = get_database()
    if db is None:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = "not_connected"
        return health_status
    
    try:
        # Ping MongoDB
        await db.client.admin.command('ping')
        health_status["checks"]["database"] = "connected"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"error: {str(e)}"
    
    return health_status


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(couples.router)
app.include_router(arguments.router)
app.include_router(perspectives.router)
app.include_router(ai_mediation.router)
app.include_router(checkins.router)
app.include_router(goals.router)
app.include_router(subscriptions.router)

