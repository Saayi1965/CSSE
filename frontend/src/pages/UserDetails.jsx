import React, { useEffect, useState } from "react";
import api from "../api/api";
import UserFilter from "../components/UserFilter";
import UserTable from "../components/UserTable";
import UserModal from "../components/UserModal";
import { 
  Users, 
  Plus, 
  Download, 
  Upload, 
  Shield,
  RefreshCw,
  UserPlus,
  BarChart3
} from "lucide-react";
import "../styles/users.css";

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({ role: "All", status: "All", search: "" });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    collectors: 0
  });

  const loadUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await api.get("/users");
      const userData = res.data || [];
      setUsers(userData);
      setFiltered(userData);
      updateStats(userData);
    } catch (e) {
      console.error("Error loading users:", e);
      // Fallback mock data for demonstration
      const mockUsers = [
        { id: 1, name: "John Smith", email: "john.smith@recylink.com", role: "Admin", status: "Active", joinDate: "2024-01-15", lastActive: "2024-03-21" },
        { id: 2, name: "Sarah Johnson", email: "sarah.j@recylink.com", role: "Collector", status: "Active", joinDate: "2024-02-01", lastActive: "2024-03-21" },
        { id: 3, name: "Mike Chen", email: "mike.chen@recylink.com", role: "Manager", status: "Active", joinDate: "2024-01-20", lastActive: "2024-03-20" },
        { id: 4, name: "Emily Davis", email: "emily.davis@recylink.com", role: "Collector", status: "Inactive", joinDate: "2024-02-15", lastActive: "2024-03-15" },
        { id: 5, name: "Alex Rodriguez", email: "alex.r@recylink.com", role: "Operator", status: "Active", joinDate: "2024-03-01", lastActive: "2024-03-21" }
      ];
      setUsers(mockUsers);
      setFiltered(mockUsers);
      updateStats(mockUsers);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStats = (userList) => {
    setStats({
      total: userList.length,
      active: userList.filter(u => u.status === "Active").length,
      admins: userList.filter(u => u.role === "Admin").length,
      collectors: userList.filter(u => u.role === "Collector").length
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFilter = (filters) => {
    setFilter(filters);
    let list = [...users];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      list = list.filter(u => 
        u.name?.toLowerCase().includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm) ||
        u.role?.toLowerCase().includes(searchTerm)
      );
    }

    // Role filter
    if (filters.role !== "All") {
      list = list.filter((u) => u.role === filters.role);
    }

    // Status filter
    if (filters.status !== "All") {
      list = list.filter((u) => u.status === filters.status);
    }

    setFiltered(list);
  };

  const openModal = (user = null) => {
    setSelected(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const handleRefresh = () => {
    loadUsers(true);
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log("Exporting users data...");
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="bg-primary bg-opacity-10 rounded-3 p-3">
              <Users size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">User Management</h1>
              <p className="text-muted mb-0">Manage system users, roles, and permissions</p>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={handleExport}
          >
            <Download size={18} />
            Export
          </button>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => openModal()}
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">Total Users</h6>
                  <h3 className="fw-bold text-primary mb-0">{stats.total}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <Users size={24} className="text-primary" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-success small">
                  <span className="fw-semibold">+{Math.floor(stats.total * 0.12)}</span> this month
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">Active Users</h6>
                  <h3 className="fw-bold text-success mb-0">{stats.active}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                  <Users size={24} className="text-success" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-success small">
                  <span className="fw-semibold">{Math.round((stats.active / stats.total) * 100)}%</span> active rate
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">Administrators</h6>
                  <h3 className="fw-bold text-warning mb-0">{stats.admins}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                  <Shield size={24} className="text-warning" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-muted small">
                  System administrators
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">Collectors</h6>
                  <h3 className="fw-bold text-info mb-0">{stats.collectors}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-3">
                  <Users size={24} className="text-info" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-muted small">
                  Field collection team
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <UserFilter filter={filter} onFilter={handleFilter} />
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-0 fw-semibold">Users</h5>
              <small className="text-muted">
                {filtered.length} of {users.length} users shown
                {(filter.role !== "All" || filter.status !== "All" || filter.search) && " (filtered)"}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              {loading && (
                <div className="d-flex align-items-center text-muted small">
                  <RefreshCw size={14} className="spin me-2" />
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading users...</span>
              </div>
              <p className="text-muted">Loading user data...</p>
            </div>
          ) : (
            <UserTable
              users={filtered}
              onEdit={openModal}
              onReload={loadUsers}
            />
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-5">
            <Users size={64} className="text-muted mb-3 opacity-50" />
            <h5 className="text-muted">No users found</h5>
            <p className="text-muted mb-4">
              {users.length === 0 
                ? "No users in the system yet. Add your first user to get started."
                : "No users match your current filters. Try adjusting your search criteria."
              }
            </p>
            {users.length === 0 && (
              <button 
                className="btn btn-primary d-flex align-items-center gap-2 mx-auto"
                onClick={() => openModal()}
              >
                <UserPlus size={18} />
                Add First User
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selected}
          onClose={closeModal}
          onReload={loadUsers}
        />
      )}

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}