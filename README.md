# OCR System - Vietnamese Text Detection & Recognition

Complete system for Vietnamese text detection and recognition using YOLO v11 and VietOCR.

## 🏗️ Architecture

```
┌──────────────┐
│    Image     │
└──────┬───────┘
       ▼
┌──────────────────┐
│   Pipeline V2    │  (Port 8003)
└────┬────────┬────┘
     │        │
     ▼        ▼
┌─────────┐  ┌──────────┐
│  YOLO   │  │ VietOCR  │
│  (8001) │  │  (8002)  │
└─────────┘  └──────────┘
```

## 📁 Project Structure

```
OCR-SYSTEM/
├── YOLO_inference/        # YOLO text detection service
├── OCR_V2_inference/      # VietOCR text recognition service
└── pipeline_v2/           # Integration pipeline
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PyTorch (with or without CUDA)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KhoaS84/OCR-SYSTEM.git
   cd OCR-SYSTEM
   cd OCR-SYSTEM
   ```

2. **Setup YOLO service:**
   ```bash
   cd YOLO_inference
   ```

2. **Install dependencies:**

   ```bash
   # YOLO Service
   cd YOLO_inference
   pip install -r requirements.txt

   # VietOCR Service
   cd ../OCR_V2_inference
   pip install -r requirements.txt

   # Pipeline Service
   cd ../pipeline_v2
   pip install -r requirements.txt
   ```

### Running the System

Open three terminals:

**Terminal 1 - YOLO Detection:**
```bash
cd YOLO_inference
python -m uvicorn app.main:app --port 8001
```

**Terminal 2 - VietOCR Recognition:**
```bash
cd OCR_V2_inference
python -m uvicorn app.main:app --port 8002
```

**Terminal 3 - Pipeline:**
```bash
cd pipeline_v2
python -m uvicorn app:app --port 8003
```

### Test the System

```bash
cd pipeline_v2
python test_pipeline.py
```

## 📡 API Usage

### Complete Pipeline (Recommended)

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

# Access results
for detection in result["detections_with_text"]:
    print(f"Text: {detection['text']}")
    print(f"BBox: {detection['bbox']}")
```

**Using cURL:**
```bash
curl -X POST "http://localhost:8003/api/v1/process" \
  -F "file=@image.jpg" \
  -F "conf_threshold=0.5"
```

**Interactive API:**
Visit http://localhost:8003/docs

### Individual Services

**YOLO Detection:**
```bash
curl -X POST "http://localhost:8001/api/v1/detect" \
  -F "file=@image.jpg"
```

**VietOCR Recognition:**
```bash
curl -X POST "http://localhost:8002/api/v1/ocr/single" \
  -F "file=@image.jpg"
```

## 📁 Project Structure

```
OCR-SYSTEM/
├── YOLO_inference/          # YOLO text detection service
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── api/detect.py    # Detection endpoints
│   │   ├── models/          # YOLO detector
│   │   └── core/config.py   # Configuration
│   └── weights/             # YOLO model weights
│
├── OCR_V2_inference/        # VietOCR recognition service
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── api/ocr.py       # OCR endpoints
│   │   ├── models/          # VietOCR service
│   │   └── core/config.py   # Configuration
│   └── weights/             # Custom model (auto-downloaded)
│
└── pipeline_v2/             # Integration pipeline
    ├── app.py               # Pipeline API
    ├── service.py           # Orchestration logic
    ├── schemas.py           # Data models
    └── test_pipeline.py     # Test script
```

## 🔧 Configuration

### VietOCR Custom Model

Edit `OCR_V2_inference/app/core/config.py`:

```python
USE_CUSTOM_MODEL = True  # Use custom model
CUSTOM_MODEL_GDRIVE_ID = "17UtJhDv_I5a2AQfU4M7AtnWy2KYiQSMS"

# To use default VietOCR model
USE_CUSTOM_MODEL = False
```

### GPU/CPU Configuration

System auto-detects CUDA availability. To force CPU:

```python
# OCR_V2_inference/app/core/config.py
DEVICE = "cpu"
```

### Service URLs

Edit `pipeline_v2/app.py`:

```python
config = PipelineConfig(
    yolo_url="http://localhost:8001",
    ocr_url="http://localhost:8002"
)
```

## 📊 API Endpoints

### Pipeline API (Port 8003)
- `POST /api/v1/process` - Complete pipeline
- `GET /health` - Service status

### YOLO API (Port 8001)
- `POST /api/v1/detect` - Text detection
- `GET /health` - Service status

### VietOCR API (Port 8002)
- `POST /api/v1/ocr` - OCR on regions
- `POST /api/v1/ocr/single` - OCR full image
- `GET /api/v1/health` - Service status

## 📝 Response Format

```json
{
  "detections_with_text": [
    {
      "bbox": [100, 150, 300, 200],
      "confidence": 0.95,
      "class_name": "text",
      "text": "NGUYỄN LÊ ĐĂNG QUANG"
    }
  ],
  "total_detections": 1,
  "yolo_detections": 1,
  "ocr_results": 1,
  "processing_time": 1.23
}
```

## 🎯 Features

- ✅ Vietnamese text detection with YOLO v11
- ✅ Vietnamese text recognition with VietOCR
- ✅ Custom trained model support
- ✅ GPU/CPU auto-detection
- ✅ RESTful API with FastAPI
- ✅ Complete pipeline integration
- ✅ Health monitoring
- ✅ Processing time tracking

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Use different port
python -m uvicorn app.main:app --port 8004
```

### CUDA Not Available
System automatically falls back to CPU. No action needed.

### Model Download Issues
- Custom model downloads automatically on first run
- Cached in `OCR_V2_inference/weights/`
- Check internet connection if download fails

### Pillow Compatibility
VietOCR requires Pillow 9.x:
```bash
pip install Pillow==9.5.0
```

## 📚 Documentation

- [YOLO Service](YOLO_inference/README.md)
- [VietOCR Service](OCR_V2_inference/README.md)
- [Pipeline Service](pipeline_v2/README.md)

## 🔐 Service Ports

| Service | Port | Description |
|---------|------|-------------|
| YOLO | 8001 | Text detection |
| VietOCR | 8002 | Text recognition |
| Pipeline | 8003 | Complete pipeline |

## 📦 Technologies

- **FastAPI** - Web framework
- **PyTorch** - Deep learning
- **Ultralytics** - YOLO v11
- **VietOCR** - Vietnamese OCR
- **Pydantic** - Data validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 👥 Authors

- **KhoaS84** - [GitHub](https://github.com/KhoaS84)

## 🙏 Acknowledgments

- Ultralytics for YOLO v11
- VietOCR team for Vietnamese OCR model
- FastAPI for excellent web framework