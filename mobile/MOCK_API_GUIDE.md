# Mock API Services - Mobile App

Đã tạo đầy đủ các mock services cho mobile app OCR-SYSTEM.

## 📦 Files đã tạo

### Types (mobile/types/)
- ✅ `auth.ts` - Authentication types (đã có sẵn)
- ✅ `user.ts` - User & Profile types
- ✅ `document.ts` - CCCD Document types
- ✅ `ocr.ts` - OCR Processing types
- ✅ `citizen.ts` - Citizen Data types

### Services (mobile/services/)
- ✅ `auth-service.ts` - Login/Register (đã có sẵn)
- ✅ `user-service.ts` - User Profile Management
- ✅ `document-service.ts` - CCCD Upload & Management
- ✅ `ocr-service.ts` - OCR Processing
- ✅ `citizen-service.ts` - Citizen Data CRUD

### Screens Updated
- ✅ `app/(tabs)/index.tsx` - Màn hình chính với user profile
- ✅ `app/(tabs)/explore.tsx` - Màn hình test API

## 🎯 Chức năng Mock APIs

### 1. Authentication (auth-service.ts)
```typescript
- loginUser(data) → Login với mock validation
- registerUser(data) → Đăng ký tài khoản
- verifyCCCD() → Xác thực CCCD
```

### 2. User Profile (user-service.ts)
```typescript
- getUserProfile() → Lấy thông tin user
- updateUserProfile(data) → Cập nhật profile
- changePassword(old, new) → Đổi mật khẩu
- uploadAvatar(uri) → Upload avatar
- deleteAccount() → Xóa tài khoản
```

### 3. Documents (document-service.ts)
```typescript
- uploadCCCD(front, back) → Upload ảnh CCCD 2 mặt
- getDocuments() → Lấy danh sách tài liệu
- getDocumentById(id) → Chi tiết tài liệu
- deleteDocument(id) → Xóa tài liệu
```

### 4. OCR Processing (ocr-service.ts)
```typescript
- processOCR(request) → OCR 1 ảnh
- processBatchOCR(images) → OCR nhiều ảnh
- processFullCCCD(front, back) → OCR CCCD đầy đủ
- validateOCRData(data) → Validate dữ liệu OCR
- getOCRHistory() → Lịch sử OCR
```

### 5. Citizen Data (citizen-service.ts)
```typescript
- getCitizens() → Danh sách công dân
- getCitizenById(id) → Chi tiết công dân
- searchCitizens(query) → Tìm kiếm công dân
- createCitizen(data) → Tạo mới công dân
- updateCitizen(id, data) → Cập nhật công dân
- deleteCitizen(id) → Xóa công dân
- getCitizenByCCCDNumber(cccd) → Tìm theo số CCCD
```

## 🧪 Test Mock APIs

### Cách 1: Từ màn hình Explore
1. Chạy app mobile
2. Chuyển sang tab "Explore"
3. Click vào các nút để test từng API
4. Xem kết quả JSON response bên dưới

### Cách 2: Từ code
```typescript
import { getUserProfile } from '@/services/user-service';
import { uploadCCCD } from '@/services/document-service';
import { processOCR } from '@/services/ocr-service';

// Example usage
const profile = await getUserProfile();
console.log(profile);

const doc = await uploadCCCD({
  frontImage: 'base64...',
  backImage: 'base64...',
});
console.log(doc);
```

## 📊 Mock Data Examples

### User Profile Response
```json
{
  "success": true,
  "user": {
    "id": "user-1",
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "isVerified": true,
    "cccdVerified": true,
    "citizenData": {
      "citizenId": "001234567890",
      "name": "NGUYỄN VĂN A",
      "dateOfBirth": "15/03/1990",
      "sex": "Nam",
      ...
    }
  }
}
```

### OCR Result Response
```json
{
  "success": true,
  "message": "OCR thành công",
  "result": {
    "id": "ocr-123",
    "documentType": "cccd_front",
    "extractedData": {
      "citizenId": "001234567890",
      "name": "NGUYỄN VĂN A",
      "dateOfBirth": "15/03/1990",
      ...
    },
    "confidence": 0.97
  }
}
```

## 🔄 Chuyển sang Real API

Khi backend sẵn sàng, chỉ cần:

1. Uncomment phần fetch/API call thực
2. Comment lại phần mock response
3. Cập nhật `API_BASE_URL` trong mỗi service

Ví dụ trong `user-service.ts`:
```typescript
// Uncomment phần này
// const response = await fetch(`${API_BASE_URL}/users/profile`, {
//   method: 'GET',
//   headers: {
//     'Authorization': `Bearer ${token}`,
//   },
// });
// return await response.json();

// Comment phần mock này
// return new Promise((resolve) => { ... });
```

## ⚙️ Cấu hình

### API Base URL
Thay đổi trong mỗi service file:
```typescript
const API_BASE_URL = 'https://api.example.com'; // Thay bằng URL backend thật
```

### Timing
Mock APIs có delay giả lập:
- Auth: 1000ms
- User: 1000ms
- Documents: 2000ms (có upload file)
- OCR: 2500ms (xử lý AI)
- Citizen: 1200ms

Có thể điều chỉnh trong `setTimeout()` của mỗi service.

## 📱 Features Mobile App

### Màn hình đã có
- ✅ Login (pages/login.tsx)
- ✅ Register (pages/register.tsx)
- ✅ QR Scanner (pages/qr-scanner.tsx)
- ✅ Home - User Profile (app/(tabs)/index.tsx)
- ✅ Explore - API Testing (app/(tabs)/explore.tsx)

### Flow hoàn chỉnh
1. Đăng ký → Đăng nhập
2. Quét QR CCCD để xác thực
3. Upload ảnh CCCD
4. OCR tự động xử lý
5. Xem thông tin công dân
6. Quản lý profile

## 🎨 UI/UX

- Material Design cho Android
- iOS native feel
- Colors: Đỏ CCCD Vietnam (#C41E3A)
- Responsive cho cả phone & tablet
- Loading states
- Error handling
- Success feedback

## 🚀 Chạy Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code với Expo Go app hoặc chạy emulator.

## 📝 Notes

- Tất cả APIs đang ở **MOCK MODE**
- Data không persist (mất khi reload app)
- Không cần backend để test UI/UX
- Token authentication chưa implement (chờ backend)
- File upload chưa thực sự gửi file (chờ backend)

## 🔐 Security (Khi kết nối Backend)

Cần implement:
- [ ] JWT token storage (AsyncStorage/SecureStore)
- [ ] Refresh token mechanism
- [ ] API request interceptors
- [ ] Error handling middleware
- [ ] Network timeout handling

## 📚 Dependencies Used

```json
{
  "expo": "^52.x",
  "expo-router": "^4.x",
  "expo-camera": "latest",
  "react-native": "latest"
}
```

---

**Status**: ✅ Mock APIs hoàn chỉnh - Sẵn sàng cho UI testing
**Backend**: ⏳ Chờ implement thực tế
