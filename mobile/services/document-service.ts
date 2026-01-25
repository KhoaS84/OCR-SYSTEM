import {
  UploadCCCDRequest,
  UploadCCCDResponse,
  DocumentListResponse,
  CCCDDocument,
  OCRData
} from '../types/document';

const API_BASE_URL = 'https://api.example.com';

// Mock data
const mockOCRData: OCRData = {
  id: '001234567890',
  name: 'NGUYỄN VĂN A',
  dateOfBirth: '15/03/1990',
  sex: 'Nam',
  nationality: 'Việt Nam',
  placeOfOrigin: 'Hà Nội, Việt Nam',
  placeOfResidence: 'Số 123, Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
  expiryDate: '15/03/2035',
};

const mockDocument: CCCDDocument = {
  id: 'doc-123',
  userId: 'user-1',
  frontImageUrl: 'https://example.com/cccd-front.jpg',
  backImageUrl: 'https://example.com/cccd-back.jpg',
  ocrData: mockOCRData,
  status: 'verified',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Upload ảnh CCCD (mặt trước và mặt sau)
 */
export const uploadCCCD = async (
  request: UploadCCCDRequest
): Promise<UploadCCCDResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const formData = new FormData();
    // formData.append('front', request.frontImage);
    // formData.append('back', request.backImage);

    // const response = await fetch(`${API_BASE_URL}/documents/cccd`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: formData,
    // });

    // if (!response.ok) {
    //   throw new Error('Upload thất bại');
    // }

    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Upload CCCD thành công. Đang xử lý OCR...',
          document: {
            ...mockDocument,
            id: `doc-${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }, 2000);
    });
  } catch (error) {
    console.error('Upload CCCD error:', error);
    throw new Error('Upload CCCD thất bại. Vui lòng thử lại.');
  }
};

/**
 * Lấy danh sách tài liệu CCCD đã upload
 */
export const getDocuments = async (): Promise<DocumentListResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/documents`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error('Lấy danh sách thất bại');
    // }

    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          documents: [
            mockDocument,
            {
              ...mockDocument,
              id: 'doc-124',
              status: 'pending',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Get documents error:', error);
    throw new Error('Lấy danh sách tài liệu thất bại.');
  }
};

/**
 * Lấy chi tiết một tài liệu CCCD
 */
export const getDocumentById = async (
  documentId: string
): Promise<UploadCCCDResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error('Lấy thông tin thất bại');
    // }

    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Lấy thông tin tài liệu thành công',
          document: mockDocument,
        });
      }, 800);
    });
  } catch (error) {
    console.error('Get document error:', error);
    throw new Error('Lấy thông tin tài liệu thất bại.');
  }
};

/**
 * Xóa tài liệu CCCD
 */
export const deleteDocument = async (
  documentId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error('Xóa thất bại');
    // }

    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Xóa tài liệu thành công',
        });
      }, 500);
    });
  } catch (error) {
    console.error('Delete document error:', error);
    throw new Error('Xóa tài liệu thất bại.');
  }
};
