"""
OCR API endpoints
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
import json
import logging

from app.models.ocr_service import ocr_service
from app.schemas.ocr import OCRResponse, OCRResult, SingleOCRResponse
from app.utils.image import load_image_from_bytes, crop_images_batch

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/ocr", response_model=OCRResponse)
async def recognize_text(
    file: UploadFile = File(..., description="Image file"),
    bboxes: str = Form(..., description="JSON string of bounding boxes [[x1,y1,x2,y2],...]"),
    confidences: Optional[str] = Form(None, description="JSON string of confidence scores"),
    conf_threshold: float = Form(0.5, description="Confidence threshold")
):
    """
    Perform OCR on detected regions from an image
    
    Args:
        file: Image file
        bboxes: JSON string of bounding boxes
        confidences: JSON string of confidence scores (optional)
        conf_threshold: Confidence threshold to filter results
        
    Returns:
        OCRResponse with recognized text for each region
    """
    try:
        # Parse bboxes
        bboxes_list = json.loads(bboxes)
        
        # Parse confidences if provided
        confidences_list = None
        if confidences:
            confidences_list = json.loads(confidences)
        
        # Read image
        image_bytes = await file.read()
        image = load_image_from_bytes(image_bytes)
        
        logger.info(f"Processing {len(bboxes_list)} regions for OCR")
        
        # Filter by confidence if provided
        if confidences_list:
            filtered_data = [
                (bbox, conf) 
                for bbox, conf in zip(bboxes_list, confidences_list)
                if conf >= conf_threshold
            ]
            bboxes_list = [item[0] for item in filtered_data]
            confidences_list = [item[1] for item in filtered_data]
        
        if not bboxes_list:
            logger.warning("No bounding boxes passed confidence threshold")
            return OCRResponse(results=[], total_processed=0)
        
        # Crop images
        cropped_images = crop_images_batch(image, bboxes_list)
        
        # Perform OCR on each cropped image
        results = []
        for i, (cropped_img, bbox) in enumerate(zip(cropped_images, bboxes_list)):
            try:
                text = ocr_service.predict(cropped_img)
                
                result = OCRResult(
                    bbox=bbox,
                    text=text,
                    confidence=confidences_list[i] if confidences_list else None
                )
                results.append(result)
                
            except Exception as e:
                logger.error(f"OCR failed for region {i}: {e}")
                # Add empty result for failed OCR
                results.append(OCRResult(
                    bbox=bbox,
                    text="",
                    confidence=confidences_list[i] if confidences_list else None
                ))
        
        logger.info(f"OCR completed for {len(results)} regions")
        
        return OCRResponse(
            results=results,
            total_processed=len(results)
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {e}")
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing error: {str(e)}")


@router.post("/ocr/single", response_model=SingleOCRResponse)
async def recognize_single_image(
    file: UploadFile = File(..., description="Image file")
):
    """
    Perform OCR on a full image
    
    Args:
        file: Image file
        
    Returns:
        SingleOCRResponse with recognized text
    """
    try:
        # Read image
        image_bytes = await file.read()
        image = load_image_from_bytes(image_bytes)
        
        logger.info("Processing single image for OCR")
        
        # Perform OCR
        text = ocr_service.predict(image)
        
        logger.info(f"OCR completed: {text}")
        
        return SingleOCRResponse(
            text=text,
            success=True
        )
        
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing error: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": ocr_service.model_loaded
    }
