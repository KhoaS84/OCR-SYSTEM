"""
Request and Response schemas for OCR API
"""

from pydantic import BaseModel, Field
from typing import List, Tuple, Optional


class BoundingBox(BaseModel):
    """Bounding box coordinates"""
    x1: int = Field(..., description="Top-left x coordinate")
    y1: int = Field(..., description="Top-left y coordinate")
    x2: int = Field(..., description="Bottom-right x coordinate")
    y2: int = Field(..., description="Bottom-right y coordinate")


class OCRRequest(BaseModel):
    """Request model for OCR with bounding boxes"""
    bboxes: List[List[int]] = Field(
        ..., 
        description="List of bounding boxes [[x1, y1, x2, y2], ...]"
    )
    confidences: List[float] = Field(
        ..., 
        description="List of confidence scores for each bbox"
    )
    conf_threshold: Optional[float] = Field(
        0.5, 
        description="Minimum confidence threshold",
        ge=0.0,
        le=1.0
    )

    class Config:
        json_schema_extra = {
            "example": {
                "bboxes": [
                    [770, 308, 1235, 614],
                    [1263, 346, 1692, 597]
                ],
                "confidences": [0.95, 0.92],
                "conf_threshold": 0.5
            }
        }


class OCRResult(BaseModel):
    """Single OCR result"""
    bbox: Tuple[int, int, int, int] = Field(..., description="Bounding box (x1, y1, x2, y2)")
    text: str = Field(..., description="Recognized text")
    confidence: float = Field(..., description="Detection confidence")


class OCRResponse(BaseModel):
    """Response model for OCR"""
    results: List[OCRResult] = Field(..., description="List of OCR results")
    total_detections: int = Field(..., description="Total number of detections processed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "results": [
                    {
                        "bbox": [770, 308, 1235, 614],
                        "text": "QUÁN",
                        "confidence": 0.95
                    },
                    {
                        "bbox": [1263, 346, 1692, 597],
                        "text": "CHAY",
                        "confidence": 0.92
                    }
                ],
                "total_detections": 2
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    device: str
