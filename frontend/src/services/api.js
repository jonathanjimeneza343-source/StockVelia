import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.trim().replace(/\/$/, '')
  : 'http://localhost:5000';

const baseURL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const API = axios.create({
  baseURL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.includes('/auth/login');
    if ((status === 401 || status === 403) && !isAuthRoute) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;