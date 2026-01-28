"""
FastAPI OCR Service
Main application entry point for OCR API service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ocr
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.setup import setup_ocr_environment, check_ocr_requirements

# Setup logging
logger = setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OCR API Service for Vietnamese text recognition",
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
app.include_router(ocr.router, prefix="/api/v1", tags=["OCR"])


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Device: {settings.DEVICE}")
    
    # Check OCR requirements
    logger.info("Checking OCR environment...")
    status = check_ocr_requirements()
    
    if not status["ready"]:
        logger.warning("OCR environment not ready. Starting automatic setup...")
        logger.info(f"Repository exists: {status['repository_exists']}")
        logger.info(f"Model exists: {status['model_exists']}")
        
        # Attempt automatic setup
        if settings.AUTO_SETUP:
            logger.info("Auto-setup is enabled. Setting up OCR environment...")
            success = setup_ocr_environment()
            
            if success:
                logger.info("✓ OCR environment setup completed successfully")
            else:
                logger.error("✗ Auto-setup failed. Please set up manually:")
                logger.error("  1. Clone: git clone https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git")
                logger.error("  2. Download model: gdown https://drive.google.com/uc?id=1iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG")
                logger.error("  3. Move model to OCR_CNN_Vietnamese/best_ocr_model.pth")
        else:
            logger.warning("Auto-setup is disabled. Manual setup required:")
            logger.warning(f"  Repository path: {status['repository_path']}")
            logger.warning(f"  Model path: {status['model_path']}")
    else:
        logger.info("✓ OCR environment is ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down OCR API service")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "OCR API Service",
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
