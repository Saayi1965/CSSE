import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// ✅ Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/AdminDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import UserDashboard from "./pages/UserDashboard";
import MonitorBinLevel from "./pages/MonitorBinLevel";
import UserDetails from "./pages/UserDetails";
import Analytics from "./pages/Analytics";
import WasteTypes from "./pages/WasteTypes"; // 🔥 new analytics module

// ✅ Components
import Sidebar from "./components/Sidebar";
import AdminSidebar from "./components/AdminSidebar";
import CollectorSidebar from "./components/CollectorSidebar";

// ✅ Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";

/**
 * Root Application Component
 */
export default function App() {
  // Keep logged-in user from localStorage
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    return username ? { username, role } : null;
  });

  // Handle login/signup authentication
  const handleAuth = (userObj) => {
    setUser(userObj);
  };

  // Logout clears session
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <MainLayout user={user} onAuth={handleAuth} onLogout={logout} />
    </BrowserRouter>
  );
}

/**
 * Layout Wrapper — Handles sidebar visibility and routing
 */
function MainLayout({ user, onAuth, onLogout }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Hide sidebar on public routes
  const showSidebar = user && !["/login", "/signup", "/"].includes(path);

  // Sidebar selector by role
  const renderSidebar = () => {
    if (!showSidebar) return null;
    switch (user?.role) {
      case "ROLE_ADMIN":
        return <AdminSidebar onLogout={onLogout} />;
      case "ROLE_COLLECTOR":
        return <CollectorSidebar onLogout={onLogout} />;
      case "ROLE_RESIDENTIAL":
        // residential users use the generic Sidebar
        return <Sidebar user={user} onLogout={onLogout} />;
      default:
        return <Sidebar user={user} onLogout={onLogout} />;
    }
  };

  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div
        className={`flex-grow-1 overflow-auto p-3 ${
          showSidebar ? "bg-light" : "bg-white"
        }`}
      >
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login onAuth={onAuth} />} />
          <Route path="/signup" element={<Signup onAuth={onAuth} />} />

          {/* --- ADMIN ROUTES --- */}
          {user?.role === "ROLE_ADMIN" && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/bins" element={<MonitorBinLevel />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/users" element={<UserDetails />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/waste-types" element={<WasteTypes />} /> {/* ✅ new */}
              <Route path="/admin/settings" element={<Welcome />} />
            </>
          )}

          {/* --- COLLECTOR ROUTES --- */}
          {user?.role === "ROLE_COLLECTOR" && (
            <>
              <Route path="/collector/dashboard" element={<CollectorDashboard />} />
              <Route path="/collector/bins" element={<MonitorBinLevel />} />
              <Route path="/collector/reports" element={<Reports />} />
              <Route path="/collector/analytics" element={<Analytics />} />
            </>
          )}

          {/* --- USER ROUTES --- */}
          {user?.role === "ROLE_RESIDENTIAL" && (
            <>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/reports" element={<Reports />} />
              <Route path="/user/analytics" element={<Analytics />} />
            </>
          )}

          {/* --- SHARED ROUTES --- */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/monitor-bin-level" element={<MonitorBinLevel />} />
          <Route path="/user-details" element={<UserDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/waste-types" element={<WasteTypes />} />

          {/* --- UNKNOWN ROUTE HANDLER --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
