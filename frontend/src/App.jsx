import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🧭 Pages
import Reports from "./pages/Reports";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import MonitorBinLevel from "./pages/MonitorBinLevel";
import UserDetails from "./pages/UserDetails";
import Analytics from "./pages/Analytics";

// 🗑️ Collector Pages
import CollectorDashboard from "./pages/Collector/CollectorDashboard";
import RouteList from "./pages/Collector/RouteList";
import ViewRoutes from "./pages/Collector/ViewRoutes";
import QRScan from "./pages/Collector/QRScan";
import UpdatePickup from "./pages/Collector/UpdatePickup";
import MapView from "./pages/Collector/MapView"; // ✅ You forgot this import earlier

export default function App() {
  // 🔐 Manage user authentication state
  const [user, setUser] = useState(() => {
    const uname = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    return uname ? { username: uname, role } : null;
  });

  const handleAuth = (u) => setUser(u);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="d-flex">
        {/* 🧭 Show Sidebar only when logged in */}
        {user && <Sidebar user={user} onLogout={logout} />}

        <div className={`flex-grow-1 p-4 vh-100 overflow-auto ${user ? "bg-light" : ""}`}>
          <Routes>
            {/* 🌐 Public routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login onAuth={handleAuth} />} />
            <Route path="/signup" element={<Signup onAuth={handleAuth} />} />

            {/* 🧾 Common pages */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/user-details" element={<UserDetails />} />
            <Route path="/monitor-bin-level" element={<MonitorBinLevel />} />

            {/* 👑 Admin routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* 👤 User routes */}
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* 🚛 Collector routes */}
            <Route path="/collector/dashboard" element={<CollectorDashboard />} />
            <Route path="/collector/routes" element={<ViewRoutes />} />
            <Route path="/collector/map" element={<MapView />} />
            <Route path="/collector/qr" element={<QRScan />} />
            <Route path="/collector/update" element={<UpdatePickup />} />
            <Route path="/collector/route-list" element={<RouteList />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
