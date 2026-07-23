import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://tunkitek-backend.onrender.com';
const cleanedApiUrl = rawApiUrl.replace(/[\[\]]/g, '').trim();

const api = axios.create({
  baseURL: cleanedApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar dinámicamente el token JWT si existe en localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tunkitek_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
