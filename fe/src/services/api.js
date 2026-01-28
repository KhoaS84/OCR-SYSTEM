/**
 * API Service - Kết nối Frontend với Backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function để lấy token
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper function để xử lý response
export const handleResponse = async (response) => {
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
      body: formData,
    });
    
    const data = await handleResponse(response);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
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

  logout() {
    localStorage.removeItem('token');
  },
};

// OCR API
export const ocrAPI = {
  async detectDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/detect`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async extractText(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/extract`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async ocrOnly(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/ocr`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async getJobStatus(jobId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/status/${jobId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async getResults(documentId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/ocr/results/${documentId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },
};

// Citizens API
export const citizensAPI = {
  async search(query) {
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/search?q=${encodeURIComponent(query)}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/${id}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async create(citizenData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(citizenData),
    });
    
    return handleResponse(response);
  },

  async update(id, citizenData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(citizenData),
    });
    
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/api/v1/citizens/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async getCCCDByCitizen(citizenId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/cccd/by-citizen/${citizenId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  async getBHYTByCitizen(citizenId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/bhyt/by-citizen/${citizenId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Documents API
export const documentsAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async upload(file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  async getMe() {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async updateProfile(userData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  async changePassword(oldPassword, newPassword) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
    
    return handleResponse(response);
  },

  // Admin: User Management
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    return handleResponse(response);
  },

  async updateUser(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
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
