import axios from 'axios';

// Backend URL
// Prefer Vite env var when present (e.g., on Vercel), fallback to Railway URL for local/dev.
const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || 'https://mycampusswap-production.up.railway.app/api';

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

export const buyRequestsAPI = {
  // Student - create a buy request for a listing (requires auth)
  create: (listing_id) => api.post('/buy-requests', { listing_id }),
  
  // Seller - get pending buy requests received (requires auth)
  getIncoming: () => api.get('/buy-requests/incoming'),
  
  // Buyer - get all buy requests made by user (requires auth)
  getMy: () => api.get('/buy-requests/my'),
  
  // Seller - accept a buy request (requires auth)
  accept: (id) => api.post(`/buy-requests/${id}/accept`),
  
  // Seller - reject a buy request (requires auth)
  reject: (id) => api.post(`/buy-requests/${id}/reject`),
};

export default api;
