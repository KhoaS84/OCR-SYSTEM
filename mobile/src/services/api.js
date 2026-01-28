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

  async refreshToken() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        ...headers,
      },
    });
    
    const data = await handleResponse(response);
    if (data.access_token) {
      await AsyncStorage.setItem('token', data.access_token);
    }
    return data;
  },

  async getMe() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        ...headers,
      },
    });
    
    return handleResponse(response);
  },

  async logout() {
    await AsyncStorage.removeItem('token');
  },
};

// OCR API
export const ocrAPI = {
  async processDocument(documentId) {
    try {
      const headers = await getAuthHeader();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ocr/process/${documentId}`, {
        method: 'POST',
        headers: {
          ...headers,
        },
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
  async getAll() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/`, {
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
};

// Documents API
export const documentsAPI = {
  async uploadCCCD(frontUri, backUri) {
    console.log('📤 documentsAPI.uploadCCCD - Front:', frontUri, 'Back:', backUri);
    if (!frontUri) throw new Error('Thiếu ảnh mặt trước CCCD');
    if (!backUri) throw new Error('Thiếu ảnh mặt sau CCCD');
    const formData = new FormData();
    // Parse filename from URI
    const frontParts = (frontUri || '').split('/');
    const frontName = frontParts[frontParts.length - 1];
    const backParts = (backUri || '').split('/');
    const backName = backParts[backParts.length - 1];
    formData.append('front', {
      uri: frontUri,
      type: 'image/jpeg',
      name: frontName || 'front.jpg',
    });
    formData.append('back', {
      uri: backUri,
      type: 'image/jpeg',
      name: backName || 'back.jpg',
    });
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload/cccd`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.uploadCCCD - Response:', JSON.stringify(result, null, 2));
    return result;
  },

  async uploadBHYT(imageUri) {
    console.log('📤 documentsAPI.uploadBHYT - Image:', imageUri);
    if (!imageUri) throw new Error('Thiếu ảnh thẻ BHYT');
    const formData = new FormData();
    const uriParts = (imageUri || '').split('/');
    const fileName = uriParts[uriParts.length - 1];
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName || 'bhyt.jpg',
    });
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload/bhyt`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.uploadBHYT - Response:', JSON.stringify(result, null, 2));
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

  async getAll() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/`, {
      headers: {
        ...headers,
      },
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

  async saveCCCDData(cccdData) {
    console.log('💾 documentsAPI.saveCCCDData:', cccdData);
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/save-cccd-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(cccdData),
    });
    
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.saveCCCDData - Response:', result);
    return result;
  },

  async saveBHYTData(bhytData) {
    console.log('💾 documentsAPI.saveBHYTData:', bhytData);
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/save-bhyt-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(bhytData),
    });
    
    const result = await handleResponse(response);
    console.log('✅ documentsAPI.saveBHYTData - Response:', result);
    return result;
  },

  // Lấy CCCD data đầy đủ theo citizen ID
  async getCCCDByCitizen(citizenId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/api/v1/documents/cccd/by-citizen/${citizenId}`, {
        headers: {
          ...headers,
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.warn('🚫 getCCCDByCitizen failed:', error.message);
      throw error;
    }
  },

  // Lấy BHYT data đầy đủ theo citizen ID
  async getBHYTByCitizen(citizenId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/api/v1/documents/bhyt/by-citizen/${citizenId}`, {
        headers: {
          ...headers,
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.warn('🚫 getBHYTByCitizen failed:', error.message);
      throw error;
    }
  },
};

export default {
  authAPI,
  ocrAPI,
  citizensAPI,
  documentsAPI,
};
