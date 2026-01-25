"""
Example usage of Pipeline V2 Service
"""

from pathlib import Path
from service import PipelineService
from schemas import PipelineConfig


def main():
    """Example pipeline usage"""
    
    # Create pipeline configuration
    config = PipelineConfig(
        yolo_url="http://localhost:8001",
        ocr_url="http://localhost:8002",
        conf_threshold=0.5,
        iou_threshold=0.45
    )
    
    # Initialize pipeline service
    pipeline = PipelineService(config)
    
    # Check services
    print("Checking services...")
    status = pipeline.check_services()
    print(f"YOLO: {'✓' if status['yolo'] else '✗'}")
    print(f"VietOCR: {'✓' if status['ocr'] else '✗'}")
    
    if not all(status.values()):
        print("\n⚠️  Some services are not available. Please start them first.")
        print("YOLO: python -m uvicorn YOLO_inference.app.main:app --port 8001")
        print("VietOCR: python -m uvicorn OCR_V2_inference.app.main:app --port 8002")
        return
    
    # Process an image
    image_path = "test_image.jpg"
    
    if not Path(image_path).exists():
        print(f"\n⚠️  Test image not found: {image_path}")
        print("Please provide a test image.")
        return
    
    print(f"\nProcessing image: {image_path}")
    result = pipeline.process_image(image_path)
    
    # Display results
    print(f"\n{'='*60}")
    print(f"Pipeline Results")
    print(f"{'='*60}")
    print(f"Total detections: {result.total_detections}")
    print(f"YOLO detections: {result.yolo_detections}")
    print(f"OCR results: {result.ocr_results}")
    print(f"Processing time: {result.processing_time:.2f}s")
    
    print(f"\n{'='*60}")
    print(f"Detected Text:")
    print(f"{'='*60}")
    
    for i, detection in enumerate(result.detections_with_text, 1):
        print(f"\n[{i}] {detection.class_name} (confidence: {detection.confidence:.2f})")
        print(f"    BBox: {detection.bbox}")
        print(f"    Text: {detection.text}")


if __name__ == "__main__":
    main()
