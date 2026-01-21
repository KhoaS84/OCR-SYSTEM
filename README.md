# OCR Detection System

Complete system for Vietnamese text detection and recognition using YOLO object detection and CNN-Transformer OCR.

## System Overview

This project contains three integrated services:

1. **YOLO Detection API** (`YOLO_inference/`) - Detects text regions in images
2. **OCR Recognition API** (`OCR_inference/`) - Recognizes Vietnamese text
3. **Pipeline Service** (`pipeline/`) - Combines both services for end-to-end processing

## Architecture

```
┌─────────────┐
│   Image     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   YOLO Detection    │  Port 8000
│  (Text Regions)     │
└──────┬──────────────┘
       │ bboxes & confidences
       ▼
┌─────────────────────┐
│  OCR Recognition    │  Port 8001
│  (Text Content)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Combined Results   │
│ (Regions + Text)    │
└─────────────────────┘
```

## Quick Start

### Prerequisites

- Python 3.8+
- CUDA-capable GPU (optional, for faster inference)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KhoaS84/OCR-SYSTEM.git
   cd OCR-SYSTEM
   ```

2. **Setup YOLO service:**
   ```bash
   cd YOLO_inference
   pip install -r requirements.txt
   # Place your YOLO model in weights/Model_YOLO11s_card.pt
   ```

3. **Setup OCR service (Automatic):**
   ```bash
   cd ../OCR_inference
   pip install -r requirements.txt
   # Repository and model will be auto-downloaded on first run!
   ```
   
   Or use manual setup:
   ```bash
   cd ../OCR_inference
   git clone https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git
   pip install -r requirements.txt
   
   # Download OCR model
   pip install gdown
   gdown https://drive.google.com/uc?id=1iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG
   mv best_ocr_model.pth OCR_CNN_Vietnamese/
   ```

4. **Setup Pipeline service:**
   ```bash
   cd ../pipeline
   pip install -r requirements.txt
   ```

> **Note:** OCR service now features **automatic setup**! On first startup, it will automatically clone the repository and download the model. See [OCR_inference/AUTO_SETUP.md](OCR_inference/AUTO_SETUP.md) for details.

### Running the System

Open three terminals:

**Terminal 1 - YOLO Service:**
```bash
cd YOLO_inference
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - OCR Service:**
```bash
cd OCR_inference
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

**Terminal 3 - Pipeline Service (Optional):**
```bash
cd pipeline
python app.py
# Or: uvicorn app:app --host 0.0.0.0 --port 8002
```

## Usage

### Option 1: Complete Pipeline (Recommended)

Process images through the entire detection + recognition pipeline:

```python
from pipeline.service import create_pipeline

# Create pipeline
pipeline = create_pipeline()

# Process image
result = pipeline.process_image("image.jpg")

# Results
for detection in result.detections_with_text:
    print(f"Detected: '{detection.text}' at {detection.bbox}")
```

**Or via API:**
```bash
curl -X POST "http://localhost:8002/api/v1/process" \
  -F "file=@image.jpg" \
  -F "conf_threshold=0.5"
```

### Option 2: Individual Services

**YOLO Detection Only:**
```bash
curl -X POST "http://localhost:8000/api/v1/detect" \
  -F "file=@image.jpg"
```

**OCR Recognition Only:**
```bash
curl -X POST "http://localhost:8001/api/v1/ocr" \
  -F "file=@image.jpg" \
  -F 'bboxes=[[100,100,200,200]]' \
  -F 'confidences=[0.95]'
```

## Project Structure

```
OCR-SYSTEM/
├── YOLO_inference/          # YOLO detection service
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── api/            # API endpoints
│   │   ├── models/         # YOLO detector
│   │   └── schemas/        # Data models
│   └── weights/            # YOLO model weights
│
├── OCR_inference/          # OCR recognition service
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── api/            # API endpoints
│   │   ├── models/         # OCR service
│   │   └── schemas/        # Data models
│   └── OCR_CNN_Vietnamese/ # OCR model repository
│
└── pipeline/               # Integration pipeline
    ├── app.py              # Pipeline API service
    ├── service.py          # Core pipeline logic
    ├── schemas.py          # Data models
    ├── example.py          # Usage examples
    └── README.md           # Pipeline documentation
```

## API Documentation

When services are running, access interactive API docs:

- **YOLO API**: http://localhost:8000/docs
- **OCR API**: http://localhost:8001/docs
- **Pipeline API**: http://localhost:8002/docs

## Examples

### Python Script

```python
from pipeline.service import create_pipeline

# Initialize
pipeline = create_pipeline(
    yolo_url="http://localhost:8000",
    ocr_url="http://localhost:8001",
    conf_threshold=0.5
)

# Check services
status = pipeline.check_services()
print(f"Services ready: {all(status.values())}")

# Process image
result = pipeline.process_image("vietnamese_text.jpg")

print(f"Found {result.total_detections} text regions:")
for i, det in enumerate(result.detections_with_text, 1):
    print(f"{i}. '{det.text}' (confidence: {det.confidence:.2f})")
```

### Run Examples

```bash
cd pipeline
python example.py --mode cli      # Direct service calls
python example.py --mode api      # Through pipeline API
python example.py --mode detailed # Show detailed steps
```

## Configuration

### Service Ports

- YOLO Detection: `8000`
- OCR Recognition: `8001`
- Pipeline Service: `8002`

## Troubleshooting

### Services Won't Start

**Error:** Port already in use
```bash
# Find and kill process on port
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### No Detections

1. Check image quality
2. Lower confidence threshold (try 0.3)
3. Verify model is loaded correctly

### Service Connection Errors

Check health endpoints:
```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

## Models

### YOLO Model
- **Model**: YOLOv11s
- **Task**: Text region detection

### OCR Model
- **Architecture**: ResNet + Transformer
- **Task**: Vietnamese text recognition

## Acknowledgments

- YOLO: Ultralytics YOLOv11
- OCR Model: [OCR_CNN_Vietnamese](https://github.com/BoPDA1607/OCR_CNN_Vietnamese)