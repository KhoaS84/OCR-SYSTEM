"""
OCR API endpoints
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List
import json
import tempfile
from pathlib import Path

from app.schemas.ocr import OCRRequest, OCRResponse, OCRResult, HealthResponse
from app.models.ocr_service import get_ocr_service
from app.core.config import settings
from app.utils.image import validate_image_size

router = APIRouter()


@router.post("/ocr", response_model=OCRResponse)
async def ocr_with_bboxes(
    file: UploadFile = File(..., description="Image file to process"),
    bboxes: str = Form(..., description="JSON string of bounding boxes [[x1,y1,x2,y2],...]"),
    confidences: str = Form(..., description="JSON string of confidence scores [0.9, 0.8,...]"),
    conf_threshold: float = Form(0.5, description="Confidence threshold")
):
    """
    Perform OCR on regions defined by bounding boxes
    
    Args:
        file: Image file (JPEG/PNG)
        bboxes: List of bounding boxes as JSON string
        confidences: List of confidence scores as JSON string
        conf_threshold: Minimum confidence threshold (0.0 - 1.0)
    
    Returns:
        OCRResponse with detected text for each bounding box
    """
    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
        )
    
    # Read file content
    contents = await file.read()
    
    # Validate file size
    if not validate_image_size(len(contents), settings.MAX_IMAGE_SIZE):
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE} bytes"
        )
    
    # Parse bboxes and confidences
    try:
        bboxes_list = json.loads(bboxes)
        confidences_list = json.loads(confidences)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid JSON format: {str(e)}"
        )
    
    # Validate inputs
    if len(bboxes_list) != len(confidences_list):
        raise HTTPException(
            status_code=400,
            detail="Number of bboxes must match number of confidences"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
        tmp_file.write(contents)
        tmp_path = tmp_file.name
    
    try:
        # Get OCR service
        ocr_service = get_ocr_service()
        
        # Process image
        results = ocr_service.process_image(
            tmp_path,
            bboxes_list,
            confidences_list,
            conf_threshold
        )
        
        # Format response
        ocr_results = [
            OCRResult(
                bbox=bbox,
                text=text,
                confidence=conf
            )
            for bbox, text, conf in results
        ]
        
        return OCRResponse(
            results=ocr_results,
            total_detections=len(ocr_results)
        )
    
    finally:
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Check OCR service health
    
    Returns:
        Health status and model information
    """
    try:
        ocr_service = get_ocr_service()
        return HealthResponse(
            status="healthy",
            model_loaded=ocr_service.model_loaded,
            device=settings.DEVICE
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )
