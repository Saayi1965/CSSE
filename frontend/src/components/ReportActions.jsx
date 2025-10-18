import React from "react";

export default function ReportActions({ reports, onExportPdf, exportDisabled }) {
  const exportCSV = () => {
    const headers = ["Date", "Zone", "Collector", "Vehicle", "Collected", "Recycled", "Status"];
    const rows = reports.map((r) => [r.date, r.zone, r.user, r.vehicle, r.collected, r.recycled, r.status]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reports.csv";
    link.click();
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <button className="btn btn-outline-success me-2" onClick={exportCSV}>
          <i className="fas fa-download me-1"></i>Export CSV
        </button>
        <button className="btn btn-outline-primary me-2" onClick={() => onExportPdf && onExportPdf()} disabled={exportDisabled}>
          <i className="fas fa-file-pdf me-1"></i>{exportDisabled ? 'Generating…' : 'Export PDF'}
        </button>
        <button className="btn btn-outline-secondary">
          <i className="fas fa-envelope me-1"></i>Share via Email
        </button>
      </div>
      <div>
        <small className="text-muted">📈 Quick Links: </small>
        <a href="#" className="text-success text-decoration-none mx-1">Monthly Zone Report</a>|
        <a href="#" className="text-success text-decoration-none mx-1">Collector Performance</a>
      </div>
    </div>
  );
}
