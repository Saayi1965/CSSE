import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔹 Pages
import Reports from "./pages/Reports";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import LandingPage from "./pages/LandingPage"; // ✅ fixed typo “impor t”
import MonitorBinLevel from "./pages/MonitorBinLevel";
import UserDetails from "./pages/UserDetails";
import Analytics from "./pages/Analytics";
import BinRegister from "./pages/BinRegister";
import BinDashboard from "./pages/BinDashboard";

export default function App() {
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
      <Routes>
        {/* 🏠 Public pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
        <Route path="/signup" element={<Signup onAuth={handleAuth} />} />

        {/* 👤 User routes */}
        <Route path="/user/dashboard" element={<LandingPage />} />
        <Route path="/register" element={<BinRegister />} />
        <Route path="/bin-dashboard" element={<BinDashboard />} />

        {/* 🛠️ Admin dashboard */}
        <Route
          path="/admin/*"
          element={
            <div className="d-flex">
              <Sidebar user={user} onLogout={logout} />
              <div className="flex-grow-1 p-4 vh-100 overflow-auto bg-light">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="monitor-bin-level" element={<MonitorBinLevel />} />
                  <Route path="user-details" element={<UserDetails />} />
                  <Route path="analytics" element={<Analytics />} />
                </Routes>
              </div>
            </div>
          }
        />

        {/* 🚛 Collector dashboard */}
        <Route
          path="/collector/*"
          element={
            <div className="d-flex">
              <Sidebar user={user} onLogout={logout} />
              <div className="flex-grow-1 p-4 vh-100 overflow-auto bg-light">
                <Routes>
                  <Route path="dashboard" element={<CollectorDashboard />} />
                </Routes>
              </div>
            </div>
          }
        />

        {/* 📊 Common routes (optional direct access) */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/monitor-bin-level" element={<MonitorBinLevel />} />
        <Route path="/user-details" element={<UserDetails />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* ✅ Catch-all (optional 404) */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
