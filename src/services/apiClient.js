import axios from 'axios';

const API_BASE_URL = 'https://driving-backend-stmb.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
});

// ✅ Add request interceptor to inject token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // MUST match login setItem
  console.log('Injecting token into request:', token); // Debug

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;
