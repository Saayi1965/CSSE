import React, { useState } from "react";
import api from "../api/api";

export default function UserModal({ user, onClose, onReload }) {
  const [form, setForm] = useState(
    user || { username: "", role: "ROLE_RESIDENTIAL", status: "Active", route: "", email: "", lastLogin: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const saveUser = async () => {
    setSaving(true);
    try {
      const payload = {
        username: form.username,
        role: form.role,
        status: form.status,
        route: form.route,
        email: form.email,
        lastLogin: form.lastLogin
      };
      if (user && user.id) {
        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      onReload();
      onClose();
    } catch (e) {
      console.error("Save user failed:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card shadow-lg p-4">
        <h5 className="fw-bold mb-3">{user ? "Edit User" : "Add User"}</h5>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Username</label>
          <input
            className="form-control"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Role</label>
          <select
            className="form-select"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option value="ROLE_ADMIN">Admin</option>
            <option value="ROLE_COLLECTOR">Collector</option>
            <option value="ROLE_RESIDENTIAL">Resident</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Assigned Route</label>
          <input
            className="form-control"
            placeholder="Route ID or name"
            value={form.route}
            onChange={(e) => handleChange("route", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Email</label>
          <input className="form-control" value={form.email} onChange={(e)=>handleChange('email', e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Last Login</label>
          <input className="form-control" value={form.lastLogin} onChange={(e)=>handleChange('lastLogin', e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Status</label>
          <select
            className="form-select"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={saveUser} disabled={saving}>
            {saving ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
