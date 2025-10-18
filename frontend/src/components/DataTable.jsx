import React from "react";

export default function DataTable({ rows }) {
  return (
    <div className="card p-3 mt-3">
      <h6 className="fw-bold mb-3">Route Collection Data</h6>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Route</th>
              <th>Vehicle ID</th>
              <th>Waste Collected (kg)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.route}</td>
                <td>{r.vehicle}</td>
                <td>{r.collected}</td>
                <td>
                  <span className={`badge ${r.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
