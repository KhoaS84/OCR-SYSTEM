import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth';

// URL API - thay đổi theo backend thực tế
const API_BASE_URL = 'https://api.example.com';

export const loginUser = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  try {
    // Giả lập API call - thay thế bằng fetch thực tế
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Đăng nhập thất bại');
    // }
    
    // return await response.json();

    // Mock response - để test UI
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Giả lập kiểm tra thông tin đăng nhập
        if (data.username && data.password) {
          resolve({
            success: true,
            message: 'Đăng nhập thành công',
            token: 'mock-jwt-token-123456',
            user: {
              id: '1',
              username: data.username,
              email: 'user@example.com',
            },
          });
        } else {
          reject(new Error('Tài khoản hoặc mật khẩu không đúng'));
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
  }
};

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    // Giả lập API call - thay thế bằng fetch thực tế
    // const response = await fetch(`${API_BASE_URL}/auth/register`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Đăng ký thất bại');
    // }
    
    // return await response.json();

    // Mock response - để test UI
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Đăng ký thành công',
          requiresCCCDVerification: true,
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Register error:', error);
    throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
  }
};

export const verifyCCCD = async (): Promise<void> => {
  // Logic xác thực CCCD - sẽ được implement sau
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
};
