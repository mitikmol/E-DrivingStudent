import axios from 'axios';

const API_BASE_URL = 'https://driving-backend-stmb.onrender.com/api';

// Configure axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
});

// Add request interceptor to inject token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration here if needed
      console.error('Authentication failed - please login again');
    }
    return Promise.reject(error);
  }
);

export const registerStudent = async (formData) => {
  const fd = new FormData();
  
  // Append all required fields
  fd.append('first_name', formData.first_name);
  fd.append('middle_name', formData.middle_name || '');
  fd.append('last_name', formData.last_name);
  fd.append('email', formData.email);
  fd.append('age', formData.age);
  fd.append('sex', formData.sex);
  fd.append('phone_number', formData.phone_number);
  fd.append('education_level', formData.education_level);
  fd.append('state', formData.state);
  fd.append('zone', formData.zone);
  fd.append('woreda', formData.woreda);
  fd.append('city', formData.city);
  fd.append('kebele', formData.city);

  fd.append('emergency_contact_name', formData.emergency_contact_name);
  fd.append('emergency_contact_phone', formData.emergency_contact_phone);
  
fd.append('emergency_contact_relationship', formData.emergency_contact_relationship);

  
  // Append files
  if (formData.national_id) fd.append('national_id', formData.national_id);
  if (formData.educational_certificate) fd.append('educational_certificate', formData.educational_certificate);
  if (formData.medical_report) fd.append('medical_report', formData.medical_report);
  if (formData.user_image) fd.append('user_image', formData.user_image);

  return apiClient.post('/register/create', fd);
};

export const enrollCourse = async (courseId, studentId) => {
  return apiClient.post(`/enrollments/create/${courseId}`, {
    student_id: studentId
  });
};

export const cancelEnrollment = async (enrollmentId) => {
  return apiClient.delete(`/enrollments/${enrollmentId}`);
};

export const createPayment = async (enrollmentId, amount, paymentProof) => {
  const fd = new FormData();
  fd.append('enrollmentId', enrollmentId);
  fd.append('amount', amount);
  fd.append('paymentProof', paymentProof);

  return apiClient.post('/payments', fd, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getCourseProgressSummary = (courseId) =>
  apiClient.get(`/progress/course/${courseId}/summary`);

export const getUserProgressForCourse = (courseId) =>
  apiClient.get(`/progress/course/${courseId}`);

export const getLessonProgress = (lessonId) =>
  apiClient.get(`/progress/lesson/${lessonId}`);

export const completeLesson = (lessonId) =>
  apiClient.post(`/progress/complete/${lessonId}`);
export const getCourseProgressDetails = (courseId) =>
  apiClient.get(`/progress/course/${courseId}`); 




// Verify token validity
export const verifyToken = async () => {
  return apiClient.get('/verify-token');
};

export { apiClient };

