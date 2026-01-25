"""
Test script for Pipeline V2 API
"""

import requests
from pathlib import Path
import json


def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    
    url = "http://localhost:8003/health"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Status: {result['status']}")
            print(f"YOLO: {result['yolo']}")
            print(f"VietOCR: {result['vietocr']}")
            return result['status'] == 'healthy'
        else:
            print(f"Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_pipeline(image_path: str):
    """Test complete pipeline"""
    print("\n=== Testing Complete Pipeline ===")
    
    url = "http://localhost:8003/api/v1/process"
    
    if not Path(image_path).exists():
        print(f"Image not found: {image_path}")
        return
    
    # Determine content type from file extension
    file_ext = Path(image_path).suffix.lower()
    content_type_map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    }
    content_type = content_type_map.get(file_ext, 'image/jpeg')
    
    with open(image_path, 'rb') as f:
        files = {'file': (Path(image_path).name, f, content_type)}
        data = {
            'conf_threshold': 0.5,
            'iou_threshold': 0.45
        }
        
        try:
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"\nTotal detections: {result['total_detections']}")
                print(f"YOLO detections: {result['yolo_detections']}")
                print(f"OCR results: {result['ocr_results']}")
                print(f"Processing time: {result['processing_time']:.2f}s")
                
                print(f"\n{'='*60}")
                print("Detected Text:")
                print(f"{'='*60}")
                
                for i, detection in enumerate(result['detections_with_text'], 1):
                    print(f"\n[{i}] {detection['class_name']} (confidence: {detection['confidence']:.2f})")
                    print(f"    BBox: {detection['bbox']}")
                    print(f"    Text: {detection['text']}")
                    
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    print("Pipeline V2 API Test Script")
    print("=" * 60)
    
    # Check if services are healthy
    if test_health():
        print("\n✓ All services are healthy")
        
        # Test with an image
        image_path = "test_image.png"
        
        # Check if image exists
        if Path(image_path).exists():
            print(f"\n✓ Found image: {image_path}")
            print("Running pipeline test...")
            test_pipeline(image_path)
        else:
            print(f"\n⚠️  No test image found: {image_path}")
            print("\nTo test with an image:")
            print(f"1. Place an image in: {Path.cwd()}")
            print(f"2. Name it 'test_image.jpg' (or update the path in this script)")
            print("3. Run this script again")
            print("\nOr specify a custom path:")
            print("   test_pipeline('path/to/your/image.jpg')")
        
    else:
        print("\n✗ Services are not healthy")
        print("\nMake sure all services are running:")
        print("1. YOLO: python -m uvicorn app.main:app --port 8001")
        print("2. VietOCR: python -m uvicorn app.main:app --port 8002")
        print("3. Pipeline: python -m uvicorn app:app --port 8003")
    
    print("\n" + "=" * 60)
