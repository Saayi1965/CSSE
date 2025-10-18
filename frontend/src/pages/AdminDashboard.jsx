import React, { useEffect, useState, useMemo } from 'react';
import KPICard from '../components/KPICard';
import api from '../api/api';
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import ExportConfirmation from '../components/ExportConfirmation';
import { useToast } from '../components/Toast';

const COLORS = ['#34A853', '#4285F4', '#F39C12', '#10B981'];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [bins, setBins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // fetch overview, bins and users in parallel
    Promise.all([
      api.get('/admin/overview').catch(e => ({ data: {} })),
      api.get('/bins').catch(e => ({ data: [] })),
      api.get('/users').catch(e => ({ data: [] })),
    ]).then(([ov, bRes, uRes]) => {
      const d = (ov && ov.data) || {};
      const monthly = (d.monthlyTrend || []).map(m => ({ month: m.month, collected: m.weightKg || 0, recycled: 0 }));
      setOverview({
        totalKg: d.totalKg || 0,
        recyclingRate: d.recyclingRate || 0,
        activeZones: d.activeZones || 0,
        efficiency: d.efficiency || 'N/A',
        monthly,
        missedAlerts: d.missedPickups || 0,
      });

      // normalize bins (accept either old or new field names)
      const rawBins = (bRes && bRes.data) || [];
      const normalized = rawBins.map(r => ({
        id: r.id || r._id || r.binId || r._doc?.binId,
        binId: r.binId || r.id || r._id || r._doc?.binId || '',
        location: r.location || r.address || r._doc?.location || '',
        binType: r.binType || r.type || r._doc?.binType || 'Unknown',
        ownerName: r.ownerName || r.owner || r._doc?.ownerName || '—',
        level: typeof r.level === 'number' ? r.level : (r._doc && typeof r._doc.level === 'number' ? r._doc.level : 0),
        nextCollection: r.nextCollection || r.scheduledAt || r._doc?.nextCollection || null,
        status: r.status || r.monitorStatus || 'Unknown',
        raw: r,
      }));
      setBins(normalized);

      // normalize users
      const rawUsers = (uRes && uRes.data) || [];
      const normUsers = rawUsers.map(u => ({ id: u.id || u._id || u.username || '', name: u.name || u.fullName || u.username || '', roles: u.roles || (u.role ? [u.role] : []), raw: u }));
      setUsers(normUsers);

      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Failed to load dashboard data');
      setLoading(false);
    });
  }, []);

  const totalBins = bins.length;
  const avgFill = totalBins ? Math.round(bins.reduce((s, b) => s + (b.level || 0), 0) / totalBins) : 0;
  const highBins = bins.filter(b => (b.level || 0) >= 80).length;
  const lowBins = bins.filter(b => (b.level || 0) <= 20).length;
  const totalUsers = users.length;
  const activeCollectors = users.filter(u => (u.roles || []).some(r => String(r).toLowerCase().includes('collect'))).length;

  const binsByType = useMemo(() => {
    const m = new Map();
    bins.forEach(b => m.set(b.binType || 'Unknown', (m.get(b.binType || 'Unknown') || 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [bins]);

  const avgByType = useMemo(() => {
    const sums = {};
    const counts = {};
    bins.forEach(b => { const t = b.binType || 'Unknown'; sums[t] = (sums[t] || 0) + (b.level || 0); counts[t] = (counts[t] || 0) + 1; });
    return Object.keys(sums).map(k => ({ type: k, avg: Math.round(sums[k] / counts[k]) }));
  }, [bins]);

  const downloadReport = (path) => {
    // open in new tab; backend endpoints should provide proper Content-Disposition
    try { window.open(path, '_blank'); }
    catch (e) { console.error('download failed', e); }
  };

  const [pdfExport, setPdfExport] = useState({ open: false, url: null, filename: null });
  const toast = useToast();
  const [exportLoading, setExportLoading] = useState(false);

  const handlePdfExport = async (path, filename) => {
    setExportLoading(true);
    try {
      const res = await api.get(path.replace('/api',''), { responseType: 'arraybuffer' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfExport({ open: true, url, filename });
    } catch (e) {
      console.error('PDF export failed', e);
      toast.show('PDF export failed', { type: 'error' });
    }
    finally { setExportLoading(false); }
  };

  if (loading) return <div className="p-5 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-5 text-center text-danger">{error}</div>;

  return (
    <div className="p-4">
      <div className={`alert ${overview?.missedAlerts > 0 ? 'alert-danger' : 'alert-success'} d-flex justify-content-between align-items-center`}> 
        <div>{overview?.missedAlerts > 0 ? `⚠ ${overview.missedAlerts} missed pickups` : 'All pickups on schedule'}</div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => downloadReport('/api/admin/report.csv')}>Export Overview CSV</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handlePdfExport('/api/admin/report.pdf', 'overview.pdf')} disabled={exportLoading}>{exportLoading ? 'Generating…' : 'Export Overview PDF'}</button>
          <button className="btn btn-sm btn-success" onClick={() => downloadReport('/api/bins/export/csv')}>Bins CSV</button>
          <button className="btn btn-sm btn-danger" onClick={() => handlePdfExport('/api/bins/export/pdf', `bins-report-${new Date().toISOString().split('T')[0]}.pdf`)} disabled={exportLoading}>{exportLoading ? 'Generating…' : 'Bins PDF'}</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-2"><KPICard title="Total Bins" value={totalBins} icon="🗑️" color="#4285F4" /></div>
        <div className="col-md-2"><KPICard title="Avg Fill" value={`${avgFill}%`} icon="📊" color="#34A853" /></div>
        <div className="col-md-2"><KPICard title=">=80% Full" value={highBins} icon="⚠️" color="#F39C12" /></div>
        <div className="col-md-2"><KPICard title="<=20% Full" value={lowBins} icon="✅" color="#10B981" /></div>
        <div className="col-md-2"><KPICard title="Total Users" value={totalUsers} icon="�" color="#673AB7" /></div>
        <div className="col-md-2"><KPICard title="Collectors" value={activeCollectors} icon="🚚" color="#6C63FF" /></div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card p-3">
            <h6 className="fw-bold mb-3">Monthly Waste Trend</h6>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overview.monthly}>
                <Tooltip />
                <Line type="monotone" dataKey="collected" stroke="#4285F4" strokeWidth={2} name="Collected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 text-center">
            <h6 className="fw-bold mb-3">Bins by Type</h6>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={binsByType} dataKey="value" nameKey="name" outerRadius={80} label>
                  {binsByType.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-md-8">
          <div className="card p-3">
            <h6 className="fw-bold mb-3">Average Fill by Type</h6>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={avgByType}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="#4285F4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h6 className="fw-bold mb-3">Quick Insights</h6>
            <ul className="list-unstyled small mb-0">
              <li>Average fill across all bins is <strong>{avgFill}%</strong></li>
              <li>{highBins} bins require immediate attention (≥80% full)</li>
              <li>{lowBins} bins are optimally filled (≤20% full)</li>
              <li>Most common waste type: <strong>{binsByType[0]?.name || 'Unknown'}</strong></li>
              <li>Top owner: <strong>{(function(){ const m=new Map(); bins.forEach(b=>m.set(b.ownerName,(m.get(b.ownerName)||0)+1)); return Array.from(m.entries()).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'})()}</strong></li>
            </ul>
          </div>
        </div>
      </div>
      <ExportConfirmation open={pdfExport.open} onClose={() => { if (pdfExport.url) { try { URL.revokeObjectURL(pdfExport.url); } catch(e){} } setPdfExport({ open:false, url:null, filename:null }); }} blobUrl={pdfExport.url} filename={pdfExport.filename} />
    </div>
  );
}
