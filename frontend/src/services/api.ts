import axios from 'axios';

// Mengambil Base URL secara cerdas (prioritaskan VITE_API_URL, fallback ke IP/hostname browser)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname === '0.0.0.0') {
      return 'http://127.0.0.1:8000/api';
    }
    return `http://${hostname}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor untuk melampirkan Bearer Token dan memastikan baseURL dinamis
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
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

// Flag untuk mencegah loop redirect berulang-ulang
let isRedirecting = false;

// Response Interceptor untuk mendeteksi error global (seperti token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ipay_token');
      localStorage.removeItem('ipay_user_name');
      localStorage.removeItem('ipay_user_id');

      if (!isRedirecting && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          isRedirecting = true;
          window.location.replace('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
