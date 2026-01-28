"""
Schemas for the YOLO + OCR pipeline
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class DetectionWithText(BaseModel):
    """Combined detection and OCR result"""
    bbox: List[int] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    confidence: float = Field(..., description="Detection confidence score")
    class_name: str = Field(..., description="Detected class name")
    text: str = Field(..., description="Recognized text from OCR")


class PipelineResponse(BaseModel):
    """Response from the complete pipeline"""
    detections_with_text: List[DetectionWithText] = Field(
        ..., 
        description="List of detections with recognized text"
    )
    total_detections: int = Field(..., description="Total number of detections")
    yolo_detections: int = Field(..., description="Number of YOLO detections")
    ocr_results: int = Field(..., description="Number of successful OCR results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detections_with_text": [
                    {
                        "bbox": [770, 308, 1235, 614],
                        "confidence": 0.95,
                        "class_name": "card",
                        "text": "QUÁN"
                    },
                    {
                        "bbox": [1263, 346, 1692, 597],
                        "confidence": 0.92,
                        "class_name": "card",
                        "text": "CHAY"
                    }
                ],
                "total_detections": 2,
                "yolo_detections": 2,
                "ocr_results": 2
            }
        }


class PipelineConfig(BaseModel):
    """Configuration for pipeline processing"""
    yolo_url: str = Field(
        default="http://localhost:8000",
        description="YOLO API base URL"
    )
    ocr_url: str = Field(
        default="http://localhost:8001",
        description="OCR API base URL"
    )
    conf_threshold: float = Field(
        default=0.3,
        description="Confidence threshold for detections",
        ge=0.0,
        le=1.0
    )
    iou_threshold: float = Field(
        default=0.45,
        description="IOU threshold for YOLO NMS",
        ge=0.0,
        le=1.0
    )
