// File: src/sections/VerifyOTP.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP } from '../services/auth';

const VerifyOTP = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // if user landed here directly, kick back to forgot-password
  useEffect(() => {
    if (!state?.email) navigate('/forgot-password');
  }, [state, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyOTP({ email: state.email, otp });
      navigate('/reset-password', { state: { email: state.email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={state?.email || ''}
            readOnly
          />
        </div>
        <div className="mb-3">
          <label htmlFor="otp" className="form-label">OTP</label>
          <input
            type="text"
            id="otp"
            className="form-control"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default VerifyOTP;
