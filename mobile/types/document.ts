export interface CCCDDocument {
  id: string;
  userId: string;
  frontImageUrl: string;
  backImageUrl: string;
  ocrData?: OCRData;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface OCRData {
  id: string;
  name: string;
  dateOfBirth: string;
  sex: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
}

export interface UploadCCCDRequest {
  frontImage: string; // base64 hoặc file URI
  backImage: string;
}

export interface UploadCCCDResponse {
  success: boolean;
  message: string;
  document?: CCCDDocument;
}

export interface DocumentListResponse {
  success: boolean;
  documents: CCCDDocument[];
}
