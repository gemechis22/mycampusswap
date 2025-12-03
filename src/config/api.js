import axios from 'axios';

// Backend URL - change this if your Railway URL is different
const API_BASE_URL = 'https://mycampusswap-production.up.railway.app/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically if user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authAPI = {
  register: (email, password, displayName, role = 'student') =>
    api.post('/auth/register', { email, password, displayName, role }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

export const listingsAPI = {
  // Public - browse all active listings
  getActive: () => api.get('/listings'),
  
  // Student - create listing (requires auth)
  create: (listingData) => api.post('/listings', listingData),
  
  // Student - get my listings (requires auth)
  getMy: () => api.get('/listings/my'),
  
  // Admin - get pending listings (requires admin)
  getPending: () => api.get('/listings/pending'),
  
  // Admin - approve listing (requires admin)
  approve: (id) => api.post(`/listings/${id}/approve`),
  
  // Admin - reject listing (requires admin)
  reject: (id) => api.post(`/listings/${id}/reject`),
};

export default api;
