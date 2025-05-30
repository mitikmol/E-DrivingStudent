import api from './api';

export const signup = userData =>
  api.post('/auth/signup', userData).then(res => res.data);

export const login = credentials =>
  api.post('/auth/signin', credentials).then(res => res.data);

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const getCurrentUser = () =>
  JSON.parse(localStorage.getItem('userData') || 'null');

export const isAuthenticated = () =>
  !!localStorage.getItem('token');

// ——— Forgot Password Flow ———
export const sendOTP = email =>
  api.post('/auth/forgot-password/send-otp', { email }).then(res => res.data);

export const verifyOTP = ({ email, otp }) =>
  api.post('/auth/forgot-password/verify-otp', { email, otp }).then(res => res.data);

export const resetPassword = ({ email, otp, newPassword }) =>
  api.post('/auth/forgot-password/reset', { email, otp, newPassword }).then(res => res.data);
