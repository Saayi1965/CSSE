import React, { useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import mapPlaceholder from "../assets/map-placeholder.png";
import api from "../api/api";
import {
  Filter,
  Download,
  Calendar,
  MapPin,
  Truck,
  Zap,
  Clock,
  Target,
  BarChart3,
  RefreshCw
} from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState({
    startDate: "2024-03-01",
    endDate: "2024-03-15",
    zone: "All",
    wasteType: "All",
  });

  const fetchAnalyticsData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = {
        kpis: {
          avgVehicle: "1.2 t/vehicle",
          efficiency: "92%",
          totalZones: 12,
          delayRate: "3%",
          totalCollected: "18.5t",
          completionRate: "97%"
        },
        chartData: [
          { date: "Mar 01", collected: 1200, efficiency: 90, target: 1300 },
          { date: "Mar 02", collected: 1400, efficiency: 92, target: 1350 },
          { date: "Mar 03", collected: 1350, efficiency: 91, target: 1400 },
          { date: "Mar 04", collected: 1550, efficiency: 93, target: 1450 },
          { date: "Mar 05", collected: 1420, efficiency: 94, target: 1420 },
          { date: "Mar 06", collected: 1380, efficiency: 89, target: 1380 },
          { date: "Mar 07", collected: 1620, efficiency: 95, target: 1500 },
        ],
        table: [
          { id: 1, date: "Mar 01", route: "A1 - Downtown Loop", vehicle: "VH-21", collected: 420, status: "Completed", efficiency: 94 },
          { id: 2, date: "Mar 01", route: "A2 - Residential East", vehicle: "VH-22", collected: 380, status: "Delayed", efficiency: 85 },
          { id: 3, date: "Mar 02", route: "B1 - Commercial District", vehicle: "VH-18", collected: 490, status: "Completed", efficiency: 96 },
          { id: 4, date: "Mar 03", route: "C1 - University Zone", vehicle: "VH-12", collected: 510, status: "Completed", efficiency: 98 },
          { id: 5, date: "Mar 04", route: "D1 - Industrial Park", vehicle: "VH-15", collected: 610, status: "Completed", efficiency: 92 },
        ],
        mapData: {
          activeRoutes: 8,
          delayedRoutes: 1,
          completedToday: 12
        }
      };
      setData(mockData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log("Exporting analytics data...");
  };

  const handleApplyFilters = () => {
    fetchAnalyticsData(true);
  };

  const handleResetFilters = () => {
    setFilter({
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      zone: "All",
      wasteType: "All",
    });
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading analytics...</span>
            </div>
            <h5 className="text-muted">Loading Analytics Dashboard</h5>
            <p className="text-muted">Preparing your performance insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="bg-primary bg-opacity-10 rounded-3 p-3">
              <BarChart3 size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">Performance Analytics</h1>
              <p className="text-muted mb-0">Monitor collection efficiency and operational metrics</p>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={handleExport}
          >
            <Download size={18} />
            Export Report
          </button>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 border-0">
          <div className="d-flex align-items-center gap-2">
            <Filter size={20} className="text-primary" />
            <h6 className="mb-0 fw-semibold">Filters & Date Range</h6>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-xl-3 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">
                <Calendar size={14} className="me-2" />
                START DATE
              </label>
              <input
                type="date"
                className="form-control"
                value={filter.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div className="col-xl-3 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">
                <Calendar size={14} className="me-2" />
                END DATE
              </label>
              <input
                type="date"
                className="form-control"
                value={filter.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className="col-xl-3 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">
                <MapPin size={14} className="me-2" />
                ZONE
              </label>
              <select
                className="form-select"
                value={filter.zone}
                onChange={(e) => handleFilterChange("zone", e.target.value)}
              >
                <option>All Zones</option>
                <option>Zone A - Downtown</option>
                <option>Zone B - Residential</option>
                <option>Zone C - Commercial</option>
                <option>Zone D - Industrial</option>
              </select>
            </div>
            <div className="col-xl-3 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">
                WASTE TYPE
              </label>
              <select
                className="form-select"
                value={filter.wasteType}
                onChange={(e) => handleFilterChange("wasteType", e.target.value)}
              >
                <option>All Types</option>
                <option>Organic</option>
                <option>Plastic</option>
                <option>Paper</option>
                <option>Metal</option>
                <option>Glass</option>
              </select>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-end gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleApplyFilters}
              >
                <Filter size={16} />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="row g-4 mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6">
          <KPICard 
            title="Avg per Vehicle" 
            value={data.kpis.avgVehicle} 
            icon={<Truck size={24} />} 
            color="#6366F1"
            trend="+0.2t"
            description="Average collection per vehicle"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <KPICard 
            title="Efficiency" 
            value={data.kpis.efficiency} 
            icon={<Zap size={24} />} 
            color="#10B981"
            trend="+2%"
            description="Collection efficiency rate"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <KPICard 
            title="Active Zones" 
            value={data.kpis.totalZones} 
            icon={<MapPin size={24} />} 
            color="#8B5CF6"
            trend="+2"
            description="Operational zones"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <KPICard 
            title="Delay Rate" 
            value={data.kpis.delayRate} 
            icon={<Clock size={24} />} 
            color="#F59E0B"
            trend="-1%"
            description="On-time performance"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <KPICard 
            title="Total Collected" 
            value={data.kpis.totalCollected} 
            icon={<Target size={24} />} 
            color="#EC4899"
            trend="+2.3t"
            description="Total waste collected"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <KPICard 
            title="Completion Rate" 
            value={data.kpis.completionRate} 
            icon={<BarChart3 size={24} />} 
            color="#06B6D4"
            trend="+3%"
            description="Route completion rate"
          />
        </div>
      </div>

      {/* Charts + Map Section */}
      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <ChartCard 
            title="Collection Performance Trend" 
            data={data.chartData}
            timeframe="Last 7 Days"
            description="Daily collection volume and efficiency metrics"
          />
        </div>
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  <h6 className="mb-0 fw-semibold">Live Route Monitoring</h6>
                </div>
                <div className="badge bg-primary bg-opacity-10 text-primary">
                  Live
                </div>
              </div>
            </div>
            <div className="card-body p-0 position-relative">
              <img 
                src={mapPlaceholder} 
                alt="Live route monitoring map" 
                className="img-fluid w-100 rounded-bottom"
                style={{ minHeight: '300px', objectFit: 'cover' }}
              />
              
              {/* Map Overlay Stats */}
              <div className="position-absolute top-0 end-0 m-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body py-2">
                    <div className="row g-3 text-center">
                      <div className="col-4">
                        <div className="fw-bold text-success">{data.mapData.activeRoutes}</div>
                        <small className="text-muted">Active</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-warning">{data.mapData.delayedRoutes}</div>
                        <small className="text-muted">Delayed</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-primary">{data.mapData.completedToday}</div>
                        <small className="text-muted">Completed</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-semibold">Recent Collection Routes</h6>
              <small className="text-muted">Detailed breakdown of recent collection activities</small>
            </div>
            <div className="text-muted small">
              Showing {data.table.length} routes
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <DataTable rows={data.table} />
        </div>
      </div>

  <style>{`
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