"""
Simple test script for OCR API
"""

import requests
import json
from pathlib import Path

# Configuration
API_URL = "http://localhost:8001"
IMAGE_PATH = "OCR_CNN_Vietnamese/vietnamese/unseen_test_images/im1510.jpg"

# Example bounding boxes and confidences
BBOXES = [
    [770, 308, 1235, 614],
    [1263, 346, 1692, 597],
    [799, 641, 1691, 991]
]
CONFIDENCES = [0.95, 0.92, 0.88]


def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


def test_ocr_health():
    """Test OCR service health"""
    print("Testing OCR service health...")
    response = requests.get(f"{API_URL}/api/v1/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


def test_ocr():
    """Test OCR endpoint"""
    print("Testing OCR endpoint...")
    
    if not Path(IMAGE_PATH).exists():
        print(f"Error: Image not found at {IMAGE_PATH}")
        return
    
    files = {"file": open(IMAGE_PATH, "rb")}
    data = {
        "bboxes": json.dumps(BBOXES),
        "confidences": json.dumps(CONFIDENCES),
        "conf_threshold": 0.5
    }
    
    response = requests.post(f"{API_URL}/api/v1/ocr", files=files, data=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Total detections: {result['total_detections']}")
        print("\nResults:")
        for i, res in enumerate(result['results'], 1):
            print(f"{i}. BBox: {res['bbox']}")
            print(f"   Text: '{res['text']}'")
            print(f"   Confidence: {res['confidence']:.2f}\n")
    else:
        print(f"Error: {response.text}")


if __name__ == "__main__":
    print("=" * 50)
    print("OCR API Test Script")
    print("=" * 50 + "\n")
    
    try:
        test_health()
        test_ocr_health()
        test_ocr()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Make sure the server is running.")
        print("Start the server with: uvicorn app.main:app --reload --port 8001")
