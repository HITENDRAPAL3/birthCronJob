import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
};

// Birthday API
export const birthdayApi = {
  getAll: () => 
    api.get('/birthdays'),
  
  getById: (id) => 
    api.get(`/birthdays/${id}`),
  
  create: (birthday) => 
    api.post('/birthdays', birthday),
  
  update: (id, birthday) => 
    api.put(`/birthdays/${id}`, birthday),
  
  delete: (id) => 
    api.delete(`/birthdays/${id}`),
  
  getUpcoming: (days = 30) => 
    api.get(`/birthdays/upcoming?days=${days}`),
  
  search: (name) => 
    api.get(`/birthdays/search?name=${encodeURIComponent(name)}`),

  getByCategory: (categoryId) =>
    api.get(`/birthdays/category/${categoryId}`),

  getAnalytics: () =>
    api.get('/birthdays/analytics'),

  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/birthdays/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportIcal: () =>
    api.get('/birthdays/export/ical', { responseType: 'blob' }),
};

// Category API
export const categoryApi = {
  getAll: () =>
    api.get('/categories'),

  getById: (id) =>
    api.get(`/categories/${id}`),

  create: (category) =>
    api.post('/categories', category),

  update: (id, category) =>
    api.put(`/categories/${id}`, category),

  delete: (id) =>
    api.delete(`/categories/${id}`),
};

// Settings API
export const settingsApi = {
  get: () => 
    api.get('/settings'),
  
  update: (settings) => 
    api.put('/settings', settings),
};

// Wish API
export const wishApi = {
  generate: (birthdayId, count = 5, tone = null) => {
    let url = `/wishes/${birthdayId}?count=${count}`;
    if (tone) url += `&tone=${tone}`;
    return api.get(url);
  },

  getTones: () =>
    api.get('/wishes/tones'),
};

export default api;
