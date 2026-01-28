"""
Pipeline service for YOLO detection + OCR recognition
"""

import requests
import json
from pathlib import Path
from typing import Union, Optional, Dict, Any
import logging

from pipeline.schemas import PipelineResponse, DetectionWithText, PipelineConfig

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PipelineService:
    """Service to orchestrate YOLO detection and OCR recognition"""
    
    def __init__(self, config: Optional[PipelineConfig] = None):
        """
        Initialize pipeline service
        
        Args:
            config: Pipeline configuration (uses defaults if not provided)
        """
        self.config = config or PipelineConfig()
        logger.info(f"Pipeline initialized with YOLO: {self.config.yolo_url}, OCR: {self.config.ocr_url}")
    
    def check_services(self) -> Dict[str, bool]:
        """
        Check if both YOLO and OCR services are available
        
        Returns:
            Dictionary with service availability status
        """
        status = {"yolo": False, "ocr": False}
        
        try:
            response = requests.get(f"{self.config.yolo_url}/health", timeout=5)
            status["yolo"] = response.status_code == 200
        except Exception as e:
            logger.warning(f"YOLO service unavailable: {e}")
        
        try:
            response = requests.get(f"{self.config.ocr_url}/health", timeout=5)
            status["ocr"] = response.status_code == 200
        except Exception as e:
            logger.warning(f"OCR service unavailable: {e}")
        
        return status
    
    def detect_with_yolo(self, image_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Perform object detection using YOLO API
        
        Args:
            image_path: Path to the image file
        
        Returns:
            YOLO detection response
        """
        url = f"{self.config.yolo_url}/api/v1/detect"
        
        with open(image_path, "rb") as f:
            files = {"file": f}
            data = {
                "conf_threshold": self.config.conf_threshold,
                "iou_threshold": self.config.iou_threshold
            }
            
            response = requests.post(url, files=files, data=data)
            response.raise_for_status()
            
        return response.json()
    
    def recognize_with_ocr(
        self, 
        image_path: Union[str, Path],
        bboxes: list,
        confidences: list
    ) -> Dict[str, Any]:
        """
        Perform OCR on detected regions
        
        Args:
            image_path: Path to the image file
            bboxes: List of bounding boxes from YOLO
            confidences: List of confidence scores from YOLO
        
        Returns:
            OCR recognition response
        """
        url = f"{self.config.ocr_url}/api/v1/ocr"
        
        with open(image_path, "rb") as f:
            files = {"file": f}
            data = {
                "bboxes": json.dumps(bboxes),
                "confidences": json.dumps(confidences),
                "conf_threshold": self.config.conf_threshold
            }
            
            response = requests.post(url, files=files, data=data)
            response.raise_for_status()
            
        return response.json()
    
    def process_image(self, image_path: Union[str, Path]) -> PipelineResponse:
        """
        Process image through complete pipeline: YOLO detection -> OCR recognition
        
        Args:
            image_path: Path to the image file
        
        Returns:
            PipelineResponse with combined results
        """
        image_path = Path(image_path)
        
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        logger.info(f"Processing image: {image_path}")
        
        # Step 1: YOLO detection
        logger.info("Step 1: Running YOLO detection...")
        yolo_response = self.detect_with_yolo(image_path)
        yolo_detections = yolo_response.get("detections", [])
        
        if not yolo_detections:
            logger.warning("No detections found by YOLO")
            return PipelineResponse(
                detections_with_text=[],
                total_detections=0,
                yolo_detections=0,
                ocr_results=0
            )
        
        logger.info(f"YOLO found {len(yolo_detections)} detections")
        
        # Step 2: Extract bboxes and confidences for OCR
        bboxes = [det["bbox"] for det in yolo_detections]
        confidences = [det["confidence"] for det in yolo_detections]
        class_names = [det["class_name"] for det in yolo_detections]
        
        # Step 3: OCR recognition
        logger.info("Step 2: Running OCR on detected regions...")
        ocr_response = self.recognize_with_ocr(image_path, bboxes, confidences)
        ocr_results = ocr_response.get("results", [])
        
        logger.info(f"OCR processed {len(ocr_results)} regions")
        
        # Step 4: Combine results
        combined_results = []
        ocr_dict = {tuple(res["bbox"]): res for res in ocr_results}
        
        for i, detection in enumerate(yolo_detections):
            bbox_tuple = tuple(detection["bbox"])
            ocr_data = ocr_dict.get(bbox_tuple, {})
            
            combined_results.append(
                DetectionWithText(
                    bbox=detection["bbox"],
                    confidence=detection["confidence"],
                    class_name=class_names[i],
                    text=ocr_data.get("text", "")
                )
            )
        
        response = PipelineResponse(
            detections_with_text=combined_results,
            total_detections=len(combined_results),
            yolo_detections=len(yolo_detections),
            ocr_results=len(ocr_results)
        )
        
        logger.info("Pipeline processing completed successfully")
        return response


def create_pipeline(
    yolo_url: str = "http://localhost:8000",
    ocr_url: str = "http://localhost:8001",
    conf_threshold: float = 0.5,
    iou_threshold: float = 0.45
) -> PipelineService:
    """
    Create a pipeline service instance
    
    Args:
        yolo_url: YOLO API base URL
        ocr_url: OCR API base URL
        conf_threshold: Confidence threshold
        iou_threshold: IOU threshold for NMS
    
    Returns:
        PipelineService instance
    """
    config = PipelineConfig(
        yolo_url=yolo_url,
        ocr_url=ocr_url,
        conf_threshold=conf_threshold,
        iou_threshold=iou_threshold
    )
    return PipelineService(config)
