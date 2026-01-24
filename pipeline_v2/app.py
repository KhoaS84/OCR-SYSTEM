"""
FastAPI Pipeline Service V2
Combines YOLO detection and VietOCR recognition
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import logging
import requests

from service import PipelineService
from schemas import PipelineResponse, PipelineConfig

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="YOLO + VietOCR Pipeline API",
    description="Complete pipeline for Vietnamese text detection and recognition using YOLO and VietOCR",
    version="2.0.0",
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
    
    # Create pipeline config
    config = PipelineConfig(
        yolo_url="http://localhost:8001",
        ocr_url="http://localhost:8002"
    )
    
    pipeline_service = PipelineService(config)
    logger.info("Pipeline V2 API service started")
    
    # Check if both services are available
    status = pipeline_service.check_services()
    logger.info(f"Service status - YOLO: {status['yolo']}, VietOCR: {status['ocr']}")
    
    if not all(status.values()):
        logger.warning("Some services are not available!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Pipeline V2 API service")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "YOLO + VietOCR Pipeline API",
        "version": "2.0.0",
        "status": "running",
        "description": "Complete pipeline using YOLO for detection and VietOCR for text recognition"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = pipeline_service.check_services()
    return {
        "status": "healthy" if all(status.values()) else "degraded",
        "services": status,
        "yolo": "available" if status["yolo"] else "unavailable",
        "vietocr": "available" if status["ocr"] else "unavailable"
    }


@app.post("/api/v1/process", response_model=PipelineResponse)
async def process_image(
    file: UploadFile = File(..., description="Image file to process"),
    conf_threshold: float = Form(0.5, description="Confidence threshold"),
    iou_threshold: float = Form(0.45, description="IOU threshold for NMS")
):
    """
    Process image through complete pipeline: YOLO detection -> VietOCR recognition
    
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
    
    # Validate parameters
    if not 0.0 <= conf_threshold <= 1.0:
        raise HTTPException(status_code=400, detail="conf_threshold must be between 0.0 and 1.0")
    if not 0.0 <= iou_threshold <= 1.0:
        raise HTTPException(status_code=400, detail="iou_threshold must be between 0.0 and 1.0")
    
    try:
        # Update pipeline config
        pipeline_service.config.conf_threshold = conf_threshold
        pipeline_service.config.iou_threshold = iou_threshold
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Process through pipeline
        result = pipeline_service.process_image_bytes(image_bytes, file.filename)
        
        logger.info(f"Successfully processed {file.filename}: {result.total_detections} detections")
        
        return result
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except requests.exceptions.RequestException as e:
        logger.error(f"Service communication error: {e}")
        raise HTTPException(status_code=503, detail="One or more backend services are unavailable")
    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Pipeline processing error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8003,
        reload=True
    )
