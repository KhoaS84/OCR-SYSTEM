# OCR System - Hệ thống Nhận dạng Giấy tờ

Hệ thống OCR toàn diện cho việc phát hiện và trích xuất thông tin từ các loại giấy tờ tùy thân Việt Nam (CCCD, BHYT, GPLX).

## Kiến trúc Hệ thống

```
Mobile/Frontend → Backend (FastAPI) → AI Services (YOLO + VietOCR)
                                    ↓
                                 Database
```

## Cấu trúc Dự án

- **ai/**: Các AI services
  - **YOLO_inference/**: Service phát hiện loại giấy tờ (Port 8001)
  - **OCR_V2_inference/**: Service nhận dạng ký tự VietOCR (Port 8002)
  - **pipeline_v2/**: Pipeline tích hợp YOLO + VietOCR (Port 8003)
- **be/**: Backend API (Port 8000)
- **fe/**: Frontend Web App (Port 5173)
- **mobile/**: Mobile App (React Native/Expo)

## Yêu cầu Hệ thống

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Git

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd OCR-SYSTEM
```

### 2. Tạo Python Virtual Environment

```bash
python -m venv .venv
```

#### Kích hoạt virtual environment:

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**Windows CMD:**

```cmd
.venv\Scripts\activate.bat
```

### 3. Cài đặt Python dependencies

```bash
# Backend
cd be
pip install -r requirements.txt

# YOLO Service
cd ../ai/YOLO_inference
pip install -r requirements.txt

# OCR Service
cd ../OCR_V2_inference
pip install -r requirements.txt

# Pipeline Service
cd ../pipeline_v2
pip install -r requirements.txt
```

### 4. Cài đặt Frontend dependencies

```bash
cd fe
npm install
```

### 5. Cài đặt Mobile dependencies

```bash
cd mobile
npm install
```

### 6. Cấu hình Environment Variables

#### Backend (.env)

Sao chép `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cd be
copy .env.example .env
```

Chỉnh sửa `be/.env`:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/ocrdb
AI_YOLO_URL=http://localhost:8001
AI_OCR_URL=http://localhost:8002
AI_PIPELINE_URL=http://localhost:8003
```

#### Frontend (.env)

File `fe/.env`:

```env
VITE_API_URL=http://localhost:8000
```

#### Mobile (.env)

File `mobile/.env` (thay IP bằng địa chỉ máy bạn):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

### 7. Thiết lập Database

```bash
cd be
python -m orm.migrations
```

## Chạy Hệ thống

### Chạy Tất cả Services (Khuyến nghị)

Sử dụng script tự động:

```bash
start.bat
```

Script này sẽ khởi động tất cả services theo thứ tự:

1. YOLO Detection (Port 8001)
2. OCR Service (Port 8002)
3. Pipeline Service (Port 8003)
4. Backend API (Port 8000)
5. Frontend (Port 5173)
6. Mobile App (Expo)

### Dừng Tất cả Services

```bash
stop.bat
```

### Chạy Từng Service Riêng lẻ

#### YOLO Detection Service

```bash
cd ai\YOLO_inference
python -m uvicorn app.main:app --port 8001 --reload
```

#### OCR Service

```bash
cd ai\OCR_V2_inference
python -m uvicorn app.main:app --port 8002 --reload
```

#### Pipeline Service

```bash
cd ai\pipeline_v2
python -m uvicorn app:app --port 8003 --reload
```

#### Backend API

```bash
cd be
python main.py
```

#### Frontend

```bash
cd fe
npm run dev
```

#### Mobile

```bash
cd mobile
npm start
```

## API Endpoints

### Backend API (Port 8000)

#### Authentication

- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký

#### OCR

- `POST /api/v1/ocr/detect` - Phát hiện loại giấy tờ
- `POST /api/v1/ocr/extract` - Trích xuất thông tin từ giấy tờ
- `POST /api/v1/ocr/ocr` - Chỉ OCR văn bản
- `GET /api/v1/ocr/status/{job_id}` - Kiểm tra trạng thái job
- `GET /api/v1/ocr/results/{document_id}` - Lấy kết quả

#### Citizens

- `GET /api/v1/citizens/search?q={query}` - Tìm kiếm công dân
- `GET /api/v1/citizens/{id}` - Lấy thông tin công dân
- `POST /api/v1/citizens` - Tạo công dân mới
- `PUT /api/v1/citizens/{id}` - Cập nhật thông tin
- `DELETE /api/v1/citizens/{id}` - Xóa công dân

#### Documents

- `GET /api/v1/documents` - Lấy danh sách giấy tờ
- `POST /api/v1/documents` - Upload giấy tờ
- `GET /api/v1/documents/{id}` - Lấy chi tiết giấy tờ
- `DELETE /api/v1/documents/{id}` - Xóa giấy tờ

## Sử dụng API Clients

### Frontend

```javascript
import { ocrAPI, citizensAPI, authAPI } from "./services/api";

// Đăng nhập
const loginData = await authAPI.login("username", "password");

// Upload và extract giấy tờ
const result = await ocrAPI.extractText(file);

// Tìm kiếm công dân
const citizens = await citizensAPI.search("Nguyễn Văn A");
```

### Mobile

```javascript
import { ocrAPI, citizensAPI, authAPI } from "./services/api";

// Đăng nhập
const loginData = await authAPI.login("username", "password");

// Upload ảnh từ camera/gallery
const result = await ocrAPI.extractText(imageUri);

// Tìm kiếm
const citizens = await citizensAPI.search("Nguyễn Văn A");
```

## Testing

### Test YOLO Service

```bash
cd ai\YOLO_inference
python test_api.py
```

### Test OCR Service

```bash
cd ai\OCR_V2_inference
python test_api.py
```

### Test Pipeline

```bash
cd ai\pipeline_v2
python test_pipeline.py
```

## Troubleshooting

### Port đã được sử dụng

Chạy `stop.bat` để dừng tất cả services, sau đó chạy lại `start.bat`

### Module không tìm thấy

Đảm bảo virtual environment đã được kích hoạt và cài đặt dependencies:

```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

### Lỗi kết nối API

- Kiểm tra tất cả services đang chạy
- Kiểm tra URLs trong file `.env`
- Kiểm tra firewall/antivirus

### Mobile không kết nối được Backend

- Đảm bảo máy tính và điện thoại cùng mạng WiFi
- Cập nhật IP trong `mobile/.env` thành IP thực của máy
- Tắt firewall hoặc cho phép cổng 8000

## Bảo mật

- Thay đổi `SECRET_KEY` trong production
- Sử dụng HTTPS cho production
- Cấu hình CORS đúng cách
- Không commit file `.env` lên Git

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

[License Type] - Xem file LICENSE để biết thêm chi tiết
