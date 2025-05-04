import axios from 'axios';

// Ustawienie baseURL w zależności od środowiska
const baseURL = process.env.NODE_ENV === 'production'
  ? `${window.location.origin}/api`   // produkcja: proxy do tego samego hosta
  : `${process.env.REACT_APP_API_URL || 'http://localhost:8319'}/api`;

const api = axios.create({ baseURL });

// Dodanie tokenu do nagłówków
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
