import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecyLinkLogo from '../assets/RecyLink_Logo.png'; // 👈 make sure the image is inside src/assets/

export default function Sidebar({ user, onLogout }) {
  const [activeItem, setActiveItem] = useState('reports');
  const navigate = useNavigate();

  const baseMenu = [
    { id: 'reports', label: 'Reports', icon: '📊', badge: 3 },
  ];

  const adminMenu = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: '🏢' },
    { id: 'monitor-bin-level', label: 'Monitor Bin Level', icon: '📦' },
    { id: 'user-details', label: 'User Details', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const collectorMenu = [
    { id: 'collector-dashboard', label: 'Collector Dashboard', icon: '🗺️' },
    { id: 'routes', label: 'Routes', icon: '🛣️' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚛' },
    { id: 'pickup-history', label: 'Pickup History', icon: '🧾' }
  ];

  // RecyLink color theme
  const colors = {
    primary: '#4A90E2',  // Blue
    accent: '#10B981',   // Green
    warm: '#F39C12',     // Orange
    deep: '#6A1B9A',     // Purple
    lightBg: '#F7FAFC',  // Light gray background
    textDark: '#1E293B',
  };

  return (
    <div
      className="vh-100 d-flex flex-column border-end shadow-sm"
      style={{
        width: 250,
        padding: '24px 16px',
        backgroundColor: colors.lightBg,
      }}
    >
      {/* Logo Section */}
      <div className="d-flex align-items-center mb-4">
        <img
          src={RecyLinkLogo}
          alt="RecyLink Logo"
          style={{
            width: 40,
            height: 40,
            objectFit: 'contain',
            borderRadius: '8px',
            backgroundColor: 'white',
            padding: 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        />
        <div className="ms-3">
          <h6 className="fw-bold mb-0" style={{ color: colors.deep }}>
            RecyLink
          </h6>
          <small className="text-muted">Smart Waste Hub</small>
        </div>
      </div>

      {/* Today's Progress */}
      <div
        className="rounded-3 p-3 mb-4"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
          color: 'white',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small">Today's Progress</span>
          <span className="fw-bold">24/30</span>
        </div>
        <div className="progress bg-white bg-opacity-25" style={{ height: 6 }}>
          <div
            className="progress-bar"
            style={{
              width: '80%',
              backgroundColor: 'white',
            }}
          ></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1">
        {[...baseMenu,
          ...(user && user.role === 'ROLE_ADMIN' ? adminMenu : []),
          ...(user && user.role === 'ROLE_COLLECTOR' ? collectorMenu : [])
        ].map((item) => (
          <Link
            key={item.id}
            to={item.id === 'reports' ? '/reports' : `/${item.id}`}
            className={`d-block text-start text-decoration-none p-3 mb-2 rounded-3 ${
              activeItem === item.id ? 'text-white' : 'text-dark'
            }`}
            style={{
              backgroundColor:
                activeItem === item.id ? colors.accent : 'transparent',
              transition: '0.2s',
            }}
            onClick={() => setActiveItem(item.id)}
          >
            <span className="me-3" style={{ width: 22 }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.badge && (
              <span
                className="ms-auto badge rounded-pill"
                style={{
                  backgroundColor:
                    activeItem === item.id ? 'white' : colors.primary,
                  color:
                    activeItem === item.id ? colors.accent : 'white',
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="pt-3 border-top">
        {user ? (
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width:38, height:38, fontSize:13, background:`linear-gradient(135deg, ${colors.accent}, ${colors.deep})`, color:'white' }}>{user.username?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="ms-3">
                <div className="fw-semibold" style={{ color: colors.textDark }}>{user.username}</div>
                <small className="text-muted">{user.role?.replace('ROLE_','') || ''}</small>
              </div>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { onLogout && onLogout(); navigate('/'); }}>Logout</button>
            </div>
          </div>
        ) : (
          <div className="text-muted small">Not signed in</div>
        )}
      </div>
    </div>
  );
}
