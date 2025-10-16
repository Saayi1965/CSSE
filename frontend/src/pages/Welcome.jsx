import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';
import RecyLinkLogo from '../assets/RecyLink_Logo.png';

export default function Welcome() {
  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="auth-modal">
        <div className="auth-left">
          <img src={RecyLinkLogo} alt="RecyLink" style={{ width: 80, marginBottom: 20 }} />
          <h1 className="mb-2" style={{ color: '#1E293B' }}>Welcome to RecyLink</h1>
          <p style={{ color: '#64748B' }}>
            Smart waste insights and collection management made simple.  
            Sign in to view reports or create an account to get started.
          </p>
          <div className="d-flex gap-3 mt-4">
            <Link to="/login" className="btn btn-primary w-50">Sign in</Link>
            <Link to="/signup" className="btn btn-outline-primary w-50" style={{ border: '2px solid #10B981', color: '#10B981' }}>Create account</Link>
          </div>
        </div>
        <div className="auth-right">
          <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60" alt="waste collection" />
        </div>
      </div>
    </div>
  );
}
