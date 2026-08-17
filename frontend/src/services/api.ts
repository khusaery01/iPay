import axios from 'axios';

// Mengambil Base URL dari Environment Variables
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor untuk melampirkan Bearer Token secara otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ipay_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor untuk mendeteksi error global (seperti token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token jika unauthorized
      localStorage.removeItem('ipay_token');
      // Redirect ke login secara manual jika di luar konteks router
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
