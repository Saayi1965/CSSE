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
import ExportConfirmation from '../components/ExportConfirmation';
import { useToast } from '../components/Toast';

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({ role: "All", status: "All", search: "" });
  // `filter` is the draft values in the filter UI; `activeFilter` is applied when user clicks Apply
  const [activeFilter, setActiveFilter] = useState({ role: "All", status: "All", search: "" });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfExport, setPdfExport] = useState({ open: false, url: null, filename: null });
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
      try { toast && toast.show && toast.show('Failed to load users, using demo data', { type: 'warning' }); } catch (ex) { /* ignore */ }
      // Fallback mock data for demonstration
      const mockUsers = [
        { id: 1, username: "john.smith", email: "john.smith@recylink.com", role: "ROLE_ADMIN", status: "Active", route: "R1", lastLogin: "2024-03-21" },
        { id: 2, username: "sarah.j", email: "sarah.j@recylink.com", role: "ROLE_COLLECTOR", status: "Active", route: "R2", lastLogin: "2024-03-21" },
        { id: 3, username: "mike.chen", email: "mike.chen@recylink.com", role: "ROLE_RESIDENTIAL", status: "Active", route: "", lastLogin: "2024-03-20" },
        { id: 4, username: "emily.davis", email: "emily.davis@recylink.com", role: "ROLE_COLLECTOR", status: "Inactive", route: "R3", lastLogin: "2024-03-15" },
        { id: 5, username: "alex.r", email: "alex.r@recylink.com", role: "ROLE_RESIDENTIAL", status: "Active", route: "", lastLogin: "2024-03-21" }
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
      admins: userList.filter(u => u.role === "ROLE_ADMIN" || u.role === "Admin").length,
      collectors: userList.filter(u => u.role === "ROLE_COLLECTOR" || u.role === "Collector").length
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toast = useToast();

  // Called when the draft filter UI changes (keeps draft values)
  const handleFilter = (filters) => {
    setFilter(filters);
  };

  // Apply the draft filter to the active filter and update displayed users
  const applyFilters = (filters) => {
    setActiveFilter(filters);
    // ask backend for the filtered set so exports match the displayed data
    (async () => {
      setLoading(true);
      try {
        const params = { role: filters.role !== 'All' ? filters.role : undefined, status: filters.status !== 'All' ? filters.status : undefined, search: filters.search || undefined };
        const res = await api.get('/users', { params });
        const data = res.data || [];
        setFiltered(data);
        updateStats(data);
      } catch (e) {
        console.error('Failed to fetch filtered users from server', e);
        // fallback to local filter if server call fails
        let list = [...users];
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          list = list.filter(u => 
            u.username?.toLowerCase().includes(searchTerm) ||
            u.email?.toLowerCase().includes(searchTerm) ||
            u.role?.toLowerCase().includes(searchTerm) ||
            (u.route || '').toLowerCase().includes(searchTerm)
          );
        }
        if (filters.role && filters.role !== "All") list = list.filter(u => u.role === filters.role);
        if (filters.status && filters.status !== "All") list = list.filter(u => u.status === filters.status);
        setFiltered(list);
        updateStats(list);
      } finally {
        setLoading(false);
      }
    })();
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
          <div className="d-flex justify-content-between align-items-center">
            <div style={{ flex: 1 }}>
              <UserFilter filter={filter} onApply={applyFilters} />
            </div>
            <div className="d-flex gap-2 ms-3">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={async () => {
                  setExporting(true);
                  const params = { role: activeFilter.role !== 'All' ? activeFilter.role : undefined, status: activeFilter.status !== 'All' ? activeFilter.status : undefined, search: activeFilter.search || undefined };
                  try {
                    const res = await api.get('/users/export/csv', { params, responseType: 'arraybuffer' });
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; document.body.appendChild(a); a.click(); a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Export CSV error', err);
                    let msg = err.message || 'Unknown error';
                    if (err.response && err.response.data) {
                      try {
                        const buf = err.response.data;
                        const str = typeof buf === 'string' ? buf : new TextDecoder().decode(buf);
                        msg = str;
                      } catch (e) { /* ignore decode errors */ }
                    }
                      try { toast.show('Export CSV failed: ' + msg, { type: 'error' }); } catch(e) { console.error(e); }
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
              >
                <Download size={16} /> CSV
              </button>

              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={async () => {
                  setExporting(true);
                  const params = { role: activeFilter.role !== 'All' ? activeFilter.role : undefined, status: activeFilter.status !== 'All' ? activeFilter.status : undefined, search: activeFilter.search || undefined };
                  try {
                    const res = await api.get('/users/export/pdf', { params, responseType: 'arraybuffer' });
                    const blob = new Blob([res.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    setPdfExport({ open: true, url, filename: 'users.pdf' });
                  } catch (err) {
                    console.error('Export PDF error', err);
                    let msg = err.message || 'Unknown error';
                    if (err.response && err.response.data) {
                      try {
                        const buf = err.response.data;
                        const str = typeof buf === 'string' ? buf : new TextDecoder().decode(buf);
                        msg = str;
                      } catch (e) { /* ignore decode errors */ }
                    }
                      try { toast.show('Export PDF failed: ' + msg, { type: 'error' }); } catch(e) { console.error(e); }
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
              >
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
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

      <ExportConfirmation open={pdfExport.open} onClose={() => { if (pdfExport.url) { try { URL.revokeObjectURL(pdfExport.url); } catch(e){} } setPdfExport({ open:false, url:null, filename:null }) }} blobUrl={pdfExport.url} filename={pdfExport.filename} />

  <style>{`
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