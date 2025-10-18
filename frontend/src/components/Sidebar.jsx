import React from 'react';
import { NavLink } from 'react-router-dom';
import RecyLinkLogo from '../assets/RecyLink_Logo.png';

export default function Sidebar() {
  const menu = [
    { id: 1, label: 'Dashboard', path: '/', icon: '📊' },
    { id: 2, label: 'Reports', path: '/reports', icon: '📑' },
    { id: 3, label: 'Monitor Bin Level', path: '/bins', icon: '🗺️' },
    { id: 4, label: 'User Details', path: '/users', icon: '👥' },
    { id: 5, label: 'Analytics', path: '/analytics', icon: '📈' },
    { id: 6, label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div style={{ width: 250 }} className="h-100 border-end d-flex flex-column bg-white">
      <div className="text-center p-3 border-bottom">
        <img src={RecyLinkLogo} width={42} alt="RecyLink" />
        <h6 className="fw-bold mt-2 text-success">RecyLink</h6>
        <small className="text-muted">Smart Waste Hub</small>
      </div>
      <nav className="flex-grow-1 mt-3">
        {menu.map((item) => (
          <NavLink
            to={item.path}
            key={item.id}
            className="d-block px-4 py-2 text-decoration-none text-dark"
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-dark)',
              borderRadius: '8px',
              margin: '4px 8px',
            })}
          >
            {item.icon} <span className="ms-2">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-top small text-center text-muted">admin • Logout</div>
    </div>
  );
}
