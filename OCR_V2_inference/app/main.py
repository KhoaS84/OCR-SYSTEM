"""
FastAPI VietOCR Service
Main application entry point for VietOCR API service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ocr
from app.core.config import settings
from app.core.logging import setup_logging
from app.models.ocr_service import ocr_service

# Setup logging
logger = setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="VietOCR API Service for Vietnamese text recognition",
    version=settings.VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ocr.router, prefix=settings.API_V1_STR, tags=["OCR"])


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Device: {settings.DEVICE}")
    
    try:
        # Load VietOCR model
        logger.info("Loading VietOCR model...")
        ocr_service.load_model()
        logger.info("VietOCR model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load VietOCR model: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
