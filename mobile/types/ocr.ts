export interface OCRRequest {
  imageUrl: string;
  documentType: 'cccd_front' | 'cccd_back' | 'passport' | 'other';
}

export interface OCRResult {
  id: string;
  documentType: string;
  extractedData: ExtractedData;
  confidence: number;
  processedAt: string;
}

export interface ExtractedData {
  // Thông tin từ mặt trước CCCD
  citizenId?: string;
  name?: string;
  dateOfBirth?: string;
  sex?: string;
  nationality?: string;
  placeOfOrigin?: string;
  placeOfResidence?: string;
  expiryDate?: string;

  // Thông tin từ mặt sau CCCD
  issueDate?: string;
  features?: string;
  qrCode?: string;

  // Các trường bổ sung
  [key: string]: any;
}

export interface OCRResponse {
  success: boolean;
  message: string;
  result?: OCRResult;
}

export interface BatchOCRRequest {
  images: Array<{
    imageUrl: string;
    documentType: string;
  }>;
}

export interface BatchOCRResponse {
  success: boolean;
  message: string;
  results: OCRResult[];
}
