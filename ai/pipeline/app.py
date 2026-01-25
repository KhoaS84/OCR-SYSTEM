"""
FastAPI Pipeline Service
Combines YOLO detection and OCR recognition
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from pathlib import Path
import logging
import requests

from pipeline.service import PipelineService
from pipeline.schemas import PipelineResponse, PipelineConfig

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="YOLO + OCR Pipeline API",
    description="Complete pipeline for Vietnamese text detection and recognition",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pipeline service
pipeline_service = None


@app.on_event("startup")
async def startup_event():
    """Initialize pipeline service on startup"""
    global pipeline_service
    pipeline_service = PipelineService()
    logger.info("Pipeline API service started")
    
    # Check if both services are available
    status = pipeline_service.check_services()
    logger.info(f"Service status - YOLO: {status['yolo']}, OCR: {status['ocr']}")
    
    if not all(status.values()):
        logger.warning("Some services are not available!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Pipeline API service")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "YOLO + OCR Pipeline API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = pipeline_service.check_services()
    return {
        "status": "healthy" if all(status.values()) else "degraded",
        "services": status
    }


@app.post("/api/v1/process", response_model=PipelineResponse)
async def process_image(
    file: UploadFile = File(..., description="Image file to process"),
    conf_threshold: float = Form(0.5, description="Confidence threshold"),
    iou_threshold: float = Form(0.45, description="IOU threshold for NMS")
):
    """
    Process image through complete pipeline: YOLO detection -> OCR recognition
    
    Args:
        file: Image file (JPEG/PNG)
        conf_threshold: Confidence threshold (0.0 - 1.0)
        iou_threshold: IOU threshold for NMS (0.0 - 1.0)
    
    Returns:
        PipelineResponse with detections and recognized text
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {allowed_types}"
        )
    
    # Read file content
    contents = await file.read()
    
    # Validate file size (10MB max)
    max_size = 10 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {max_size} bytes"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
        tmp_file.write(contents)
        tmp_path = tmp_file.name
    
    try:
        # Update pipeline config
        pipeline_service.config.conf_threshold = conf_threshold
        pipeline_service.config.iou_threshold = iou_threshold
        
        # Process image through pipeline
        result = pipeline_service.process_image(tmp_path)
        
        return result
    
    except requests.exceptions.ConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to backend services: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )
    finally:
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
