# VietOCR API Service

FastAPI service for Vietnamese text recognition using VietOCR library.

## Features

- 🚀 FastAPI-based REST API
- 🔥 GPU acceleration support
- 📝 Vietnamese text recognition using VietOCR
- 🎯 Single image and batch processing
- 🔌 Easy integration with YOLO detection

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Edit `app/core/config.py` to configure:
- `DEVICE`: "cuda:0" for GPU or "cpu"
- `MODEL_NAME`: "vgg_transformer" or "vgg_seq2seq"
- `PORT`: API server port (default: 8002)

## Running the Service

```bash
# Development mode
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002

# Production mode
python app/main.py
```

## API Endpoints

### 1. OCR on Detected Regions
`POST /api/v1/ocr`

Process multiple regions from an image (typically from YOLO detections).

**Parameters:**
- `file`: Image file (multipart/form-data)
- `bboxes`: JSON string of bounding boxes `[[x1,y1,x2,y2],...]`
- `confidences`: JSON string of confidence scores (optional)
- `conf_threshold`: Confidence threshold (default: 0.5)

**Example:**
```python
import requests

files = {'file': open('image.jpg', 'rb')}
data = {
    'bboxes': '[[100,100,200,150], [300,200,400,250]]',
    'confidences': '[0.9, 0.85]',
    'conf_threshold': 0.5
}

response = requests.post('http://localhost:8002/api/v1/ocr', files=files, data=data)
print(response.json())
```

### 2. OCR on Full Image
`POST /api/v1/ocr/single`

Process a full image for OCR.

**Parameters:**
- `file`: Image file (multipart/form-data)

**Example:**
```python
import requests

files = {'file': open('image.jpg', 'rb')}
response = requests.post('http://localhost:8002/api/v1/ocr/single', files=files)
print(response.json())
```

### 3. Health Check
`GET /api/v1/health`

Check service health and model status.

## Using VietOCR Models

VietOCR supports multiple models:
- `vgg_transformer` (recommended)
- `vgg_seq2seq`

The model will be automatically downloaded on first use.

## Integration with YOLO

This service is designed to work with the YOLO_inference service:

1. YOLO detects text regions
2. VietOCR recognizes text in each region
3. Pipeline combines both results

See `pipeline/` directory for integration examples.

## Testing

```bash
# Test the API
python test_api.py
```

## GPU Support

To use GPU acceleration:
1. Install CUDA-compatible PyTorch
2. Set `DEVICE="cuda:0"` in config
3. Ensure CUDA is available on your system

## License

MIT
