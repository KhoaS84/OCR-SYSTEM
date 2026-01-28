// Thêm API cập nhật CCCD và BHYT cho admin
import { API_BASE_URL, getAuthHeader, handleResponse } from './api';

export const updateCCCD = async (documentId, data) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents/cccd/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateBHYT = async (documentId, data) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents/bhyt/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
