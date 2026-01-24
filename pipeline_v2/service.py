"""
Pipeline service for YOLO detection + VietOCR recognition
"""

import requests
import json
from pathlib import Path
from typing import Union, Optional, Dict, Any
import logging
import time

from schemas import PipelineResponse, DetectionWithText, PipelineConfig

logger = logging.getLogger(__name__)


class PipelineService:
    """Service to orchestrate YOLO detection and VietOCR recognition"""
    
    def __init__(self, config: Optional[PipelineConfig] = None):
        """
        Initialize pipeline service
        
        Args:
            config: Pipeline configuration (uses defaults if not provided)
        """
        self.config = config or PipelineConfig()
        logger.info(f"Pipeline V2 initialized with YOLO: {self.config.yolo_url}, OCR: {self.config.ocr_url}")
    
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
            response = requests.get(f"{self.config.ocr_url}/api/v1/health", timeout=5)
            status["ocr"] = response.status_code == 200
        except Exception as e:
            logger.warning(f"VietOCR service unavailable: {e}")
        
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
        Perform OCR on detected regions using VietOCR
        
        Args:
            image_path: Path to the image file
            bboxes: List of bounding boxes from YOLO
            confidences: List of confidence scores from YOLO
        
        Returns:
            VietOCR recognition response
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
        Process image through complete pipeline: YOLO detection -> VietOCR recognition
        
        Args:
            image_path: Path to the image file
        
        Returns:
            PipelineResponse with combined results
        """
        start_time = time.time()
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
                ocr_results=0,
                processing_time=time.time() - start_time
            )
        
        logger.info(f"YOLO found {len(yolo_detections)} detections")
        
        # Step 2: Extract data for OCR
        bboxes = [det["bbox"] for det in yolo_detections]
        confidences = [det["confidence"] for det in yolo_detections]
        class_names = [det["class_name"] for det in yolo_detections]
        
        # Step 3: VietOCR recognition
        logger.info("Step 2: Running VietOCR on detected regions...")
        ocr_response = self.recognize_with_ocr(image_path, bboxes, confidences)
        ocr_results = ocr_response.get("results", [])
        
        logger.info(f"VietOCR processed {len(ocr_results)} regions")
        
        # Step 4: Combine results
        detections_with_text = []
        for i, ocr_result in enumerate(ocr_results):
            detection_with_text = DetectionWithText(
                bbox=ocr_result["bbox"],
                confidence=ocr_result.get("confidence", confidences[i]),
                class_name=class_names[i] if i < len(class_names) else "text",
                text=ocr_result["text"]
            )
            detections_with_text.append(detection_with_text)
        
        processing_time = time.time() - start_time
        logger.info(f"Pipeline completed in {processing_time:.2f}s")
        
        return PipelineResponse(
            detections_with_text=detections_with_text,
            total_detections=len(detections_with_text),
            yolo_detections=len(yolo_detections),
            ocr_results=len(ocr_results),
            processing_time=processing_time
        )
    
    def process_image_bytes(self, image_bytes: bytes, filename: str = "image.jpg") -> PipelineResponse:
        """
        Process image from bytes through complete pipeline
        
        Args:
            image_bytes: Image data as bytes
            filename: Temporary filename to use
        
        Returns:
            PipelineResponse with combined results
        """
        import tempfile
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as tmp_file:
            tmp_file.write(image_bytes)
            tmp_path = tmp_file.name
        
        try:
            # Process the temporary file
            result = self.process_image(tmp_path)
            return result
        finally:
            # Clean up
            Path(tmp_path).unlink(missing_ok=True)
