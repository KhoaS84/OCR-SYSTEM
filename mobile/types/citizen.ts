export interface Citizen {
  id: string;
  citizenId: string; // Số CCCD
  name: string;
  dateOfBirth: string;
  sex: 'Nam' | 'Nữ';
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCitizenRequest {
  citizenId: string;
  name: string;
  dateOfBirth: string;
  sex: 'Nam' | 'Nữ';
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
}

export interface UpdateCitizenRequest {
  name?: string;
  placeOfResidence?: string;
  phoneNumber?: string;
}

export interface CitizenResponse {
  success: boolean;
  message: string;
  citizen?: Citizen;
}

export interface CitizenListResponse {
  success: boolean;
  citizens: Citizen[];
  total: number;
}

export interface SearchCitizenRequest {
  query: string;
  field?: 'citizenId' | 'name' | 'documentNumber';
}
