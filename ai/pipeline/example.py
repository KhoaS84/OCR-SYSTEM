"""
Example script demonstrating the YOLO + OCR pipeline usage
"""

from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline.service import create_pipeline
from pipeline.schemas import PipelineConfig


def example_cli():
    """Command-line interface example"""
    print("=" * 70)
    print("YOLO + OCR Pipeline - CLI Example")
    print("=" * 70)
    
    # Create pipeline instance
    print("\n1. Initializing pipeline...")
    pipeline = create_pipeline(
        yolo_url="http://localhost:8000",
        ocr_url="http://localhost:8001",
        conf_threshold=0.5,
        iou_threshold=0.45
    )
    
    # Check services
    print("\n2. Checking service availability...")
    status = pipeline.check_services()
    print(f"   YOLO API: {'✓ Available' if status['yolo'] else '✗ Unavailable'}")
    print(f"   OCR API:  {'✓ Available' if status['ocr'] else '✗ Unavailable'}")
    
    if not all(status.values()):
        print("\n⚠ Warning: Some services are not available!")
        print("   Make sure both YOLO and OCR services are running:")
        print("   - YOLO: uvicorn YOLO_inference.app.main:app --port 8000")
        print("   - OCR:  uvicorn OCR_inference.app.main:app --port 8001")
        return
    
    # Process image
    image_path = "test_image.jpg"  # Replace with your image path
    
    if not Path(image_path).exists():
        print(f"\n⚠ Image not found: {image_path}")
        print("   Please update the image_path variable with a valid image path")
        return
    
    print(f"\n3. Processing image: {image_path}")
    try:
        result = pipeline.process_image(image_path)
        
        print(f"\n4. Results:")
        print(f"   Total detections: {result.total_detections}")
        print(f"   YOLO detections: {result.yolo_detections}")
        print(f"   OCR results: {result.ocr_results}")
        
        if result.detections_with_text:
            print("\n5. Detected text:")
            print("   " + "-" * 66)
            for i, detection in enumerate(result.detections_with_text, 1):
                print(f"   {i}. Class: {detection.class_name}")
                print(f"      BBox: {detection.bbox}")
                print(f"      Confidence: {detection.confidence:.2f}")
                print(f"      Text: '{detection.text}'")
                print("   " + "-" * 66)
        else:
            print("\n   No text detected in the image")
        
        print("\n✓ Processing completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error processing image: {e}")
        import traceback
        traceback.print_exc()


def example_api():
    """API request example using requests library"""
    import requests
    
    print("=" * 70)
    print("YOLO + OCR Pipeline - API Example")
    print("=" * 70)
    
    url = "http://localhost:8002/api/v1/process"
    image_path = "test_image.jpg"  # Replace with your image path
    
    if not Path(image_path).exists():
        print(f"\n⚠ Image not found: {image_path}")
        return
    
    print(f"\n1. Sending request to {url}")
    print(f"   Image: {image_path}")
    
    try:
        with open(image_path, "rb") as f:
            files = {"file": f}
            data = {
                "conf_threshold": 0.5,
                "iou_threshold": 0.45
            }
            
            response = requests.post(url, files=files, data=data)
            response.raise_for_status()
        
        result = response.json()
        
        print(f"\n2. Response received:")
        print(f"   Status: {response.status_code}")
        print(f"   Total detections: {result['total_detections']}")
        
        if result['detections_with_text']:
            print("\n3. Detected text:")
            for i, detection in enumerate(result['detections_with_text'], 1):
                print(f"   {i}. {detection['class_name']}: '{detection['text']}' "
                      f"(conf: {detection['confidence']:.2f})")
        
        print("\n✓ Request completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to pipeline API")
        print("   Make sure the pipeline service is running:")
        print("   python -m pipeline.app")
    except Exception as e:
        print(f"\n✗ Error: {e}")


def example_combined():
    """Example showing both detection and OCR results separately"""
    from pipeline.service import create_pipeline
    
    print("=" * 70)
    print("YOLO + OCR Pipeline - Detailed Example")
    print("=" * 70)
    
    pipeline = create_pipeline()
    image_path = "test_image.jpg"
    
    if not Path(image_path).exists():
        print(f"\n⚠ Image not found: {image_path}")
        return
    
    # Check services
    status = pipeline.check_services()
    if not all(status.values()):
        print("\n⚠ Error: Required services not available")
        return
    
    print(f"\nProcessing: {image_path}\n")
    
    try:
        # Get YOLO detections
        yolo_result = pipeline.detect_with_yolo(image_path)
        print("YOLO Detections:")
        for i, det in enumerate(yolo_result['detections'], 1):
            print(f"  {i}. {det['class_name']} - BBox: {det['bbox']} - "
                  f"Conf: {det['confidence']:.2f}")
        
        # Get complete pipeline result
        result = pipeline.process_image(image_path)
        print(f"\nOCR Recognition:")
        for i, det in enumerate(result.detections_with_text, 1):
            print(f"  {i}. Text: '{det.text}'")
        
        print(f"\nSummary:")
        print(f"  YOLO found {result.yolo_detections} regions")
        print(f"  OCR processed {result.ocr_results} regions")
        print(f"  Total results: {result.total_detections}")
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="YOLO + OCR Pipeline Examples")
    parser.add_argument(
        "--mode",
        choices=["cli", "api", "detailed"],
        default="cli",
        help="Example mode to run"
    )
    
    args = parser.parse_args()
    
    if args.mode == "cli":
        example_cli()
    elif args.mode == "api":
        example_api()
    elif args.mode == "detailed":
        example_combined()
