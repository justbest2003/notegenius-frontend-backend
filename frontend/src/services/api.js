import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Notes API
export const notesApi = {
  getAll: () => api.get('/notes'),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  search: (query) => api.get(`/notes/search?q=${query}`),
};


// AI API
export const aiApi = {
  summarize: (content) => api.post('/ai/summarize', { content }),
  autoTag: (content) => api.post('/ai/auto-tag', { content }),
  ocr: (formData) => api.post('/ai/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  voiceToText: (formData) => api.post('/ai/voice-to-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};


// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  getStats: () => api.get('/users/stats'),
};

export default api;
