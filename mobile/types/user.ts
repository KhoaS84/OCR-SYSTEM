export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  isVerified: boolean;
  cccdVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  citizenData?: CitizenData;
}

export interface CitizenData {
  citizenId: string;
  name: string;
  dateOfBirth: string;
  sex: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface GetProfileResponse {
  success: boolean;
  user?: UserProfile;
}
