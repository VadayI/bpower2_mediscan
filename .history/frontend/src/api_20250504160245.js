import axios from 'axios';

// Ustawienie baseURL w zależności od środowiska
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8319';
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default api;
