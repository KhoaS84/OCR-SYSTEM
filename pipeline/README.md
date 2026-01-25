# YOLO + OCR Pipeline

Complete pipeline for Vietnamese text detection and recognition, combining YOLO object detection with OCR text recognition.

## Overview

This pipeline integrates two services:
1. **YOLO Detection** - Detects text regions in images
2. **OCR Recognition** - Recognizes Vietnamese text in detected regions

## Architecture

```
Image → YOLO API (detect regions) → OCR API (recognize text) → Combined Results
```

## Features

- **Seamless Integration** - Automatically chains YOLO and OCR services
- **Flexible Usage** - Use as Python library or REST API
- **Configurable** - Adjust confidence and IOU thresholds
- **Health Monitoring** - Check status of dependent services
- **Error Handling** - Graceful degradation and detailed error messages

## Installation

```bash
pip install requests fastapi uvicorn pydantic pydantic-settings
```

## Quick Start

### 1. Start Required Services

**Terminal 1 - YOLO Service:**
```bash
cd YOLO_inference
uvicorn app.main:app --port 8000
```

**Terminal 2 - OCR Service:**
```bash
cd OCR_inference
uvicorn app.main:app --port 8001
```

**Terminal 3 - Pipeline Service (Optional):**
```bash
cd pipeline
python app.py
# Or: uvicorn app:app --port 8002
```

### 2. Use the Pipeline

#### Option A: Python Library

```python
from pipeline.service import create_pipeline

# Create pipeline instance
pipeline = create_pipeline(
    yolo_url="http://localhost:8000",
    ocr_url="http://localhost:8001",
    conf_threshold=0.5
)

# Process image
result = pipeline.process_image("image.jpg")

# Print results
for detection in result.detections_with_text:
    print(f"Class: {detection.class_name}")
    print(f"Text: {detection.text}")
    print(f"Confidence: {detection.confidence}")
    print(f"BBox: {detection.bbox}")
```

#### Option B: REST API

```bash
curl -X POST "http://localhost:8002/api/v1/process" \
  -F "file=@image.jpg" \
  -F "conf_threshold=0.5" \
  -F "iou_threshold=0.45"
```

#### Option C: Python with REST API

```python
import requests

url = "http://localhost:8002/api/v1/process"

with open("image.jpg", "rb") as f:
    files = {"file": f}
    data = {
        "conf_threshold": 0.5,
        "iou_threshold": 0.45
    }
    response = requests.post(url, files=files, data=data)

result = response.json()
print(result)
```

## Example Usage

Run the provided examples:

```bash
# CLI example (direct service calls)
python -m pipeline.example --mode cli

# API example (through pipeline API)
python -m pipeline.example --mode api

# Detailed example (shows both YOLO and OCR separately)
python -m pipeline.example --mode detailed
```

## API Endpoints

### Pipeline API (Port 8002)

#### `GET /health`
Check pipeline and dependent services health

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "yolo": true,
    "ocr": true
  }
}
```

#### `POST /api/v1/process`
Process image through complete pipeline

**Parameters:**
- `file` (form-data): Image file
- `conf_threshold` (form-data): Confidence threshold (default: 0.5)
- `iou_threshold` (form-data): IOU threshold (default: 0.45)

**Response:**
```json
{
  "detections_with_text": [
    {
      "bbox": [770, 308, 1235, 614],
      "confidence": 0.95,
      "class_name": "card",
      "text": "QUÁN"
    },
    {
      "bbox": [1263, 346, 1692, 597],
      "confidence": 0.92,
      "class_name": "card",
      "text": "CHAY"
    }
  ],
  "total_detections": 2,
  "yolo_detections": 2,
  "ocr_results": 2
}
```

## Configuration

### PipelineConfig Options

```python
from pipeline.schemas import PipelineConfig

config = PipelineConfig(
    yolo_url="http://localhost:8000",      # YOLO API URL
    ocr_url="http://localhost:8001",       # OCR API URL
    conf_threshold=0.5,                    # Detection confidence threshold
    iou_threshold=0.45                     # NMS IOU threshold
)
```

## Project Structure

```
pipeline/
├── __init__.py
├── app.py              # FastAPI pipeline service
├── service.py          # Core pipeline logic
├── schemas.py          # Pydantic models
├── example.py          # Usage examples
└── README.md           # This file
```

## Advanced Usage

### Custom Configuration

```python
from pipeline.service import PipelineService
from pipeline.schemas import PipelineConfig

# Create custom config
config = PipelineConfig(
    yolo_url="http://custom-yolo:8000",
    ocr_url="http://custom-ocr:8001",
    conf_threshold=0.7,  # Higher threshold
    iou_threshold=0.3    # Lower IOU
)

# Initialize service
pipeline = PipelineService(config)

# Check service availability
status = pipeline.check_services()
if all(status.values()):
    result = pipeline.process_image("image.jpg")
```

### Error Handling

```python
from pipeline.service import create_pipeline
import logging

logging.basicConfig(level=logging.INFO)

pipeline = create_pipeline()

try:
    # Check services first
    status = pipeline.check_services()
    if not all(status.values()):
        print("Some services are unavailable!")
        print(status)
        exit(1)
    
    # Process image
    result = pipeline.process_image("image.jpg")
    
except FileNotFoundError as e:
    print(f"Image not found: {e}")
except requests.exceptions.ConnectionError as e:
    print(f"Service connection error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### Batch Processing

```python
from pathlib import Path
from pipeline.service import create_pipeline

pipeline = create_pipeline()

# Process multiple images
image_dir = Path("images")
results = {}

for image_path in image_dir.glob("*.jpg"):
    try:
        result = pipeline.process_image(image_path)
        results[image_path.name] = result
        print(f"Processed {image_path.name}: {result.total_detections} detections")
    except Exception as e:
        print(f"Error processing {image_path.name}: {e}")

# Save results
import json
with open("results.json", "w", encoding="utf-8") as f:
    json.dump(
        {k: v.dict() for k, v in results.items()},
        f,
        ensure_ascii=False,
        indent=2
    )
```

## Testing

Test the pipeline with the example script:

```bash
# First, update the image_path in example.py
# Then run:
python -m pipeline.example --mode cli
```

## Troubleshooting

### Services Not Available

**Problem:** `check_services()` returns False

**Solution:**
1. Ensure YOLO service is running on port 8000
2. Ensure OCR service is running on port 8001
3. Check firewall settings
4. Verify URLs in configuration

### Connection Timeout

**Problem:** Request takes too long or times out

**Solution:**
1. Check if services are responding: `curl http://localhost:8000/health`
2. Increase timeout in service.py
3. Check network connectivity

### No Detections

**Problem:** Pipeline returns empty results

**Solution:**
1. Lower `conf_threshold` (try 0.3 or 0.25)
2. Check if YOLO model is loaded correctly
3. Verify image quality and content

### OCR Returns Empty Text

**Problem:** YOLO detects regions but OCR returns empty text

**Solution:**
1. Check OCR model is loaded
2. Verify detected regions contain text
3. Check image preprocessing settings

## Dependencies

- **requests** - HTTP client for API calls
- **fastapi** - Web framework for pipeline API
- **uvicorn** - ASGI server
- **pydantic** - Data validation
- **pydantic-settings** - Configuration management

## Performance Tips

1. **Parallel Processing** - Process multiple images in parallel using threading
2. **Batch Requests** - Group multiple detections if possible
3. **Caching** - Cache results for identical images
4. **Service Optimization** - Optimize individual YOLO and OCR services

## API Documentation

When running the pipeline service, visit:
- **Swagger UI**: http://localhost:8002/docs
- **ReDoc**: http://localhost:8002/redoc

## Integration Examples

### Web Application

```python
from fastapi import FastAPI, UploadFile, File
from pipeline.service import create_pipeline

app = FastAPI()
pipeline = create_pipeline()

@app.post("/detect-text")
async def detect_text(file: UploadFile = File(...)):
    # Save file temporarily
    with open("temp.jpg", "wb") as f:
        f.write(await file.read())
    
    # Process
    result = pipeline.process_image("temp.jpg")
    
    return result.dict()
```

### Desktop Application

```python
import tkinter as tk
from tkinter import filedialog
from pipeline.service import create_pipeline

def process_image():
    filepath = filedialog.askopenfilename()
    if filepath:
        pipeline = create_pipeline()
        result = pipeline.process_image(filepath)
        # Display results...
```

## License

See the main repository for license information.

## Support

For issues or questions:
1. Check if all services are running and healthy
2. Review logs for error messages
3. Verify image format and size
4. Check configuration parameters
