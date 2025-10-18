import React, { useState, useEffect } from "react";
import ReportFilter from "../components/ReportFilter";
import ReportTable from "../components/ReportTable";
import ReportChart from "../components/ReportChart";
import ReportActions from "../components/ReportActions";
import ReportHistory from "../components/ReportHistory";
import api from "../api/api";
import "../styles/reports.css";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState({ date: "", zone: "All", user: "", vehicle: "" });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports", { params: filter });
      setReports(res.data.reports);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="container-fluid reports-page py-3">
      <h4 className="fw-bold mb-3 text-success">Reports & Analytics</h4>
      <p className="text-muted mb-4">
        Generate, visualize, and export sustainability performance reports.
      </p>

      <ReportFilter filter={filter} setFilter={setFilter} onGenerate={fetchReports} />

      {loading ? (
        <div className="text-center py-5">Loading reports...</div>
      ) : (
        <>
          {summary && <ReportChart summary={summary} />}
          <ReportActions reports={reports} />
          <ReportTable reports={reports} />
          <ReportHistory />
        </>
      )}
    </div>
  );
}
