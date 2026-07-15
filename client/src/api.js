import axios from 'axios';

// Base URL — server mounts all routes at /api/v1
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When accessed via network IP or localhost, use same host with backend port
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Local development (localhost, 127.0.0.1, or LAN IP like 192.168.x.x)
    if (host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
      return `http://${host}:5000/api/v1`;
    }
  }
  return 'https://stunning-beauty.onrender.com/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Attach JWT token automatically if stored
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
