// src/pages/Login.jsx
import assets from '../assets/logo.png';
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DocumentStatusContext } from '../context/DocumentStatusContext';
import apiClient from '../services/apiClient'; // Adjust the import path as necessary

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { markSubmitted } = useContext(DocumentStatusContext);

  const api = apiClient;


  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      // 1) Send credentials
      const { data } = await api.post('/auth/signin', {
        identifier: form.email,
        password:   form.password
      });
      console.log('LOGIN RESPONSE:', data);
  

      // CORRECT: drill into data.user
      const { token, user: wrapper } = data;
      const { user, documentStatus = 'not_submitted' } = wrapper;
      const { id, email, firstName, lastName, phoneNumber } = user;
  
      // 3) Persist into localStorage
      localStorage.setItem('token',      token);
      localStorage.setItem('userId',         id.toString());
      localStorage.setItem('userData',       JSON.stringify({
        id,
        email,
        firstName,
        lastName,
        phoneNumber
      }));
      localStorage.setItem('documentStatus', documentStatus);
  
      // 4) Update context if docs already submitted
      // if (documentStatus === 'submitted') {
      //   markSubmitted();
      // }
  
      // 5) Redirect
      navigate('/LandingPage');

  
    } catch (err) {
      console.error('Login Error:', err);
      alert(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: 'rgb(18, 32, 47)' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-6 d-flex justify-content-center">
          <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="text-center mb-4">
              <h2 className="fw-bold">Welcome back!</h2>
              <p className="text-muted">Please enter your details.</p>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email && 'is-invalid'}`}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password && 'is-invalid'}`}
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                </div>
                <Link to="/forgot-password" className="text-decoration-none">Forgot password?</Link>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                Don't have an account? <Link to="/signup" className="text-decoration-none">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
