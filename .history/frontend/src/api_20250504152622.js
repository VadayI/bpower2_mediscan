import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? '/api'                // proxy przez ten sam host+HTTPS
  : (process.env.REACT_APP_API_URL || 'http://localhost:8319') + '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default api;