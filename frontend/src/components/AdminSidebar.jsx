import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import RecyLinkLogo from '../assets/RecyLink_Logo.png';
import {
  Home,
  BarChart2,
  Users,
  LogOut,
  MapPin,
  FileText,
  Recycle,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
} from 'lucide-react';

export default function AdminSidebar({ onLogout }) {
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = {
    primary: '#6366F1', // Professional indigo
    accent: '#10B981', // Emerald green
    secondary: '#8B5CF6', // Violet
    warning: '#F59E0B', // Amber
    lightBg: '#F8FAFC',
    sidebarBg: '#FFFFFF',
    textDark: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <Home size={35} />, 
      path: '/admin',
      badge: null
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: <BarChart2 size={35} />, 
      path: '/admin/analytics',
      badge: 'New'
    },
    { 
      id: 'waste-types', 
      label: 'Waste Management', 
      icon: <Recycle size={35} />, 
      path: '/admin/waste-types',
      badge: null
    },
    { 
      id: 'bins', 
      label: 'Monitoring Bins', 
      icon: <MapPin size={35} />, 
      path: '/admin/bins',
      badge: '3'
    },
    { 
      id: 'reports', 
      label: 'Generate Reports', 
      icon: <FileText size={35} />, 
      path: '/admin/reports',
      badge: '12'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: <Users size={35} />, 
      path: '/admin/users',
      badge: null
    },
  ];

  // Stats data
  const stats = {
    tasksCompleted: 24,
    totalTasks: 30,
    efficiency: 85,
    alerts: 3
  };

  useEffect(() => {
    // Set active based on current path
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setActive(currentItem.id);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const progressPercentage = (stats.tasksCompleted / stats.totalTasks) * 100;

  return (
    <div
      className={`h-screen d-flex flex-column justify-content-between border-end transition-all position-relative ${
        collapsed ? 'collapsed-sidebar' : ''
      }`}
      style={{
        width: collapsed ? 80 : 280,
        backgroundColor: theme.sidebarBg,
        borderRight: `1px solid ${theme.border}`,
        transition: 'width 0.3s ease',
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="btn btn-sm position-absolute rounded-circle shadow-sm border-0"
        style={{
          top: 20,
          right: -12,
          backgroundColor: theme.sidebarBg,
          width: 24,
          height: 24,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {collapsed ? (
          <ChevronRight size={14} color={theme.primary} />
        ) : (
          <ChevronLeft size={14} color={theme.primary} />
        )}
      </button>

      {/* Header / Logo Section */}
      <div className={`p-4 border-bottom ${collapsed ? 'text-center' : ''}`}>
        <div className={`d-flex ${collapsed ? 'justify-content-center' : 'justify-content-start'}`}>
          <div className={`d-flex flex-column ${collapsed ? 'align-items-center' : 'align-items-start'}`}>
            <img
              src={RecyLinkLogo}
              alt="RecyLink"
              style={{
                width: collapsed ? 120 : 170,
                transition: 'width 0.3s ease'
              }}
            />

            {!collapsed && (
              <small className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                Smart Waste Management
              </small>
            )}
          </div>
        </div>
      </div>

      {/* (Removed Today's Progress block as requested) */}

      {/* Navigation Menu */}
      <nav className="flex-grow-1 px-2">
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.id}
            className={({ isActive }) =>
              `d-flex align-items-center text-decoration-none rounded-3 mb-1 position-relative ${
                isActive ? 'active-menu-item' : 'text-muted'
              }`
            }
            style={({ isActive }) => ({
              padding: collapsed ? '12px' : '12px 16px',
              backgroundColor: isActive ? `${theme.primary}15` : 'transparent',
              border: isActive ? `1px solid ${theme.primary}30` : '1px solid transparent',
              transition: 'all 0.2s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
            onMouseEnter={(e) => {
              if (!collapsed) return;
              e.currentTarget.style.backgroundColor = `${theme.primary}10`;
            }}
            onMouseLeave={(e) => {
              if (!collapsed) return;
              const isActive = location.pathname === item.path;
              e.currentTarget.style.backgroundColor = isActive ? `${theme.primary}15` : 'transparent';
            }}
          >
            <div className="position-relative">
              <span style={{ 
                color: location.pathname === item.path ? theme.primary : theme.textMuted,
                transition: 'color 0.2s ease'
              }}>
                {item.icon}
              </span>
              
              {/* Badge */}
              {item.badge && !collapsed && (
                <span
                  className="badge rounded-pill position-absolute"
                  style={{
                    top: -6,
                    right: -8,
                    backgroundColor: theme.accent,
                    color: 'white',
                    fontSize: '0.6rem',
                    padding: '2px 6px',
                    minWidth: '18px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>

            {!collapsed && (
              <>
                    <span 
                      className="ms-3 flex-grow-1"
                      style={{
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        color: location.pathname === item.path ? theme.primary : theme.textMuted,
                        fontSize: '0.92rem',
                        lineHeight: '1.1'
                      }}
                    >
                      {item.label}
                    </span>
                
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <div
                    style={{
                      width: 4,
                      height: 20,
                      backgroundColor: theme.primary,
                      borderRadius: 2,
                    }}
                  ></div>
                )}
              </>
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div
                className="tooltip"
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: theme.textDark,
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s ease',
                  zIndex: 1000,
                }}
              >
                {item.label}
                {item.badge && (
                  <span className="ms-2 badge bg-accent" style={{ fontSize: '0.6rem' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout (simplified) */}
  <div className="border-top p-3 d-flex align-items-center justify-content-between" style={{ borderColor: theme.border, gap: 12 }}>
        {!collapsed ? (
          <>
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: `${theme.primary}15`,
                  color: theme.primary,
                }}
              >
                <User size={18} />
              </div>
              <div>
                <div className="fw-semibold" style={{ color: theme.textDark, fontSize: '0.9rem' }}>
                  Admin User
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Administrator
                </small>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={14} className="me-1" /> Logout
            </button>
          </>
        ) : (
          <div className="text-center">
            <button
              className="btn p-2 rounded-2 border-0"
              style={{ backgroundColor: `${theme.primary}10` }}
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} color={theme.primary} />
            </button>
          </div>
        )}
      </div>

      {/* Global Styles */}
  <style>{`
        .collapsed-sidebar .tooltip {
          opacity: 1 !important;
          margin-left: 8px;
        }
        
        .active-menu-item {
          color: ${theme.primary} !important;
        }
        
        nav a:hover {
          background-color: ${theme.primary}08 !important;
          border-color: ${theme.primary}20 !important;
        }
        
        .dropdown-menu {
          transform: translateX(-100%) translateY(-10px) !important;
        }
      `}</style>
    </div>
  );
}