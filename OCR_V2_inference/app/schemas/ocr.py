"""
OCR API Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class OCRRequest(BaseModel):
    """OCR request for multiple bounding boxes"""
    bboxes: List[List[float]] = Field(..., description="List of bounding boxes [x1, y1, x2, y2]")
    confidences: Optional[List[float]] = Field(None, description="Detection confidences")
    conf_threshold: float = Field(0.5, description="Confidence threshold")


class OCRResult(BaseModel):
    """Single OCR result"""
    bbox: List[float] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    text: str = Field(..., description="Recognized text")
    confidence: Optional[float] = Field(None, description="Detection confidence")


class OCRResponse(BaseModel):
    """OCR response with multiple results"""
    results: List[OCRResult]
    total_processed: int
    

class SingleOCRResponse(BaseModel):
    """Single image OCR response"""
    text: str = Field(..., description="Recognized text")
    success: bool = Field(..., description="Whether OCR was successful")
