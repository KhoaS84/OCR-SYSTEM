"""
Pipeline schemas for YOLO + VietOCR integration
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class PipelineConfig(BaseModel):
    """Pipeline configuration"""
    yolo_url: str = Field(default="http://localhost:8001", description="YOLO service URL")
    ocr_url: str = Field(default="http://localhost:8002", description="VietOCR service URL")
    conf_threshold: float = Field(default=0.5, description="Confidence threshold")
    iou_threshold: float = Field(default=0.45, description="IOU threshold for NMS")


class DetectionWithText(BaseModel):
    """Single detection with recognized text"""
    bbox: List[float] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    confidence: float = Field(..., description="Detection confidence")
    class_name: str = Field(..., description="Class name from YOLO")
    text: str = Field(..., description="Recognized text from OCR")


class PipelineResponse(BaseModel):
    """Complete pipeline response"""
    detections_with_text: List[DetectionWithText]
    total_detections: int
    yolo_detections: int
    ocr_results: int
    processing_time: Optional[float] = None
