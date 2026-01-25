import {
  Citizen,
  CreateCitizenRequest,
  UpdateCitizenRequest,
  CitizenResponse,
  CitizenListResponse,
  SearchCitizenRequest,
} from '../types/citizen';

const API_BASE_URL = 'https://api.example.com';

// Mock data
const mockCitizens: Citizen[] = [
  {
    id: 'citizen-1',
    citizenId: '001234567890',
    name: 'NGUYỄN VĂN A',
    dateOfBirth: '15/03/1990',
    sex: 'Nam',
    nationality: 'Việt Nam',
    placeOfOrigin: 'Hà Nội, Việt Nam',
    placeOfResidence: 'Số 123, Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
    documentNumber: '001234567890',
    issueDate: '15/03/2020',
    expiryDate: '15/03/2035',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'citizen-2',
    citizenId: '001234567891',
    name: 'TRẦN THỊ B',
    dateOfBirth: '20/05/1992',
    sex: 'Nữ',
    nationality: 'Việt Nam',
    placeOfOrigin: 'Đà Nẵng, Việt Nam',
    placeOfResidence: 'Số 456, Đường DEF, Phường MNO, Quận 3, TP. Hồ Chí Minh',
    documentNumber: '001234567891',
    issueDate: '20/05/2019',
    expiryDate: '20/05/2034',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

/**
 * Lấy danh sách công dân
 */
export const getCitizens = async (): Promise<CitizenListResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/citizens`, {
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
          citizens: mockCitizens,
          total: mockCitizens.length,
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Get citizens error:', error);
    throw new Error('Lấy danh sách công dân thất bại.');
  }
};

/**
 * Lấy thông tin một công dân theo ID
 */
export const getCitizenById = async (
  citizenId: string
): Promise<CitizenResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/citizens/${citizenId}`, {
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const citizen = mockCitizens.find(c => c.id === citizenId);
        if (citizen) {
          resolve({
            success: true,
            message: 'Lấy thông tin thành công',
            citizen,
          });
        } else {
          reject(new Error('Không tìm thấy công dân'));
        }
      }, 800);
    });
  } catch (error) {
    console.error('Get citizen error:', error);
    throw error;
  }
};

/**
 * Tìm kiếm công dân
 */
export const searchCitizens = async (
  request: SearchCitizenRequest
): Promise<CitizenListResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const params = new URLSearchParams({
    //   query: request.query,
    //   ...(request.field && { field: request.field }),
    // });
    
    // const response = await fetch(`${API_BASE_URL}/citizens/search?${params}`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    
    // if (!response.ok) {
    //   throw new Error('Tìm kiếm thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const query = request.query.toLowerCase();
        const filtered = mockCitizens.filter(citizen => {
          if (request.field === 'citizenId') {
            return citizen.citizenId.includes(query);
          } else if (request.field === 'name') {
            return citizen.name.toLowerCase().includes(query);
          } else if (request.field === 'documentNumber') {
            return citizen.documentNumber.includes(query);
          } else {
            // Tìm kiếm tất cả các trường
            return (
              citizen.name.toLowerCase().includes(query) ||
              citizen.citizenId.includes(query) ||
              citizen.documentNumber.includes(query)
            );
          }
        });

        resolve({
          success: true,
          citizens: filtered,
          total: filtered.length,
        });
      }, 1200);
    });
  } catch (error) {
    console.error('Search citizens error:', error);
    throw new Error('Tìm kiếm công dân thất bại.');
  }
};

/**
 * Tạo mới thông tin công dân
 */
export const createCitizen = async (
  data: CreateCitizenRequest
): Promise<CitizenResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/citizens`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Tạo công dân thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCitizen: Citizen = {
          ...data,
          id: `citizen-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockCitizens.push(newCitizen);

        resolve({
          success: true,
          message: 'Tạo thông tin công dân thành công',
          citizen: newCitizen,
        });
      }, 1500);
    });
  } catch (error) {
    console.error('Create citizen error:', error);
    throw new Error('Tạo thông tin công dân thất bại.');
  }
};

/**
 * Cập nhật thông tin công dân
 */
export const updateCitizen = async (
  citizenId: string,
  data: UpdateCitizenRequest
): Promise<CitizenResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/citizens/${citizenId}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Cập nhật thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCitizens.findIndex(c => c.id === citizenId);
        if (index !== -1) {
          mockCitizens[index] = {
            ...mockCitizens[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };

          resolve({
            success: true,
            message: 'Cập nhật thông tin thành công',
            citizen: mockCitizens[index],
          });
        } else {
          reject(new Error('Không tìm thấy công dân'));
        }
      }, 1500);
    });
  } catch (error) {
    console.error('Update citizen error:', error);
    throw error;
  }
};

/**
 * Xóa thông tin công dân
 */
export const deleteCitizen = async (
  citizenId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/citizens/${citizenId}`, {
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCitizens.findIndex(c => c.id === citizenId);
        if (index !== -1) {
          mockCitizens.splice(index, 1);
          resolve({
            success: true,
            message: 'Xóa công dân thành công',
          });
        } else {
          reject(new Error('Không tìm thấy công dân'));
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Delete citizen error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin công dân theo số CCCD
 */
export const getCitizenByCCCDNumber = async (
  cccdNumber: string
): Promise<CitizenResponse> => {
  try {
    // Mock response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const citizen = mockCitizens.find(c => c.citizenId === cccdNumber);
        if (citizen) {
          resolve({
            success: true,
            message: 'Lấy thông tin thành công',
            citizen,
          });
        } else {
          reject(new Error('Không tìm thấy thông tin CCCD'));
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Get citizen by CCCD error:', error);
    throw error;
  }
};
