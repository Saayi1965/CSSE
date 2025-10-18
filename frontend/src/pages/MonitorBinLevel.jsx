import React, { useEffect, useState, useRef } from 'react';
import api from '../api/api';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Truck,
  MapPin,
  Battery,
  Clock,
  Filter,
  Search
} from 'lucide-react';

function LevelIndicator({ level }) {
  const getLevelConfig = (level) => {
    if (level >= 85) return {
      color: '#EF4444',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
      icon: <AlertTriangle size={16} />,
      label: 'Critical',
      description: 'Needs immediate collection'
    };
    if (level >= 60) return {
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FCD34D',
      icon: <Battery size={16} />,
      label: 'High',
      description: 'Schedule collection soon'
    };
    return {
      color: '#10B981',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      icon: <CheckCircle size={16} />,
      label: 'Normal',
      description: 'Operating normally'
    };
  };

  const config = getLevelConfig(level);

  return (
    <div className="d-flex align-items-center gap-2 p-2 rounded-2" 
         style={{
           backgroundColor: config.bgColor,
           border: `1px solid ${config.borderColor}`
         }}>
      <span style={{ color: config.color }}>
        {config.icon}
      </span>
      <div className="flex-grow-1">
        <div className="fw-semibold small" style={{ color: config.color }}>
          {config.label}
        </div>
        <div className="extra-small text-muted">
          {config.description}
        </div>
      </div>
    </div>
  );
}

function BinCard({ bin, onCollect }) {
  const [isCollecting, setIsCollecting] = useState(false);

  const handleCollect = async () => {
    setIsCollecting(true);
    try {
      await onCollect(bin.id);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsCollecting(false);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 85) return '#EF4444';
    if (level >= 60) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="col-12 col-sm-6 col-xl-4 mb-4">
      <div className="card border-0 shadow-sm h-100 transition-all hover-lift">
        <div className="card-body d-flex flex-column p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 rounded-2 p-2">
                <Truck size={20} className="text-primary" />
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">{bin.id}</h6>
                <div className="d-flex align-items-center gap-1 small text-muted">
                  <MapPin size={12} />
                  <span>{bin.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-end">
              <div className="fw-bold fs-3 mb-1" style={{ color: getLevelColor(bin.level ?? 0) }}>
                {bin.level ?? 0}%
              </div>
              <div className="extra-small text-muted">Fill Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Capacity</span>
              <span className="small fw-semibold" style={{ color: getLevelColor(bin.level ?? 0) }}>
                {bin.level ?? 0}% full
              </span>
            </div>
            <div 
              className="progress rounded-2" 
              style={{
                height: '8px',
                backgroundColor: '#F1F5F9'
              }}
            >
              <div
                className="progress-bar rounded-2"
                style={{
                  width: `${Math.min(100, bin.level ?? 0)}%`,
                  backgroundColor: getLevelColor(bin.level ?? 0),
                  transition: 'width 0.5s ease, background-color 0.5s ease'
                }}
              />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mb-4">
            <LevelIndicator level={bin.level ?? 0} />
          </div>

          {/* Actions */}
          <div className="mt-auto d-flex gap-2">
            <button 
              className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={() => console.log('View details', bin.id)}
            >
              <Info size={16} />
              Details
            </button>
            <button 
              className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${
                bin.level >= 60 ? 'btn-warning text-dark' : 'btn-outline-secondary'
              }`}
              onClick={handleCollect}
              disabled={isCollecting || bin.level === 0}
            >
              {isCollecting ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Truck size={16} />
                  Collect
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonitorBinLevel() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const mountedRef = useRef(true);

  const fetchBins = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    
    try {
      const res = await api.get('/bins');
      const data = res?.data || [];
      setBins(Array.isArray(data) ? data : []);
    } catch (err) {
      // Fallback mock data
      setBins([
        { id: 'B-101', location: 'Central Park Zone A', level: 78, lastCollected: '2024-03-20T08:30:00Z' },
        { id: 'B-102', location: 'Downtown Plaza', level: 42, lastCollected: '2024-03-21T14:15:00Z' },
        { id: 'B-103', location: 'University Campus', level: 93, lastCollected: '2024-03-19T16:45:00Z' },
        { id: 'B-104', location: 'Shopping Mall Entrance', level: 25, lastCollected: '2024-03-21T09:20:00Z' },
        { id: 'B-105', location: 'Residential Block B', level: 67, lastCollected: '2024-03-20T11:10:00Z' },
        { id: 'B-106', location: 'Business District', level: 15, lastCollected: '2024-03-21T07:45:00Z' },
      ]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
        setLastRefresh(new Date());
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchBins();
    const id = setInterval(() => {
      fetchBins();
    }, 15000); // refresh every 15s
    return () => { mountedRef.current = false; clearInterval(id); };
  }, []);

  const handleCollect = (binId) => {
    setBins(prev => prev.map(b => 
      b.id === binId 
        ? { ...b, level: 0, lastCollected: new Date().toISOString() } 
        : b
    ));
  };

  const handleManualRefresh = () => {
    fetchBins(true);
  };

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'critical' && bin.level >= 85) ||
                         (statusFilter === 'high' && bin.level >= 60 && bin.level < 85) ||
                         (statusFilter === 'normal' && bin.level < 60);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bins.length,
    critical: bins.filter(b => b.level >= 85).length,
    high: bins.filter(b => b.level >= 60 && b.level < 85).length,
    normal: bins.filter(b => b.level < 60).length
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-2">Smart Bin Monitoring</h1>
          <p className="text-muted mb-0">Real-time monitoring of waste bin fill levels across the city</p>
        </div>
        
        <div className="text-end">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Clock size={16} className="text-muted" />
            <span className="small text-muted">Last updated</span>
          </div>
          <div className="fw-semibold">
            {lastRefresh ? lastRefresh.toLocaleTimeString() : '—'}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-2 p-2 me-3">
                  <Truck size={20} className="text-primary" />
                </div>
                <div>
                  <div className="fw-bold fs-4 text-dark">{stats.total}</div>
                  <div className="small text-muted">Total Bins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 rounded-2 p-2 me-3">
                  <AlertTriangle size={20} className="text-danger" />
                </div>
                <div>
                  <div className="fw-bold fs-4 text-danger">{stats.critical}</div>
                  <div className="small text-muted">Critical</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-2 p-2 me-3">
                  <Battery size={20} className="text-warning" />
                </div>
                <div>
                  <div className="fw-bold fs-4 text-warning">{stats.high}</div>
                  <div className="small text-muted">High Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-2 p-2 me-3">
                  <CheckCircle size={20} className="text-success" />
                </div>
                <div>
                  <div className="fw-bold fs-4 text-success">{stats.normal}</div>
                  <div className="small text-muted">Normal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search bins by ID or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-4">
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="critical">Critical</option>
                <option value="high">High Level</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <button 
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bins Grid */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading bins...</span>
            </div>
            <p className="text-muted">Loading bin data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted">
              Showing {filteredBins.length} of {bins.length} bins
            </div>
            {searchTerm || statusFilter !== 'all' ? (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
          
          <div className="row">
            {filteredBins.map(bin => (
              <BinCard key={bin.id} bin={bin} onCollect={handleCollect} />
            ))}
          </div>
          
          {filteredBins.length === 0 && (
            <div className="text-center py-5">
              <Truck size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No bins found</h5>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        .extra-small {
          font-size: 0.75rem;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}