"""
Quick test script for the complete pipeline
Run this to verify the YOLO + OCR pipeline is working
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline.service import create_pipeline


def main():
    """Quick pipeline test"""
    print("\n" + "="*60)
    print("YOLO + OCR Pipeline Quick Test")
    print("="*60)
    
    # Initialize pipeline
    print("\n[1/4] Initializing pipeline...")
    pipeline = create_pipeline(
        yolo_url="http://localhost:8000",
        ocr_url="http://localhost:8001",
        conf_threshold=0.5,
        iou_threshold=0.45
    )
    print("✓ Pipeline created")
    
    # Check services
    print("\n[2/4] Checking service availability...")
    status = pipeline.check_services()
    
    print(f"  YOLO API (port 8000): {'✓ Available' if status['yolo'] else '✗ Not available'}")
    print(f"  OCR API  (port 8001): {'✓ Available' if status['ocr'] else '✗ Not available'}")
    
    if not all(status.values()):
        print("\n⚠️  Error: Required services are not running!")
        print("\nPlease start the services:")
        print("  Terminal 1: cd YOLO_inference && uvicorn app.main:app --port 8000")
        print("  Terminal 2: cd OCR_inference && uvicorn app.main:app --port 8001")
        return
    
    print("✓ All services are available")
    
    # Get test image path
    print("\n[3/4] Looking for test image...")
    
    # Try to find a test image
    test_images = [
        "test_image.jpg",
        "OCR_inference/OCR_CNN_Vietnamese/vietnamese/unseen_test_images/im1510.jpg",
        "demo_image.jpg",
        "sample.jpg"
    ]
    
    image_path = None
    for img in test_images:
        if Path(img).exists():
            image_path = img
            break
    
    if not image_path:
        print("✗ No test image found")
        print("\nPlease provide an image path:")
        image_path = input("Image path: ").strip()
        
        if not Path(image_path).exists():
            print(f"✗ Image not found: {image_path}")
            return
    
    print(f"✓ Using image: {image_path}")
    
    # Process image
    print("\n[4/4] Processing image through pipeline...")
    try:
        result = pipeline.process_image(image_path)
        
        print(f"\n{'='*60}")
        print("RESULTS")
        print(f"{'='*60}")
        print(f"Total detections: {result.total_detections}")
        print(f"YOLO detections: {result.yolo_detections}")
        print(f"OCR results: {result.ocr_results}")
        
        if result.detections_with_text:
            print(f"\n{'─'*60}")
            print("DETECTED TEXT:")
            print(f"{'─'*60}")
            
            for i, detection in enumerate(result.detections_with_text, 1):
                print(f"\n[{i}] Class: {detection.class_name}")
                print(f"    BBox: {detection.bbox}")
                print(f"    Confidence: {detection.confidence:.3f}")
                print(f"    Text: '{detection.text}'")
        else:
            print("\n(No text detected)")
        
        print(f"\n{'='*60}")
        print("✓ Pipeline test completed successfully!")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n✗ Error processing image: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
