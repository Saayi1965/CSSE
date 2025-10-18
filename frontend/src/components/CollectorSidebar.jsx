import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import RecyLinkLogo from '../assets/RecyLink_Logo.png';
import {
  Home, Truck, MapPin, ClipboardList, Settings, LogOut
} from 'lucide-react';

export default function CollectorSidebar({ onLogout }) {
  const [active, setActive] = useState('dashboard');
  const navigate = useNavigate();

  const theme = {
    primary: '#673AB7',
    accent: '#34A853',
    orange: '#F39C12',
    lightBg: '#F7FAFC',
  };

  const items = [
    { id: 'dashboard', label: 'Collector Dashboard', icon: <Home size={18} />, path: '/collector/dashboard' },
    { id: 'routes', label: 'Assigned Routes', icon: <MapPin size={18} />, path: '/collector/routes' },
    { id: 'tasks', label: 'Pickup Tasks', icon: <ClipboardList size={18} />, path: '/collector/tasks' },
    { id: 'bins', label: 'Monitor Bin Level', icon: <Truck size={18} />, path: '/collector/bins' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/collector/settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div
      className="h-screen d-flex flex-column justify-content-between border-end shadow-sm"
      style={{
        width: 240,
        backgroundColor: theme.lightBg,
      }}
    >
      {/* Header */}
      <div className="p-4 border-bottom text-center">
        <img src={RecyLinkLogo} alt="RecyLink" style={{ width: 42 }} />
        <h6 className="fw-bold mt-2" style={{ color: theme.accent }}>RecyLink</h6>
        <p className="text-muted small mb-0">Collector Portal</p>
      </div>

      {/* Progress Summary */}
      <div className="px-3 mt-3">
        <div
          className="rounded-3 p-2 text-center small"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            color: 'white',
          }}
        >
          <span>Today's Collections</span>
          <div className="progress mt-2 bg-white bg-opacity-25" style={{ height: 6 }}>
            <div className="progress-bar" style={{ width: '70%', backgroundColor: '#fff' }}></div>
          </div>
          <span className="fw-semibold mt-1 d-block">14 / 20 Stops</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 mt-3 px-2">
        {items.map((item) => (
          <NavLink
            to={item.path}
            key={item.id}
            onClick={() => setActive(item.id)}
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 mb-2 rounded-3 text-decoration-none ${
                isActive || active === item.id ? 'text-white' : 'text-dark'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? theme.accent : 'transparent',
              transition: '0.25s',
            })}
          >
            <span className="me-3">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-top p-3 d-flex align-items-center justify-content-between bg-white">
        <div>
          <div className="fw-semibold" style={{ color: theme.accent }}>Collector</div>
          <small className="text-muted">Active</small>
        </div>
        <button
          className="btn btn-sm text-white"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.orange})`,
            border: 'none',
            borderRadius: 6,
          }}
          onClick={handleLogout}
        >
          <LogOut size={16} className="me-1" /> Logout
        </button>
      </div>
    </div>
  );
}
