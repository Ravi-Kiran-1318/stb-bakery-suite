import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && originalRequest.url !== '/auth/me' && originalRequest.url !== '/auth/login') {
      window.location.href = '/login';
    } else if (error.response && error.response.status === 403) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
