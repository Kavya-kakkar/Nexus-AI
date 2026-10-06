import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // trigger storage event so listeners can update auth state
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },
  register: async (username, password) => {
    const res = await api.post('/auth/register', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateMe: async (userData) => {
    const res = await api.put('/auth/me', userData);
    return res.data;
  },
};

export const documentsApi = {
  list: async () => {
    const res = await api.get('/documents/');
    return res.data;
  },
  upload: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return res.data;
  },
  delete: async (documentId) => {
    const res = await api.delete(`/documents/${documentId}`);
    return res.data;
  },
  getMediaUrl: (documentId) => {
    return `${API_URL}/documents/media/${documentId}`;
  },
};

export const chatApi = {
  sendQuestion: async (question) => {
    const res = await api.post('/chat/', { question });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/chat/history');
    return res.data;
  },
  deleteHistory: async () => {
    const res = await api.delete('/chat/history');
    return res.data;
  },
};

export default api;
