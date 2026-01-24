"""
Test script for VietOCR API
"""

import requests
from pathlib import Path
import json


def test_single_ocr():
    """Test single image OCR"""
    print("\n=== Testing Single Image OCR ===")
    
    url = "http://localhost:8002/api/v1/ocr/single"
    
    # Replace with your image path
    image_path = "test_image.jpg"
    
    if not Path(image_path).exists():
        print(f"Image not found: {image_path}")
        return
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Text: {result['text']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)


def test_batch_ocr():
    """Test batch OCR with bounding boxes"""
    print("\n=== Testing Batch OCR ===")
    
    url = "http://localhost:8002/api/v1/ocr"
    
    # Replace with your image path
    image_path = "test_image.jpg"
    
    if not Path(image_path).exists():
        print(f"Image not found: {image_path}")
        return
    
    # Example bounding boxes
    bboxes = [
        [100, 100, 300, 150],
        [100, 200, 300, 250],
    ]
    confidences = [0.9, 0.85]
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        data = {
            'bboxes': json.dumps(bboxes),
            'confidences': json.dumps(confidences),
            'conf_threshold': 0.5
        }
        response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Total processed: {result['total_processed']}")
        for i, item in enumerate(result['results']):
            print(f"\nRegion {i+1}:")
            print(f"  BBox: {item['bbox']}")
            print(f"  Text: {item['text']}")
            print(f"  Confidence: {item['confidence']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)


def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    
    url = "http://localhost:8002/api/v1/health"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Status: {result['status']}")
        print(f"Model loaded: {result['model_loaded']}")
    else:
        print(f"Error: {response.status_code}")


if __name__ == "__main__":
    print("VietOCR API Test Script")
    print("Make sure the API is running on http://localhost:8002")
    
    # Test health first
    test_health()
    
    # Test single image OCR
    # test_single_ocr()
    
    # Test batch OCR
    # test_batch_ocr()
    
    print("\n=== Tests Complete ===")
