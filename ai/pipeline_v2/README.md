# Pipeline V2 - YOLO + VietOCR Integration

Complete pipeline that combines YOLO object detection with VietOCR text recognition for Vietnamese text.

## Architecture

```
Image Input
    ↓
YOLO Detection (Port 8001)
    ↓ (bounding boxes)
VietOCR Recognition (Port 8002)
    ↓
Combined Results
```

## Services

1. **YOLO Inference** (Port 8001): Detects text regions in images
2. **VietOCR Inference** (Port 8002): Recognizes Vietnamese text in detected regions
3. **Pipeline API** (Port 8003): Orchestrates both services

## Installation

1. Install pipeline dependencies:
```bash
cd pipeline_v2
pip install -r requirements.txt
```

2. Install YOLO service:
```bash
cd ../YOLO_inference
pip install -r requirements.txt
```

3. Install VietOCR service:
```bash
cd ../OCR_V2_inference
pip install -r requirements.txt
```

## Running the Services

Start all three services in separate terminals:

### 1. Start YOLO Service
```bash
cd YOLO_inference
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 2. Start VietOCR Service
```bash
cd OCR_V2_inference
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
```

### 3. Start Pipeline Service
```bash
cd pipeline_v2
python -m uvicorn app:app --host 0.0.0.0 --port 8003
```

## API Usage

### Process Image
`POST /api/v1/process`

**Parameters:**
- `file`: Image file (multipart/form-data)
- `conf_threshold`: Confidence threshold (default: 0.5)
- `iou_threshold`: IOU threshold for NMS (default: 0.45)

**Example (Python):**
```python
import requests

url = "http://localhost:8003/api/v1/process"

with open("image.jpg", "rb") as f:
    files = {"file": f}
    data = {
        "conf_threshold": 0.5,
        "iou_threshold": 0.45
    }
    
    response = requests.post(url, files=files, data=data)
    result = response.json()
    
    for detection in result["detections_with_text"]:
        print(f"Text: {detection['text']}")
        print(f"BBox: {detection['bbox']}")
        print(f"Confidence: {detection['confidence']}")
```

**Example (cURL):**
```bash
curl -X POST "http://localhost:8003/api/v1/process" \
  -F "file=@image.jpg" \
  -F "conf_threshold=0.5" \
  -F "iou_threshold=0.45"
```

### Health Check
`GET /health`

Check if all services are running.

## Response Format

```json
{
  "detections_with_text": [
    {
      "bbox": [100, 100, 200, 150],
      "confidence": 0.95,
      "class_name": "text",
      "text": "Nhận diện văn bản"
    }
  ],
  "total_detections": 1,
  "yolo_detections": 1,
  "ocr_results": 1,
  "processing_time": 1.23
}
```

## Testing

### Test with Script
```bash
python test_pipeline.py
```

### Test with Example
```bash
python example.py
```

## Configuration

Edit service URLs in [pipeline_v2/app.py](pipeline_v2/app.py):
```python
config = PipelineConfig(
    yolo_url="http://localhost:8001",
    ocr_url="http://localhost:8002",
    conf_threshold=0.5,
    iou_threshold=0.45
)
```

## Troubleshooting

### Services Not Available
Check if all three services are running:
```bash
# Check YOLO
curl http://localhost:8001/health

# Check VietOCR
curl http://localhost:8002/api/v1/health

# Check Pipeline
curl http://localhost:8003/health
```

### GPU Memory Issues
- Reduce batch size
- Use CPU for one service: Set `DEVICE=cpu` in `.env`
- Use different GPU for each service: `DEVICE=cuda:0` and `DEVICE=cuda:1`

## Service Ports

- YOLO Inference: 8001
- VietOCR Inference: 8002
- Pipeline API: 8003

Make sure these ports are not in use by other applications.

## License

MIT
