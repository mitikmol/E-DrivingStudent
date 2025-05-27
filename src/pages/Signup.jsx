import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, login } from '../services/auth';
import AuthContext from '../context/AuthContext';

const Signup = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message
  const navigate = useNavigate();
  const { updateAuthInfo } = useContext(AuthContext);

const validateForm = () => {
  const newErrors = {};

  if (!form.firstName.trim()) {
    newErrors.firstName = 'First name is required';
  } else if (!/^[A-Za-z]+$/.test(form.firstName)) {
    newErrors.firstName = 'First name should only contain letters';
  }

  if (!form.lastName.trim()) {
    newErrors.lastName = 'Last name is required';
  } else if (!/^[A-Za-z]+$/.test(form.lastName)) {
    newErrors.lastName = 'Last name should only contain letters';
  }

 if (!form.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[a-z][a-z0-9.]*@[a-z][a-z0-9.]*$/.test(form.email)) {
    newErrors.email = 'Email must start with a letter, contain only lowercase letters, numbers, and dots before and after "@", and not start with a number.';
  }

  if (!form.phoneNumber.trim()) {
    newErrors.phoneNumber = 'Phone number is required';
  } else if (!/^(09|07)\d{8}$/.test(form.phoneNumber)) {
    newErrors.phoneNumber = 'Phone number must start with 09 or 07 and be 10 digits';
  }

  if (!form.password) {
    newErrors.password = 'Password is required';
  } else if (form.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const signupResponse = await signup(form);
      const loginResponse = await login({
        identifier: form.email,
        password: form.password
      });

      localStorage.setItem('authToken', loginResponse.token);
      localStorage.setItem('userData', JSON.stringify(loginResponse.user));
      updateAuthInfo({ isAuthenticated: true, user: loginResponse.user });

      setSuccessMessage('Successfully signed up!'); // Set success message
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
      
    } catch (err) {
      console.error('Signup Error:', err);
      alert(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: 'rgb(18, 32, 47)' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold">Get Started</h2>
          <p className="text-muted">Create your account to continue</p>
        </div>

        {successMessage && ( // Display success message
          <div className="alert alert-success text-center" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.firstName && 'is-invalid'}`}
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.lastName && 'is-invalid'}`}
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>

            <div className="col-12">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email && 'is-invalid'}`}
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="col-12">
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${errors.phoneNumber && 'is-invalid'}`}
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
              </div>
            </div>

            <div className="col-12">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password && 'is-invalid'}`}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder=""
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <div className="col-12">
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </>
                ) : 'Sign Up'}
              </button>
            </div>

            <div className="col-12 text-center mt-3">
              Already have an account? <Link to="/login" className="text-decoration-none">Sign in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
