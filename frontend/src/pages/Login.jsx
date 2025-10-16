import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/auth.css';
import RecyLinkLogo from '../assets/RecyLink_Logo.png';

export default function Login({ onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: username.trim(), password };
      const res = await api.post('/auth/login', payload);
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      if (onAuth) onAuth({ username, role });
      // Navigate based on role
      if (role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'ROLE_COLLECTOR') {
        navigate('/collector/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      // show server response in console for debugging
      console.debug('Login error response:', err?.response);
      setError(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="auth-modal">
        <div className="auth-left">
          <img src={RecyLinkLogo} alt="RecyLink" style={{ width: 70, marginBottom: 20 }} />
          <h2 className="mb-3">Welcome back 👋</h2>
          <p className="text-muted mb-4">Login to access your RecyLink dashboard.</p>
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
            <button className="btn btn-primary w-100 mt-2">Sign in</button>
          </form>
          <div className="auth-footer">
            Don’t have an account? <a href="/signup">Sign up</a>
          </div>
        </div>
        <div className="auth-right">
          <img src="https://images.unsplash.com/photo-1526403224742-8b5f5b1d12d8?auto=format&fit=crop&w=1000&q=80" alt="login art" />
        </div>
      </div>
    </div>
  );
}
