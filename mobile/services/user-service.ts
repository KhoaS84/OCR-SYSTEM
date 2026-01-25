import {
  User,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetProfileResponse,
} from '../types/user';

const API_BASE_URL = 'https://api.example.com';

// Mock data
const mockUser: UserProfile = {
  id: 'user-1',
  username: 'nguyenvana',
  email: 'nguyenvana@example.com',
  fullName: 'Nguyễn Văn A',
  phoneNumber: '0912345678',
  avatar: 'https://i.pravatar.cc/300',
  isVerified: true,
  cccdVerified: true,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date().toISOString(),
  citizenData: {
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
  },
};

/**
 * Lấy thông tin profile người dùng hiện tại
 */
export const getUserProfile = async (): Promise<GetProfileResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/users/profile`, {
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
          user: mockUser,
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error('Lấy thông tin người dùng thất bại.');
  }
};

/**
 * Cập nhật thông tin profile
 */
export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/users/profile`, {
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
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Cập nhật thông tin thành công',
          user: {
            ...mockUser,
            ...data,
            updatedAt: new Date().toISOString(),
          },
        });
      }, 1500);
    });
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('Cập nhật thông tin thất bại.');
  }
};

/**
 * Thay đổi mật khẩu
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ oldPassword, newPassword }),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Đổi mật khẩu thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (oldPassword === 'wrongpassword') {
          reject(new Error('Mật khẩu cũ không đúng'));
        } else {
          resolve({
            success: true,
            message: 'Đổi mật khẩu thành công',
          });
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (
  imageUri: string
): Promise<UpdateProfileResponse> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const formData = new FormData();
    // formData.append('avatar', {
    //   uri: imageUri,
    //   type: 'image/jpeg',
    //   name: 'avatar.jpg',
    // } as any);
    
    // const response = await fetch(`${API_BASE_URL}/users/avatar`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: formData,
    // });
    
    // if (!response.ok) {
    //   throw new Error('Upload avatar thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Upload avatar thành công',
          user: {
            ...mockUser,
            avatar: imageUri,
            updatedAt: new Date().toISOString(),
          },
        });
      }, 1500);
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw new Error('Upload avatar thất bại.');
  }
};

/**
 * Xóa tài khoản
 */
export const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Thay thế bằng API thực tế
    // const response = await fetch(`${API_BASE_URL}/users/account`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    
    // if (!response.ok) {
    //   throw new Error('Xóa tài khoản thất bại');
    // }
    
    // return await response.json();

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Xóa tài khoản thành công',
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Delete account error:', error);
    throw new Error('Xóa tài khoản thất bại.');
  }
};
