// File: src/sections/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/auth';

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });

  useEffect(() => {
    if (!state?.email || !state?.otp) {
      navigate('/forgot-password');
    }
  }, [state, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: '' });

    try {
      const { message } = await resetPassword({
        email: state.email,
        otp: state.otp,
        newPassword
      });
      setStatus({ loading: false, message, error: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setStatus({
        loading: false,
        message: '',
        error: err.response?.data?.message || err.message
      });
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            type="password"
            id="newPassword"
            className="form-control"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" disabled={status.loading}>
          {status.loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
      {status.message && <div className="alert alert-success mt-3">{status.message}</div>}
      {status.error   && <div className="alert alert-danger mt-3" >{status.error}</div>}
    </div>
  );
};

export default ResetPassword;
