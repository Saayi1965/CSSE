import React from "react";

export default function ReportTable({ reports }) {
  return (
    <div className="card p-3 mb-4 shadow-sm">
      <h6 className="fw-bold mb-3">Report Summary</h6>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Zone</th>
              <th>Collector</th>
              <th>Vehicle</th>
              <th>Collected (kg)</th>
              <th>Recycled (kg)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.zone}</td>
                  <td>{r.user}</td>
                  <td>{r.vehicle}</td>
                  <td>{r.collected}</td>
                  <td>{r.recycled}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "Completed"
                          ? "bg-success"
                          : r.status === "Pending"
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-3">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
