import axios from 'axios';

const API_BASE_URL = 'https://driving-backend-stmb.onrender.com/api';

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
});

// Add request interceptor to inject token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // This returns null!

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchCourses() {
  try {
    const response = await apiClient.get('/courses');

    // Debug log to inspect the response structure
    console.log('Courses API response:', response.data);

    // Return the correct array, assuming it's nested in `.data`
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || []; // adjust based on actual API shape
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}




export const fetchCourseById = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    throw error;
  }
};