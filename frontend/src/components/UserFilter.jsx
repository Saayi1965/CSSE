import React, { useState, useEffect } from "react";

export default function UserFilter({ filter, onApply }) {
  const [local, setLocal] = useState({ role: 'All', status: 'All', search: '' });

  useEffect(() => {
    if (filter) setLocal(filter);
  }, [filter]);

  const handleChange = (key, value) => {
    setLocal(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card p-3 mb-4 shadow-sm">
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label small fw-semibold text-muted">
            Role
          </label>
          <select
            className="form-select"
            value={local.role}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option>All</option>
            <option>ROLE_ADMIN</option>
            <option>ROLE_COLLECTOR</option>
            <option>ROLE_RESIDENTIAL</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-semibold text-muted">
            Status
          </label>
          <select
            className="form-select"
            value={local.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-outline-success w-100"
            onClick={() => onApply && onApply(local)}
          >
            🔍 Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
