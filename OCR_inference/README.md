# OCR API Service

FastAPI-based OCR service for Vietnamese text recognition using CNN-Transformer architecture.

## Features

- RESTful API for Vietnamese OCR
- Support for bounding box-based text recognition
- Integration with YOLO detection outputs
- Configurable confidence thresholds
- Health check endpoints
- CORS support
- Comprehensive logging

## Installation

### Prerequisites

1. Python 3.8 or higher
2. CUDA-capable GPU (optional, for faster inference)
3. Git (for automatic setup)

### Quick Setup (Automatic)

**Option 1: Automatic setup on first run** (Recommended)

Just install dependencies and start the service. It will automatically set up everything on first run:

```bash
cd OCR_inference
pip install -r requirements.txt
uvicorn app.main:app --port 8001
```

The service will automatically:
- Clone the OCR_CNN_Vietnamese repository
- Download the OCR model
- Install required dependencies

**Option 2: Manual setup script**

Run the setup script before starting the service:

```bash
cd OCR_inference
pip install -r requirements.txt
python setup.py
```

Then start the service:
```bash
uvicorn app.main:app --port 8001
```

### Manual Setup

If you prefer manual setup or automatic setup fails:

1. Clone the OCR_CNN_Vietnamese repository:
```bash
cd OCR_inference
git clone https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git
```

2. Download the OCR model:
```bash
pip install gdown
gdown https://drive.google.com/uc?id=1iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG
mv best_ocr_model.pth OCR_CNN_Vietnamese/
```

3. Install dependencies:
```bash
pip install -r requirements.txt
cd OCR_CNN_Vietnamese
pip install -r requirements.txt
cd ..
```

## Configuration

Create a `.env` file in the `OCR_inference` directory:

```env
OCR_MODEL_PATH=OCR_CNN_Vietnamese/best_ocr_model.pth

# Auto-setup (enabled by default)
# Set to 'false' to disable automatic setup on startup
AUTO_SETUP=true
```

## Running the Service

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

## API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

### 2. OCR Service Health
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda"
}
```

### 3. OCR with Bounding Boxes
```http
POST /api/v1/ocr
```

**Parameters:**
- `file` (form-data): Image file (JPEG/PNG, max 10MB)
- `bboxes` (form-data): JSON string of bounding boxes `[[x1,y1,x2,y2],...]`
- `confidences` (form-data): JSON string of confidence scores `[0.95, 0.92, ...]`
- `conf_threshold` (form-data, optional): Confidence threshold (default: 0.5)

**Example using curl:**
```bash
curl -X POST "http://localhost:8001/api/v1/ocr" \
  -F "file=@image.jpg" \
  -F 'bboxes=[[770,308,1235,614],[1263,346,1692,597]]' \
  -F 'confidences=[0.95,0.92]' \
  -F "conf_threshold=0.5"
```

**Example using Python:**
```python
import requests
import json

url = "http://localhost:8001/api/v1/ocr"

files = {"file": open("image.jpg", "rb")}
data = {
    "bboxes": json.dumps([[770, 308, 1235, 614], [1263, 346, 1692, 597]]),
    "confidences": json.dumps([0.95, 0.92]),
    "conf_threshold": 0.5
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

**Response:**
```json
{
  "results": [
    {
      "bbox": [770, 308, 1235, 614],
      "text": "QUÁN",
      "confidence": 0.95
    },
    {
      "bbox": [1263, 346, 1692, 597],
      "text": "CHAY",
      "confidence": 0.92
    }
  ],
  "total_detections": 2
}
```

## Integration with YOLO API

You can chain the YOLO detection API with the OCR API:

```python
import requests
import json

# Step 1: Get detections from YOLO
yolo_url = "http://localhost:8000/api/v1/detect"
files = {"file": open("image.jpg", "rb")}
yolo_response = requests.post(yolo_url, files=files)
yolo_data = yolo_response.json()

# Step 2: Extract bboxes and confidences
bboxes = [det["bbox"] for det in yolo_data["detections"]]
confidences = [det["confidence"] for det in yolo_data["detections"]]

# Step 3: Perform OCR
ocr_url = "http://localhost:8001/api/v1/ocr"
files = {"file": open("image.jpg", "rb")}
data = {
    "bboxes": json.dumps(bboxes),
    "confidences": json.dumps(confidences),
    "conf_threshold": 0.5
}

ocr_response = requests.post(ocr_url, files=files, data=data)
print(ocr_response.json())
```

## API Documentation

Once the service is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## Project Structure

```
OCR_inference/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── ocr.py           # OCR endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Configuration settings
│   │   └── logging.py       # Logging setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── ocr_service.py   # OCR model service
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── ocr.py           # Pydantic models
│   └── utils/
│       ├── __init__.py
│       └── image.py         # Image utilities
├── OCR_CNN_Vietnamese/       # OCR model repository
├── requirements.txt
└── README.md
```

## Configuration Options

Edit `app/core/config.py` to customize:
- `MAX_IMAGE_SIZE`: Maximum upload size (default: 10MB)
- `ALLOWED_IMAGE_TYPES`: Accepted image formats
- `DEFAULT_CONF_THRESHOLD`: Default confidence threshold
- `IMAGE_HEIGHT`, `IMAGE_WIDTH`: OCR input dimensions

## Logging

Logs are saved to `logs/ocr_api.log` and printed to console.

## Performance Tips

1. **Use GPU**: Ensure CUDA is available for faster inference
2. **Adjust workers**: Increase `--workers` for production
3. **Batch processing**: Process multiple images in parallel
4. **Cache model**: The model is loaded once on startup

## Troubleshooting

### Model not found
Ensure the model path is correct in `.env` or `config.py`

### CUDA out of memory
Reduce batch size or use CPU by setting `DEVICE=cpu` in environment

### Import errors
Ensure `OCR_CNN_Vietnamese` is in the correct location and requirements are installed

## License

See the original OCR_CNN_Vietnamese repository for license information.
