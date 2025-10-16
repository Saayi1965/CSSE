import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { testBackendConnection } from '../api/api';
import '../styles/auth.css';
import RecyLinkLogo from '../assets/RecyLink_Logo.png';

export default function Signup({ onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('residential');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting registration for username:', username);
      
      const payload = {
        username: username.trim(),
        password: password.trim(),
        role: role
      };
      
      console.log('Sending payload:', payload);
      
      const res = await api.post('/auth/register', payload);
      console.log('Registration response:', res.data);
      
      const { token, role: userRole } = res.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('username', username);
      
      // Notify parent component
      if (onAuth) onAuth({ username, role: userRole });
      
      // Navigate to reports
      navigate('/reports');
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    const result = await testBackendConnection();
    if (result.success) {
      alert('✅ Backend connection successful!');
    } else {
      alert('❌ Backend connection failed: ' + result.error);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="auth-modal">
        <div className="auth-left">
          <img src={RecyLinkLogo} alt="RecyLink" style={{ width: 70, marginBottom: 20 }} />
          <h2 className="mb-3">Create an Account 🪴</h2>
          <p className="text-muted mb-4">Join RecyLink to track, report, and optimize your waste management.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <div className="input-block">
              <label className="input-label">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="input-block">
              <label className="input-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="input-block">
              <label className="input-label">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="collector">Waste Collector</option>
                <option value="residential">Residential User</option>
              </select>
            </div>
            <button className="btn btn-primary w-100 mt-2">Sign up</button>
          </form>
          <div className="auth-footer">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
        <div className="auth-right">
          <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80" alt="signup art" />
        </div>
      </div>
    </div>
  );
}
