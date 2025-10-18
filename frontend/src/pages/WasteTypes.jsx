import React, { useEffect, useMemo, useState } from "react";
import KPICard from "../components/KPICard";
import InsightCard from "../components/InsightCard";
import AlertBar from "../components/AlertBar";
import api from "../api/api";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import illustration from "../assets/recycle-illustration.png";
import { Download, RefreshCw, Search, Filter, ChevronDown, ChevronUp, FileText, Table, BarChart3, PieChart as PieChartIcon, AlertTriangle, CheckCircle } from "lucide-react";
import ExportConfirmation from '../components/ExportConfirmation';
import { useToast } from '../components/Toast';
import "../styles/theme.css";

export default function WasteTypes() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'desc' });
  const [types, setTypes] = useState([]);
  const [owners, setOwners] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [viewMode, setViewMode] = useState('table');
  const toast = useToast();
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => { loadBins(); }, []);
  useEffect(() => { loadLookup(); }, []);

  const normalizeBin = (raw) => {
    if (!raw) return raw;
    return {
      id: raw.binId || raw.id || raw._id || raw._key || raw._id_str || raw._id?.toString?.() || raw.id_str,
      location: raw.location || raw.address || raw.place || raw.loc || raw.locationName || raw.location || '—',
      type: raw.binType || raw.type || raw.wasteType || 'Unknown',
      owner: raw.ownerName || raw.owner || raw.managedBy || 'Unassigned',
      capacity: raw.binSize || raw.capacity || raw.capacityL || '—',
      level: typeof raw.level === 'number' ? raw.level : (raw.fillLevel || raw.fill || 0),
      status: raw.status || raw.monitorStatus || 'unknown',
      lastCollected: raw.lastCollected || raw.lastCollection || raw.lastModified || raw.lastUpdated || raw.updatedAt || null,
      scheduledAt: raw.nextCollection || raw.scheduledAt || raw.scheduledFor || null,
      __raw: raw
    };
  };

  const loadBins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bins');
      const mapped = (res.data || []).map(normalizeBin);
      setBins(mapped);
    } catch (e) {
      console.error('Failed to load bins', e);
      setError('Failed to load bin data (showing sample)');
      setBins([
        { 
          id: 'B-101', 
          location: 'North Zone - Colombo', 
          level: 78, 
          type: 'Plastic', 
          owner: 'Municipal Council',
          capacity: '240L',
          lastCollected: '2024-01-15T08:30:00',
          scheduledAt: '2024-01-20T09:00:00',
          status: 'active'
        },
        { 
          id: 'B-102', 
          location: 'South Zone - Dehiwala', 
          level: 42, 
          type: 'Organic', 
          owner: 'Private Contractor',
          capacity: '120L',
          lastCollected: '2024-01-16T10:15:00',
          scheduledAt: '2024-01-21T14:00:00',
          status: 'active'
        },
        { 
          id: 'B-103', 
          location: 'East Zone - Kandy', 
          level: 93, 
          type: 'Plastic', 
          owner: 'Municipal Council',
          capacity: '240L',
          lastCollected: '2024-01-14T15:45:00',
          scheduledAt: '2024-01-19T11:30:00',
          status: 'maintenance'
        },
        { 
          id: 'B-104', 
          location: 'West Zone - Galle', 
          level: 12, 
          type: 'Paper', 
          owner: 'Shopping Complex',
          capacity: '180L',
          lastCollected: '2024-01-17T13:20:00',
          scheduledAt: '2024-01-22T16:00:00',
          status: 'active'
        },
        { 
          id: 'B-105', 
          location: 'Central Zone - Negombo', 
          level: 65, 
          type: 'Glass', 
          owner: 'Private Contractor',
          capacity: '120L',
          lastCollected: '2024-01-16T09:30:00',
          scheduledAt: '2024-01-21T10:00:00',
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadLookup = async () => {
    try {
      const t = await api.get('/bins/types');
      const o = await api.get('/bins/owners');
      setTypes(t.data || []);
      setOwners(o.data || []);
    } catch (e) {
      setTypes(['Plastic', 'Organic', 'Paper', 'Glass', 'Metal', 'Mixed']);
      setOwners(['Municipal Council', 'Private Contractor', 'Shopping Complex', 'Office Building', 'Residential Complex']);
    }
  };

  const categorizedBins = useMemo(() => {
    const categories = {};
    
    bins.forEach(bin => {
      const owner = bin.owner || 'Unassigned';
      const type = bin.type || 'Unknown';
      
      if (!categories[owner]) {
        categories[owner] = {};
      }
      if (!categories[owner][type]) {
        categories[owner][type] = [];
      }
      
      categories[owner][type].push(bin);
    });
    
    return categories;
  }, [bins]);

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    let list = bins.slice();
    
    if (typeFilter) list = list.filter(b => ((b.type || '').toString().toLowerCase() === (typeFilter || '').toString().toLowerCase()));
    if (ownerFilter) list = list.filter(b => ((b.owner || '').toString().toLowerCase() === (ownerFilter || '').toString().toLowerCase()));
    if (q) list = list.filter(b => 
      (b.id || '').toLowerCase().includes(q) || 
      (b.location || '').toLowerCase().includes(q) ||
      (b.type || '').toLowerCase().includes(q) ||
      (b.owner || '').toLowerCase().includes(q)
    );
    
    if (sortConfig.key) {
      list.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return list;
  }, [bins, query, typeFilter, ownerFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const avgLevel = bins.length ? Math.round(bins.reduce((s, b) => s + (b.level || 0), 0) / bins.length) : 0;
  const highBins = bins.filter(b => (b.level || 0) >= 80).length;
  const lowBins = bins.filter(b => (b.level || 0) <= 20).length;
  
  const typeStats = useMemo(() => {
    const stats = {};
    bins.forEach(bin => {
      const type = bin.type || 'Unknown';
      if (!stats[type]) {
        stats[type] = { count: 0, totalLevel: 0, averageLevel: 0 };
      }
      stats[type].count++;
      stats[type].totalLevel += bin.level || 0;
      stats[type].averageLevel = Math.round(stats[type].totalLevel / stats[type].count);
    });
    return Object.entries(stats).map(([type, data]) => ({
      type,
      count: data.count,
      averageLevel: data.averageLevel
    }));
  }, [bins]);

  const COLORS = ["#34A853", "#4285F4", "#F39C12", "#9C27B0", "#E91E63", "#FF5722"];

  const typeColor = (t) => {
    if (!t) return '#6c757d';
    const typeColors = {
      'plastic': '#4285F4',
      'organic': '#34A853',
      'paper': '#F39C12',
      'glass': '#9C27B0',
      'metal': '#E91E63',
      'mixed': '#FF5722'
    };
    return typeColors[t.toLowerCase()] || '#6c757d';
  };

  const statusBadge = (status) => {
    const statusConfig = {
      'active': { class: 'bg-success', text: 'Active', icon: CheckCircle },
      'maintenance': { class: 'bg-warning', text: 'Maintenance', icon: AlertTriangle },
      'inactive': { class: 'bg-secondary', text: 'Inactive', icon: ChevronDown },
      'full': { class: 'bg-danger', text: 'Full', icon: AlertTriangle }
    };
    const config = statusConfig[status] || { class: 'bg-secondary', text: 'Unknown', icon: ChevronDown };
    const IconComponent = config.icon;
    return (
      <span className={`badge ${config.class} d-flex align-items-center gap-1`} style={{ fontSize: '0.7rem' }}>
        <IconComponent size={10} />
        {config.text}
      </span>
    );
  };

  const fmtDate = (s) => {
    if (!s) return '—';
    try { 
      return new Date(s).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }); 
    } catch (e) { return s; }
  };

  const downloadCsv = () => {
    setExportLoading(true);
    const params = {
      type: typeFilter || undefined,
      owner: ownerFilter || undefined,
      search: query || undefined,
    };

    api.get('/bins/export/csv', { params, responseType: 'arraybuffer' })
      .then(res => {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bins-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(async err => {
        try {
          if (err.response && err.response.data) {
            const text = new TextDecoder().decode(err.response.data);
            try {
              const j = JSON.parse(text);
              toast.show('Export failed: ' + (j.message || j.error || text), { type: 'error' });
              return;
            } catch (e) {
              // not JSON
            }
          }
          toast.show('CSV export failed', { type: 'error' });
        } catch (ex) { console.error('Toast failed', ex); }
      })
      .finally(() => setExportLoading(false));
  };

  const downloadPdf = () => {
    setExportLoading(true);
    const params = {
      type: typeFilter || undefined,
      owner: ownerFilter || undefined,
      search: query || undefined,
    };

    api.get('/bins/export/pdf', { params, responseType: 'arraybuffer' })
      .then(res => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        // show confirmation modal with download
        setPdfExport({ open: true, url, filename: `bins-report-${new Date().toISOString().split('T')[0]}.pdf` });
      })
      .catch(async err => {
        try {
          if (err.response && err.response.data) {
            const text = new TextDecoder().decode(err.response.data);
            try {
              const j = JSON.parse(text);
              toast.show('Export failed: ' + (j.message || j.error || text), { type: 'error' });
              return;
            } catch (e) {
              // not JSON
            }
          }
          toast.show('PDF export failed', { type: 'error' });
        } catch (ex) { console.error('Toast failed', ex); }
      })
      .finally(() => setExportLoading(false));
  };

  const [pdfExport, setPdfExport] = useState({ open: false, url: null, filename: null });

  const closePdfExport = () => {
    if (pdfExport.url) {
      try { URL.revokeObjectURL(pdfExport.url); } catch (e) { /* ignore */ }
    }
    setPdfExport({ open: false, url: null, filename: null });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown size={14} className="text-muted" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  if (loading && bins.length === 0) return <div className="p-4 text-center">Loading Waste Analytics...</div>;

  return (
    <div className="container-fluid py-4">
      <ExportConfirmation open={pdfExport.open} onClose={closePdfExport} blobUrl={pdfExport.url} filename={pdfExport.filename} />
      {error && <AlertBar message={error} type="warning" />}
      {!error && <AlertBar message={`Monitoring ${bins.length} smart bins — ${highBins} near full capacity`} type="info" />}

      {/* Header Section */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary rounded-3 p-2">
              <BarChart3 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="h3 mb-1 fw-bold text-dark">Waste Management Dashboard</h1>
              <p className="text-muted mb-0">Monitor and manage smart bin operations in real-time</p>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="btn-group shadow-sm">
            <button 
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-light'} d-flex align-items-center gap-2`}
              onClick={() => setViewMode('table')}
            >
              <Table size={16} />
              Table View
            </button>
            <button 
              className={`btn ${viewMode === 'categorized' ? 'btn-primary' : 'btn-light'} d-flex align-items-center gap-2`}
              onClick={() => setViewMode('categorized')}
            >
              <Filter size={16} />
              Categorized
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-4 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Search Bins</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Search by ID, location, type..." 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                />
              </div>
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Waste Type</label>
              <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Owner</label>
              <select className="form-select" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
                <option value="">All owners</option>
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="col-lg-5 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Actions</label>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary d-flex align-items-center gap-2 flex-1 justify-content-center" 
                  onClick={() => loadBins()} 
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                  {loading ? 'Loading...' : 'Refresh Data'}
                </button>
                <button 
                  className="btn btn-success d-flex align-items-center gap-2 flex-1 justify-content-center"
                  onClick={downloadCsv}
                  disabled={exportLoading}
                >
                  <Download size={16} />
                  CSV
                </button>
                <button 
                  className="btn btn-danger d-flex align-items-center gap-2 flex-1 justify-content-center"
                  onClick={downloadPdf}
                  disabled={exportLoading}
                >
                  <FileText size={16} />
                  {exportLoading ? 'Generating…' : 'PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Improved Alignment */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted text-uppercase small fw-semibold mb-1">Total Bins</h6>
                  <h3 className="fw-bold text-dark mb-0">{bins.length}</h3>
                  <small className="text-muted">Active monitoring</small>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                  <div className="text-primary fw-bold">🗑️</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted text-uppercase small fw-semibold mb-1">Avg Fill Level</h6>
                  <h3 className="fw-bold mb-0" style={{ color: avgLevel > 80 ? '#EA4335' : avgLevel > 60 ? '#FBBC05' : '#34A853' }}>
                    {avgLevel}%
                  </h3>
                  <small className="text-muted">Across all bins</small>
                </div>
                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                  <div className="text-success fw-bold">📊</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted text-uppercase small fw-semibold mb-1">Bins ≥80% Full</h6>
                  <h3 className="fw-bold text-warning mb-0">{highBins}</h3>
                  <small className="text-muted">Require attention</small>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                  <div className="text-warning fw-bold">⚠️</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted text-uppercase small fw-semibold mb-1">Bins ≤20% Full</h6>
                  <h3 className="fw-bold text-success mb-0">{lowBins}</h3>
                  <small className="text-muted">Optimal status</small>
                </div>
                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                  <div className="text-success fw-bold">✅</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Perfectly Aligned */}
      <div className="row g-4 mb-4">
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-2">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-bold text-dark">Fill Level Distribution</h6>
                <PieChartIcon size={18} className="text-muted" />
              </div>
            </div>
            <div className="card-body pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie 
                    data={bins.map((b, i) => ({ name: b.id, value: b.level }))} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius={80} 
                    innerRadius={40}
                    label={({ value }) => `${value}%`}
                  >
                    {bins.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Fill Level']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-2">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-bold text-dark">Bins by Waste Type</h6>
                <BarChart3 size={18} className="text-muted" />
              </div>
            </div>
            <div className="card-body pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={typeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4285F4" radius={[4, 4, 0, 0]} name="Number of Bins" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-2">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-bold text-dark">Avg Fill by Type</h6>
                <BarChart3 size={18} className="text-muted" />
              </div>
            </div>
            <div className="card-body pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={typeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Average Fill']} />
                  <Bar dataKey="averageLevel" name="Average Fill Level" radius={[4, 4, 0, 0]}>
                    {typeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={typeColor(entry.type)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="row g-4">
        <div className={viewMode === 'categorized' ? 'col-12' : 'col-xl-8'}>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 pb-3">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold text-dark">
                  {viewMode === 'table' ? 'Bin Inventory' : 'Bins by Category'}
                </h5>
                <div className="d-flex align-items-center gap-3">
                  <small className="text-muted">
                    Showing {filtered.length} of {bins.length} bins
                  </small>
                  <div className="bg-light rounded-pill px-3 py-1">
                    <small className="text-muted fw-semibold">
                      Sort: {sortConfig.key} ({sortConfig.direction})
                    </small>
                  </div>
                </div>
              </div>
            </div>
            
            {viewMode === 'table' ? (
              /* Table View */
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th onClick={() => handleSort('id')} style={{cursor: 'pointer', width: '120px'}}>
                        <div className="d-flex align-items-center gap-1 text-uppercase small fw-semibold text-muted">
                          Bin ID <SortIcon column="id" />
                        </div>
                      </th>
                      <th onClick={() => handleSort('location')} style={{cursor: 'pointer'}}>
                        <div className="d-flex align-items-center gap-1 text-uppercase small fw-semibold text-muted">
                          Location <SortIcon column="location" />
                        </div>
                      </th>
                      <th onClick={() => handleSort('type')} style={{cursor: 'pointer', width: '120px'}}>
                        <div className="d-flex align-items-center gap-1 text-uppercase small fw-semibold text-muted">
                          Type <SortIcon column="type" />
                        </div>
                      </th>
                      <th onClick={() => handleSort('owner')} style={{cursor: 'pointer', width: '150px'}}>
                        <div className="d-flex align-items-center gap-1 text-uppercase small fw-semibold text-muted">
                          Owner <SortIcon column="owner" />
                        </div>
                      </th>
                      <th style={{width: '100px'}} className="text-uppercase small fw-semibold text-muted">Capacity</th>
                      <th onClick={() => handleSort('level')} style={{cursor: 'pointer', width: '140px'}}>
                        <div className="d-flex align-items-center gap-1 text-uppercase small fw-semibold text-muted">
                          Fill Level <SortIcon column="level" />
                        </div>
                      </th>
                      <th style={{width: '120px'}} className="text-uppercase small fw-semibold text-muted">Status</th>
                      <th style={{width: '160px'}} className="text-uppercase small fw-semibold text-muted">Last Collected</th>
                      <th style={{width: '180px'}} className="text-uppercase small fw-semibold text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(bin => (
                      <tr key={bin.id} className={bin.level >= 80 ? 'table-warning' : (bin.level <= 20 ? 'table-success' : '')}>
                        <td className="fw-semibold text-dark">{bin.id}</td>
                        <td>
                          <div className="small text-muted">{bin.location}</div>
                        </td>
                        <td>
                          <span 
                            className="badge fw-semibold" 
                            style={{
                              background: typeColor(bin.type), 
                              color: '#fff', 
                              padding: '6px 8px', 
                              borderRadius: '6px',
                              fontSize: '0.7rem'
                            }}
                          >
                            {bin.type || 'Unknown'}
                          </span>
                        </td>
                        <td className="small text-dark">{bin.owner || '—'}</td>
                        <td className="small text-muted">{bin.capacity || '—'}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="flex-grow-1">
                              <div className="progress" style={{height: '8px'}}>
                                <div 
                                  className={`progress-bar ${bin.level >= 80 ? 'bg-danger' : (bin.level <= 20 ? 'bg-success' : 'bg-primary')}`} 
                                  role="progressbar" 
                                  style={{width: `${bin.level}%`}} 
                                />
                              </div>
                            </div>
                            <small className="fw-semibold" style={{minWidth: '35px'}}>{bin.level}%</small>
                          </div>
                        </td>
                        <td>{statusBadge(bin.status)}</td>
                        <td className="small text-muted">{fmtDate(bin.lastCollected)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={async () => {
                                const defaultTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
                                const when = prompt('Schedule collection (date and time):', defaultTime);
                                if (!when) return;
                                try {
                                  await api.post(`/bins/${bin.id}/schedule`, { scheduledAt: when });
                                  toast.show(`Scheduled ${bin.id} collection for ${new Date(when).toLocaleString()}`, { type: 'success' });
                                  setBins(prev => prev.map(x => x.id === bin.id ? { ...x, scheduledAt: when } : x));
                                } catch (e) {
                                  console.error('Schedule failed', e);
                                  toast.show('Failed to schedule collection', { type: 'error' });
                                }
                              }}
                            >
                              Schedule
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                navigator.clipboard?.writeText(JSON.stringify(bin, null, 2));
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Categorized View */
              <div className="card-body">
                {Object.entries(categorizedBins).map(([owner, types]) => (
                  <div key={owner} className="mb-4">
                    <div 
                      className="d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                      onClick={() => toggleCategory(owner)}
                      style={{cursor: 'pointer'}}
                    >
                      <h6 className="mb-0 fw-bold text-dark">
                        {owner} 
                        <span className="badge bg-primary ms-2">
                          {Object.values(types).flat().length} bins
                        </span>
                      </h6>
                      {expandedCategories.has(owner) ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    
                    {expandedCategories.has(owner) && (
                      <div className="mt-2">
                        {Object.entries(types).map(([type, bins]) => (
                          <div key={type} className="card mt-2 border-0 shadow-sm">
                            <div className="card-header bg-white py-2 border-0">
                              <div className="d-flex align-items-center gap-2">
                                <span 
                                  className="badge fw-semibold"
                                  style={{
                                    background: typeColor(type),
                                    color: '#fff'
                                  }}
                                >
                                  {type}
                                </span>
                                <small className="text-muted">{bins.length} bins</small>
                              </div>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                  <thead>
                                    <tr>
                                      <th className="small fw-semibold text-muted">Bin ID</th>
                                      <th className="small fw-semibold text-muted">Location</th>
                                      <th className="small fw-semibold text-muted">Fill Level</th>
                                      <th className="small fw-semibold text-muted">Capacity</th>
                                      <th className="small fw-semibold text-muted">Status</th>
                                      <th className="small fw-semibold text-muted">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bins.map(bin => (
                                      <tr key={bin.id}>
                                        <td className="fw-semibold small">{bin.id}</td>
                                        <td className="small">{bin.location}</td>
                                        <td>
                                          <div className="d-flex align-items-center gap-2">
                                            <div className="progress flex-grow-1" style={{height: '6px'}}>
                                              <div 
                                                className={`progress-bar ${bin.level >= 80 ? 'bg-danger' : (bin.level <= 20 ? 'bg-success' : 'bg-primary')}`}
                                                style={{width: `${bin.level}%`}}
                                              />
                                            </div>
                                            <small className="fw-semibold">{bin.level}%</small>
                                          </div>
                                        </td>
                                        <td className="small">{bin.capacity || '—'}</td>
                                        <td>{statusBadge(bin.status)}</td>
                                        <td>
                                          <button 
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                              const defaultTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
                                              const when = prompt('Schedule collection:', defaultTime);
                                              if (when) {
                                                // Handle schedule
                                              }
                                            }}
                                          >
                                            Schedule
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {viewMode === 'table' && (
          <div className="col-xl-4">
            <InsightCard 
              title="Key Insights" 
              insights={[
                `Average fill level across all bins is ${avgLevel}%`,
                `${highBins} bins require immediate attention (≥80% full)`,
                `${lowBins} bins are optimally filled (≤20% full)`,
                `Most common waste type: ${typeStats.length ? typeStats.reduce((a, b) => a.count > b.count ? a : b).type : 'N/A'}`,
                `Collection efficiency: ${bins.filter(b => b.level < 50).length} bins below 50% capacity`
              ]} 
            />
            
            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 pt-4 pb-2">
                <h6 className="mb-0 fw-bold text-dark">Quick Actions</h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2">
                    <RefreshCw size={16} />
                    Generate Collection Route
                  </button>
                  <button className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2">
                    <AlertTriangle size={16} />
                    Send Maintenance Alerts
                  </button>
                  <button className="btn btn-outline-info d-flex align-items-center justify-content-center gap-2">
                    <BarChart3 size={16} />
                    View Performance Report
                  </button>
                </div>
              </div>
            </div>

            <div className="card mt-4 border-0 shadow-sm text-center">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 text-dark">Recycling Awareness</h6>
                <img src={illustration} alt="recycle" className="img-fluid rounded mb-3" style={{maxHeight: '120px'}} />
                <p className="small text-muted mb-0">
                  Proper waste segregation helps in efficient recycling and environmental conservation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add CSS for spinner animation
const styles = `
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);