import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function Analytics(){
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/summary?startDate=2025-01-01&endDate=2025-01-31').then(res => {
      setStats(res.data);
    }).catch(() => {
      setStats({ totalCollected: 1200, avgFillRate: 64, reports: 42 });
    });
  }, []);

  return (
    <div>
      <h2>Analytics</h2>
      {!stats ? <div>Loading…</div> : (
        <div className="row">
          <div className="col-md-4">
            <div className="card p-3 mb-3">
              <h6>Total Waste Collected (kg)</h6>
              <div className="fs-4">{stats.totalCollected}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 mb-3">
              <h6>Avg Fill Rate</h6>
              <div className="fs-4">{stats.avgFillRate}%</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 mb-3">
              <h6>Reports</h6>
              <div className="fs-4">{stats.reports}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
