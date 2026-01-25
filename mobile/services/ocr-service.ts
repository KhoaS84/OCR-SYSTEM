import {
  OCRRequest,
  OCRResponse,
  OCRResult,
  BatchOCRRequest,
  BatchOCRResponse,
  ExtractedData,
} from '../types/ocr';

const API_BASE_URL = 'https://api.example.com';

// Mock extracted data for CCCD front
const mockExtractedDataFront: ExtractedData = {
  citizenId: '001234567890',
  name: 'NGUYỄN VĂN A',
  dateOfBirth: '15/03/1990',
  sex: 'Nam',
  nationality: 'Việt Nam',
  placeOfOrigin: 'Hà Nội, Việt Nam',
  placeOfResidence: 'Số 123, Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
  expiryDate: '15/03/2035',
};

// Mock extracted data for CCCD back
const mockExtractedDataBack: ExtractedData = {
  issueDate: '15/03/2020',
  features: 'Nốt ruồi ở cằm',
  qrCode: 'QR_CODE_DATA_ENCRYPTED',
};

/**
 * Xử lý OCR cho một ảnh tài liệu
 */
export const processOCR = async (
  request: OCRRequest
): Promise<OCRResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/ocr/process`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(request),
    // });
    
    // if (!response.ok) {
    //   throw new Error('OCR thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const isFront = request.documentType === 'cccd_front';
        const extractedData = isFront ? mockExtractedDataFront : mockExtractedDataBack;
        
        resolve({
          success: true,
          message: 'OCR thành công',
          result: {
            id: `ocr-${Date.now()}`,
            documentType: request.documentType,
            extractedData,
            confidence: 0.95 + Math.random() * 0.05, // 95-100%
            processedAt: new Date().toISOString(),
          },
        });
      }, 2500); // Giả lập thời gian xử lý OCR
    });
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Xử lý OCR thất bại. Vui lòng thử lại.');
  }
};

/**
 * Xử lý OCR cho nhiều ảnh cùng lúc
 */
export const processBatchOCR = async (
  request: BatchOCRRequest
): Promise<BatchOCRResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/ocr/batch`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(request),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Batch OCR thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const results: OCRResult[] = request.images.map((img, index) => {
          const isFront = img.documentType === 'cccd_front';
          const extractedData = isFront ? mockExtractedDataFront : mockExtractedDataBack;
          
          return {
            id: `ocr-batch-${Date.now()}-${index}`,
            documentType: img.documentType,
            extractedData,
            confidence: 0.93 + Math.random() * 0.07,
            processedAt: new Date().toISOString(),
          };
        });

        resolve({
          success: true,
          message: `Xử lý thành công ${request.images.length} ảnh`,
          results,
        });
      }, 3000);
    });
  } catch (error) {
    console.error('Batch OCR error:', error);
    throw new Error('Xử lý batch OCR thất bại.');
  }
};

/**
 * Xử lý OCR CCCD đầy đủ (cả 2 mặt)
 */
export const processFullCCCD = async (
  frontImageUrl: string,
  backImageUrl: string
): Promise<{
  success: boolean;
  message: string;
  frontResult?: OCRResult;
  backResult?: OCRResult;
  combinedData?: ExtractedData;
}> => {
  try {
    // Xử lý cả 2 mặt
    const [frontResponse, backResponse] = await Promise.all([
      processOCR({ imageUrl: frontImageUrl, documentType: 'cccd_front' }),
      processOCR({ imageUrl: backImageUrl, documentType: 'cccd_back' }),
    ]);

    if (!frontResponse.success || !backResponse.success) {
      throw new Error('Xử lý OCR thất bại');
    }

    // Kết hợp dữ liệu từ 2 mặt
    const combinedData: ExtractedData = {
      ...frontResponse.result!.extractedData,
      ...backResponse.result!.extractedData,
    };

    return {
      success: true,
      message: 'Xử lý OCR CCCD thành công',
      frontResult: frontResponse.result,
      backResult: backResponse.result,
      combinedData,
    };
  } catch (error) {
    console.error('Full CCCD OCR error:', error);
    throw new Error('Xử lý OCR CCCD thất bại.');
  }
};

/**
 * Xác thực dữ liệu OCR
 */
export const validateOCRData = async (
  ocrData: ExtractedData
): Promise<{
  success: boolean;
  isValid: boolean;
  errors: string[];
}> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/ocr/validate`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(ocrData),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Xác thực thất bại');
    // }
    
    // return await response.json();

    // Mock validation
    return new Promise((resolve) => {
      setTimeout(() => {
        const errors: string[] = [];
        
        // Kiểm tra các trường bắt buộc
        if (!ocrData.citizenId || ocrData.citizenId.length !== 12) {
          errors.push('Số CCCD không hợp lệ');
        }
        if (!ocrData.name) {
          errors.push('Thiếu họ tên');
        }
        if (!ocrData.dateOfBirth) {
          errors.push('Thiếu ngày sinh');
        }

        resolve({
          success: true,
          isValid: errors.length === 0,
          errors,
        });
      }, 500);
    });
  } catch (error) {
    console.error('Validate OCR error:', error);
    throw new Error('Xác thực dữ liệu thất bại.');
  }
};

/**
 * Lấy lịch sử OCR
 */
export const getOCRHistory = async (): Promise<{
  success: boolean;
  history: OCRResult[];
}> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/ocr/history`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    
    // if (!response.ok) {
    //   throw new Error('Lấy lịch sử thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          history: [
            {
              id: 'ocr-1',
              documentType: 'cccd_front',
              extractedData: mockExtractedDataFront,
              confidence: 0.97,
              processedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'ocr-2',
              documentType: 'cccd_back',
              extractedData: mockExtractedDataBack,
              confidence: 0.96,
              processedAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Get OCR history error:', error);
    throw new Error('Lấy lịch sử OCR thất bại.');
  }
};
