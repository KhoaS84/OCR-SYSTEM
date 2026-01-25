export const DUMMY_USER = {
  id: '1',
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@email.com',
  phone: '0912345678'
};

export const DUMMY_CCCD = {
  id: '001099012345',
  fullName: 'NGUYỄN VĂN AN',
  dob: '15/08/1990',
  gender: 'Nam',
  nationality: 'Việt Nam',
  placeOfOrigin: 'Hà Nội',
  placeOfResidence: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
  issueDate: '01/01/2020',
  expiryDate: 'Không thời hạn',
  photo: null // In real app, this would be an image URI
};

export const DUMMY_GPLX = {
  licenseNumber: 'B2-012345678',
  fullName: 'NGUYỄN VĂN AN',
  dob: '15/08/1990',
  class: 'B2',
  issueDate: '20/03/2018',
  expiryDate: '20/03/2028',
  placeOfIssue: 'Cục CSGT - Bộ Công An',
  photo: null
};

export const DUMMY_BHYT = {
  cardNumber: 'DN4011234567890',
  fullName: 'NGUYỄN VĂN AN',
  dob: '15/08/1990',
  gender: 'Nam',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  startDate: '01/01/2024',
  expiryDate: '31/12/2024',
  hospital: 'Bệnh viện Đa khoa Đà Nẵng',
  photo: null
};

export const DUMMY_SCAN_RESULT = {
  documentType: 'CCCD',
  extractedData: {
    'Số CCCD': '001099012345',
    'Họ và tên': 'NGUYỄN VĂN AN',
    'Ngày sinh': '15/08/1990',
    'Giới tính': 'Nam',
    'Quốc tịch': 'Việt Nam',
    'Quê quán': 'Hà Nội',
    'Nơi thường trú': '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM'
  },
  confidence: 98.5,
  timestamp: new Date().toISOString()
};