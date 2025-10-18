import React from "react";

export default function ReportFilter({ filter, setFilter, onGenerate }) {
  return (
    <div className="card p-3 mb-4 shadow-sm">
      <h6 className="fw-bold mb-3">Report Filters</h6>
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label small fw-semibold text-muted">Date Range</label>
          <input
            type="date"
            className="form-control"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-semibold text-muted">Zone</label>
          <select
            className="form-select"
            value={filter.zone}
            onChange={(e) => setFilter({ ...filter, zone: e.target.value })}
          >
            <option>All</option>
            <option>North Zone</option>
            <option>South Zone</option>
            <option>East Zone</option>
            <option>West Zone</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-semibold text-muted">User / Collector</label>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={filter.user}
            onChange={(e) => setFilter({ ...filter, user: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-semibold text-muted">Vehicle ID</label>
          <input
            type="text"
            className="form-control"
            placeholder="Vehicle #"
            value={filter.vehicle}
            onChange={(e) => setFilter({ ...filter, vehicle: e.target.value })}
          />
        </div>

        <div className="col-md-3 mt-3">
          <button className="btn btn-success w-100" onClick={onGenerate}>
            <i className="fas fa-chart-bar me-2"></i>Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
