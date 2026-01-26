/**
 * API Service - Kết nối Mobile App với Backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Lấy URL từ environment variable (.env)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

console.log('🌐 API Base URL:', API_BASE_URL);

// Helper function để lấy token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper function để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const data = await handleResponse(response);
    if (data.access_token) {
      await AsyncStorage.setItem('token', data.access_token);
    }
    return data;
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  async logout() {
    await AsyncStorage.removeItem('token');
  },
};

// OCR API
export const ocrAPI = {
  async detectDocument(fileUri) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'document.jpg',
      });
      
      const headers = await getAuthHeader();
      
      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ocr/detect`, {
        method: 'POST',
        headers: {
          ...headers,
        },
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Xử lý ảnh mất quá lâu');
      }
      throw error;
    }
  },

  async extractText(fileUri) {
    try {
      console.log('🚀 Starting OCR extract for:', fileUri);
      
      // Tạo FormData với React Native format
      const formData = new FormData();
      
      // Parse filename from URI
      const uriParts = fileUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      console.log('📝 File name:', fileName);
      
      // Thêm file với format đúng cho React Native
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: fileName || 'photo.jpg',
      });
      
      const headers = await getAuthHeader();
      
      console.log('🔑 Auth headers:', headers);
      console.log('📤 Sending request to:', `${API_BASE_URL}/api/v1/ocr/extract`);
      console.log('📦 FormData created');
      
      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ocr/extract`, {
        method: 'POST',
        headers: {
          ...headers,
          // Không set Content-Type, để browser tự động set với boundary
        },
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      const result = await handleResponse(response);
      console.log('✅ OCR extract result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ OCR extract error:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Xử lý ảnh mất quá lâu');
      }
      throw error;
    }
  },

  async ocrOnly(fileUri) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'document.jpg',
      });
      
      const headers = await getAuthHeader();
      
      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ocr/ocr`, {
        method: 'POST',
        headers: {
          ...headers,
        },
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Xử lý ảnh mất quá lâu');
      }
      throw error;
    }
  },

  async getJobStatus(jobId) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/status/${jobId}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async getResults(documentId) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/results/${documentId}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },
};

// Citizens API
export const citizensAPI = {
  async search(query) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/search?q=${encodeURIComponent(query)}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async getById(id) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/${id}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async create(citizenData) {
    console.log('📤 citizensAPI.create - Input:', JSON.stringify(citizenData, null, 2));
    
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(citizenData),
    });
    
    return handleResponse(response);
  },

  async update(id, citizenData) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(citizenData),
    });
    
    return handleResponse(response);
  },

  async delete(id) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },
};

// Documents API
export const documentsAPI = {
  async createCCCD(cccdData) {
    console.log('📤 documentsAPI.createCCCD - Input:', JSON.stringify(cccdData, null, 2));
    console.log('📤 Issue date type:', typeof cccdData.issue_date, 'Value:', cccdData.issue_date);
    console.log('📤 Expire date type:', typeof cccdData.expire_date, 'Value:', cccdData.expire_date);
    
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/cccd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(cccdData),
    });
    
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.createCCCD - Response:', JSON.stringify(result, null, 2));
    return result;
  },

  async getCCCDByCitizen(citizenId) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/cccd/${citizenId}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async createGPLX(gplxData) {
    console.log('📤 documentsAPI.createGPLX - Input:', JSON.stringify(gplxData, null, 2));
    
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/gplx/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(gplxData),
    });
    
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.createGPLX - Response:', JSON.stringify(result, null, 2));
    return result;
  },

  async createBHYT(bhytData) {
    console.log('📤 documentsAPI.createBHYT - Input:', JSON.stringify(bhytData, null, 2));
    
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/bhyt/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(bhytData),
    });
    
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.createBHYT - Response:', JSON.stringify(result, null, 2));
    return result;
  },

  async getCCCDByCitizen(citizenId) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/cccd/${citizenId}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async getGPLXByCitizen(citizenId) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/gplx/${citizenId}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async getBHYTByCitizen(citizenId) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/bhyt/${citizenId}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async getAll() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
      headers: {
        ...headers,
      },
    });
    
    const result = await handleResponse(response);
    console.log('📋 documentsAPI.getAll - Response:', JSON.stringify(result, null, 2));
    return result;
  },

  async getById(id) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async upload(fileUri, documentType) {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'document.jpg',
    });
    formData.append('document_type', documentType);
    
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async delete(id) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  async getMe() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async updateProfile(userData) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  async changePassword(oldPassword, newPassword) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
    
    return handleResponse(response);
  },
};

export default {
  authAPI,
  ocrAPI,
  citizensAPI,
  documentsAPI,
  usersAPI,
};
