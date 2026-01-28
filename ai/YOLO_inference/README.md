# YOLO Inference Service

Dịch vụ API nhận diện đối tượng sử dụng YOLO (You Only Look Once) model, được xây dựng với FastAPI và Ultralytics YOLO11.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Sử dụng](#sử-dụng)
- [API Documentation](#api-documentation)
- [Cấu trúc Project](#cấu-trúc-project)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)

## ✨ Tính năng

- 🚀 **FastAPI**: Framework hiện đại, hiệu suất cao cho API
- 🎯 **YOLO11 Model**: Sử dụng YOLO11s model để nhận diện đối tượng
- 🔒 **Error Handling**: Xử lý lỗi đầy đủ và thông báo rõ ràng
- 📊 **Logging**: Hệ thống logging chi tiết cho debugging
- 🎚️ **Confidence Threshold**: Lọc kết quả theo ngưỡng confidence
- 📝 **Type Safety**: Validation tự động với Pydantic schemas
- 🏷️ **Class Names**: Trả về cả class_id và class_name
- ⚡ **GPU Support**: Tự động sử dụng CUDA nếu có GPU

## 💻 Yêu cầu hệ thống

- Python >= 3.8
- CUDA (tùy chọn, để sử dụng GPU)
- Model file: `weights/Model_YOLO11s_card.pt`

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd YOLO_inference
```

### 2. Tạo virtual environment (khuyến nghị)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Đảm bảo model file tồn tại

Đảm bảo file model `Model_YOLO11s_card.pt` nằm trong thư mục `weights/`:

```
weights/
  └── Model_YOLO11s_card.pt
```

## ⚙️ Cấu hình

Các cấu hình có thể được thay đổi trong `app/core/config.py`:

```python
class Settings:
    PROJECT_NAME: str = "YOLO Inference Service"
    API_V1_STR: str = "/api/v1"
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    CONFIDENCE_THRESHOLD: float = 0.6  # Ngưỡng confidence tối thiểu
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
```

- **CONFIDENCE_THRESHOLD**: Ngưỡng confidence tối thiểu (0.0 - 1.0). Chỉ các detection có confidence >= threshold mới được trả về.
- **MAX_FILE_SIZE**: Kích thước file tối đa (mặc định: 10MB)
- **ALLOWED_IMAGE_TYPES**: Các loại file ảnh được phép upload

### Cấu hình CORS

CORS đã được cấu hình trong `app/main.py` để cho phép frontend gọi API. 

**⚠️ Lưu ý cho Production:**

Trong môi trường production, nên thay đổi `allow_origins=["*"]` thành domain cụ thể của frontend:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Thay bằng domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Sử dụng

### Khởi động server

```bash
uvicorn app.main:app --reload
```

Server sẽ chạy tại: `http://localhost:8000`

### Truy cập API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Health Check

```bash
curl http://localhost:8000/
```

Response:
```json
{
    "status": "ok"
}
```

## 📚 API Documentation

### POST `/api/v1/detect`

Nhận diện đối tượng trong ảnh.

**Request:**
- Method: `POST`
- Endpoint: `/api/v1/detect`
- Content-Type: `multipart/form-data`
- Body: File ảnh (jpg, png, webp)
- **File size limit**: 10MB
- **Allowed types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

**Response:**

```json
{
    "num_detections": 3,
    "detections": [
        {
        "class_id": 9,
        "class_name": "id_",
        "bbox": [
            318.86151123046875,
            434.8748779296875,
            552.2340698242188,
            480.39276123046875
        ],
        "confidence": 0.9042379260063171
        },
        {
        "class_id": 14,
        "class_name": "issue_date",
        "bbox": [
            261.45941162109375,
            85.81253051757812,
            344.47857666015625,
            115.96871948242188
        ],
        "confidence": 0.868107259273529
        },
        {
        "class_id": 21,
        "class_name": "personal_identifi",
        "bbox": [
            19.896347045898438,
            41.76625061035156,
            206.16685485839844,
            71.708251953125
        ],
        "confidence": 0.8539847135543823
        }
    ]
} 
```

**Response Fields:**
- `num_detections` (int): Số lượng đối tượng được phát hiện
- `detections` (array): Danh sách các detection
  - `class_id` (int): ID của class
  - `class_name` (string): Tên của class
  - `confidence` (float): Độ tin cậy (0.0 - 1.0)
  - `bbox` (array): Tọa độ bounding box `[x_min, y_min, x_max, y_max]` (pixel)

**Error Responses:**

- `400 Bad Request`: 
  - File rỗng
  - Định dạng ảnh không hợp lệ
  - File quá lớn (>10MB)
  - File type không được phép
- `500 Internal Server Error`: Lỗi server

## 📁 Cấu trúc Project

```
YOLO_inference/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Entry point, FastAPI app
│   ├── api/
│   │   ├── __init__.py
│   │   └── detect.py           # API endpoint /detect
│   ├── models/
│   │   ├── __init__.py
│   │   └── yolo_detector.py    # YOLO model wrapper
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Cấu hình
│   │   └── logging.py          # Logging config
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── detect.py           # Pydantic schemas
│   └── utils/
│       ├── __init__.py
│       └── image.py            # Image utilities
├── weights/
│   └── Model_YOLO11s_card.pt   # YOLO model file
├── requirements.txt            # Python dependencies
└── README.md                   # Documentation
```

## 💡 Ví dụ sử dụng

### Sử dụng curl

```bash
curl -X POST "http://localhost:8000/api/v1/detect" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@path/to/your/image.jpg"
```

### Sử dụng Python requests

```python
import requests

url = "http://localhost:8000/api/v1/detect"
files = {"file": open("image.jpg", "rb")}

response = requests.post(url, files=files)
result = response.json()

print(f"Số lượng đối tượng: {result['num_detections']}")
for detection in result['detections']:
    print(f"Class: {detection['class_name']}, Confidence: {detection['confidence']:.2f}")
```

### Sử dụng JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('image.jpg'));

axios.post('http://localhost:8000/api/v1/detect', form, {
    headers: form.getHeaders()
})
.then(response => {
    console.log('Detections:', response.data);
})
.catch(error => {
    console.error('Error:', error);
});
```

### Sử dụng Frontend (React/JavaScript)

API đã được cấu hình CORS để frontend có thể gọi từ browser:

```javascript
// React/JavaScript example
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8000/api/v1/detect', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const result = await response.json();
    console.log('Detections:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Sử dụng với input file
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await handleImageUpload(file);
    // Xử lý kết quả
  }
});
```

**React Hook Example:**

```jsx
import { useState } from 'react';

function ImageDetector() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <p>Đang xử lý...</p>}
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      {result && (
        <div>
          <p>Số lượng đối tượng: {result.num_detections}</p>
          {result.detections.map((det, idx) => (
            <div key={idx}>
              {det.class_name}: {det.confidence.toFixed(2)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔍 Logging

Hệ thống logging tự động ghi lại:
- Thông tin request (filename, content_type)
- Kích thước ảnh được xử lý
- Số lượng detections tìm được
- Các lỗi xảy ra (với stack trace)

Logs được hiển thị với format:
```
%(asctime)s | %(levelname)s | %(name)s | %(message)s
```

## 🛠️ Development

### Chạy với hot reload

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Chạy production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📝 Notes

- Model được load một lần duy nhất khi khởi động ứng dụng (singleton pattern)
- Tự động phát hiện và sử dụng GPU nếu có CUDA
- Confidence threshold mặc định là 0.6, có thể thay đổi trong `config.py`
- API tự động validate response với Pydantic schemas

