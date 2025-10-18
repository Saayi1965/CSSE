import React from "react";

export default function ReportHistory() {
  const history = [
    { title: "Monthly Zone Report", date: "Oct 2025", file: "Zone_Report_Oct2025.pdf" },
    { title: "Collector Performance Report", date: "Sep 2025", file: "Collector_Report_Sep2025.xlsx" },
  ];

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="fw-bold mb-3">Report History</h6>
      <ul className="list-group list-group-flush">
        {history.map((h, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">{h.title}</div>
              <small className="text-muted">{h.date}</small>
            </div>
            <button className="btn btn-sm btn-outline-success">
              <i className="fas fa-download me-2"></i>Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
