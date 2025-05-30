import axios from 'axios';

const API_BASE_URL = 'https://driving-backend-stmb.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Other default headers if needed
  }
});

// Request interceptor to add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("Using token:", token); // Add this

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Handle case where there's no token (redirect to login?)
      console.warn('No authentication token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login'; // Or use your router
    }
    return Promise.reject(error);
  }
);

export default apiClient;
