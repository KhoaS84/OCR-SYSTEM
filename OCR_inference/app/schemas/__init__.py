"""
Schemas package initialization
"""

from .ocr import OCRRequest, OCRResponse, OCRResult, HealthResponse, BoundingBox

__all__ = ["OCRRequest", "OCRResponse", "OCRResult", "HealthResponse", "BoundingBox"]
