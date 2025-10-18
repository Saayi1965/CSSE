import React from "react";
import api from "../api/api";
import { useToast } from './Toast';

export default function UserTable({ users, onEdit, onReload }) {
  const toast = useToast();
  return (
    <div className="card shadow-sm p-3">
      <h6 className="fw-semibold mb-3">Registered Users</h6>

      <div className="table-responsive">
        <table className="table align-middle table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Route</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((u, i) => (
                <tr key={i}>
                  <td>{u.username}</td>
                  <td>
                    <span className="badge bg-success">{u.role}</span>
                  </td>
                  <td>{u.route || "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.status === "Active" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{u.lastLogin || "N/A"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => onEdit(u)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={async () => {
                        if (!confirm(`Delete user ${u.username}?`)) return;
                        try {
                          await api.delete(`/users/${u.id}`);
                          if (onReload) onReload();
                        } catch (e) {
                          console.error('Delete failed', e);
                          try { toast && toast.show && toast.show('Delete failed: ' + (e.response?.data?.error || e.message), { type: 'error' }); } catch (ex) {}
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
