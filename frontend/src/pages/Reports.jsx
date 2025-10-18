import React, { useState, useEffect } from "react";
import ReportFilter from "../components/ReportFilter";
import ReportTable from "../components/ReportTable";
import ReportChart from "../components/ReportChart";
import ReportActions from "../components/ReportActions";
import ReportHistory from "../components/ReportHistory";
import api from "../api/api";
import "../styles/reports.css";
import ExportConfirmation from '../components/ExportConfirmation';
import { useToast } from '../components/Toast';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState({ date: "", zone: "All", user: "", vehicle: "" });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [pdfExport, setPdfExport] = useState({ open: false, url: null, filename: null });
  const [exportLoading, setExportLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // map our simple filter shape to backend params (from/to)
      const params = {};
      if (filter.date && filter.date.length > 0) {
        params.from = filter.date;
        params.to = filter.date;
      }
      if (filter.zone && filter.zone !== 'All') params.zone = filter.zone;
      if (filter.user && filter.user.length > 0) params.user = filter.user;
      if (filter.vehicle && filter.vehicle.length > 0) params.vehicle = filter.vehicle;

      const res = await api.get("/reports", { params });
      setReports(res.data.reports || []);
      setSummary(res.data.summary || []);
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
      <h4 className="fw-bold mb-3 text-success">Generate Reports</h4>
      <p className="text-muted mb-4">
        Generate, visualize, and export sustainability performance reports.
      </p>

      <ReportFilter filter={filter} setFilter={setFilter} onGenerate={fetchReports} />

      {loading ? (
        <div className="text-center py-5">Loading reports...</div>
      ) : (
        <>
          {summary && <ReportChart summary={summary} />}
          <ReportActions reports={reports} exportDisabled={exportLoading} onExportPdf={async () => {
            // export current filtered reports as PDF from server
            setExportLoading(true);
            const params = {};
            if (filter.date && filter.date.length > 0) { params.from = filter.date; params.to = filter.date; }
            if (filter.zone && filter.zone !== 'All') params.zone = filter.zone;
            if (filter.user && filter.user.length > 0) params.user = filter.user;
            if (filter.vehicle && filter.vehicle.length > 0) params.vehicle = filter.vehicle;

            try {
              const res = await api.get('/reports/export/pdf', { params, responseType: 'arraybuffer' });
              const blob = new Blob([res.data], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              setPdfExport({ open: true, url, filename: `reports-${new Date().toISOString().split('T')[0]}.pdf` });
            } catch (e) {
              console.error('PDF export failed', e);
              toast.show('PDF export failed', { type: 'error' });
            }
            finally { setExportLoading(false); }
          }} />
          <ReportTable reports={reports} />
          <ReportHistory />
        </>
      )}
      <ExportConfirmation
        open={pdfExport.open}
        onClose={() => {
          if (pdfExport.url) {
            try { URL.revokeObjectURL(pdfExport.url); } catch (e) {}
          }
          setPdfExport({ open: false, url: null, filename: null });
        }}
        blobUrl={pdfExport.url}
        filename={pdfExport.filename}
        // supply an onEmail handler so the modal can call backend to send email with the same filters
        onEmail={async (recipient) => {
          // call backend to email the generated report for current filters
          const payload = { to: recipient };
          if (filter.date && filter.date.length > 0) { payload.from = filter.date; payload.to = filter.date; }
          if (filter.zone && filter.zone !== 'All') payload.zone = filter.zone;
          if (filter.user && filter.user.length > 0) payload.user = filter.user;
          if (filter.vehicle && filter.vehicle.length > 0) payload.vehicle = filter.vehicle;
            try {
            const res = await api.post('/reports/email', payload);
            if (res && res.status === 200) {
              toast.show('Report emailed successfully', { type: 'success' });
              try { if (pdfExport.url) { URL.revokeObjectURL(pdfExport.url); } } catch(e){}
              setPdfExport({ open: false, url: null, filename: null });
            } else if (res && res.status === 501) {
              toast.show('Email not configured on server. Opening your mail client as a fallback.', { type: 'warning' });
              window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(pdfExport.filename||'report.pdf')}`;
            } else {
              toast.show('Email request returned: ' + (res && res.data && (res.data.message || res.data.error) ? (res.data.message || res.data.error) : 'unknown'), { type: 'error' });
            }
          } catch (err) {
            console.error('Email request failed', err);
            const serverMsg = (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) || null;
            if (err && err.response && err.response.status === 501) {
              // server reports not configured
              toast.show('Email is not configured on the server. Opening your mail client.', { type: 'warning' });
              window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(pdfExport.filename||'report.pdf')}`;
            } else {
              toast.show('Failed to send email: ' + (serverMsg || err.message || 'unknown'), { type: 'error' });
            }
          }
        }}
      />
    </div>
  );
}
