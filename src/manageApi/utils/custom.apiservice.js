// src/utils/apiService.js
import axios from 'axios';
import { showToast } from './toast';

// const API_BASE_URL = 'http://localhost:5000/api/';
// const API_BASE_URL = 'https://kotiboxglobaltech.online/api/';
const API_BASE_URL = 'https://xoto.ae/api/';


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,  
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    
    // YAHAN LOGIC CHANGE KIYA HAI
    if (token) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error?.message || 'Something went wrong';

      // 1. ❌ Suppress upgrade-limit message
      if (errorMessage?.toLowerCase().includes('generate more images')) {
        return Promise.reject(error);
      }

      // 2. ❌ Suppress "Customer not found" message (Frontend hand-to-hand modal handles this)
      if (errorMessage === "Customer not found") {
        return Promise.reject(error);
      }

      // Baaki sabhi cases mein toast dikhao
      showToast(errorMessage, 'error');
    }

    return Promise.reject(error);
  }
);


// Generic HTTP methods
export const apiService = {
  get: async (url, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  put: async (url, data) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (url) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  upload: async (url, formData, onUploadProgress) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  download: async (url, fileName) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (error) {
      throw error;
    }
  },
};