import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import AdminDashboard from './pages/AdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import LandingPage from './pages/LandingPage';
import MonitorBinLevel from './pages/MonitorBinLevel';
import UserDetails from './pages/UserDetails';
import Analytics from './pages/Analytics';

export default function App(){
  const [user, setUser] = useState(() => {
    const uname = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return uname ? { username: uname, role } : null;
  });

  const handleAuth = (u) => setUser(u);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="d-flex">
      
        <div className={`flex-grow-1 p-4 vh-100 overflow-auto ${user ? 'bg-light' : ''}`}>
          <Routes>
            <Route path="/" element={<Welcome/>} />
            <Route path="/login" element={<Login onAuth={handleAuth} />} />
            <Route path="/signup" element={<Signup onAuth={handleAuth} />} />
            <Route path="/reports" element={<Reports/>} />
            <Route path="/admin/dashboard" element={<AdminDashboard/>} />
            <Route path="/collector/dashboard" element={<CollectorDashboard/>} />
            <Route path="/user/dashboard" element={<LandingPage/>} />
            <Route path="/monitor-bin-level" element={<MonitorBinLevel/>} />
            <Route path="/user-details" element={<UserDetails/>} />
            <Route path="/analytics" element={<Analytics/>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

