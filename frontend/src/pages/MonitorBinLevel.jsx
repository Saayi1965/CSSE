import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function MonitorBinLevel(){
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Try fetching from backend; fallback to mock data on error
    api.get('/bins').then(res => {
      if (!mounted) return;
      setBins(res.data || []);
    }).catch(() => {
      // mock data
      if (!mounted) return;
      setBins([
        { id: 'B-101', location: 'Zone A', level: 78 },
        { id: 'B-102', location: 'Zone B', level: 42 },
        { id: 'B-103', location: 'Zone C', level: 93 },
      ]);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Monitor Bin Level</h2>
      <p>Live view of bin fill-levels across the city.</p>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="row">
          {bins.map(b => (
            <div key={b.id} className="col-md-4">
              <div className="card mb-3 p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{b.id}</strong>
                    <div className="small text-muted">{b.location}</div>
                  </div>
                  <div style={{minWidth:80, textAlign:'right'}}>
                    <div className="fs-4">{b.level}%</div>
                    <div className="small text-muted">Fill level</div>
                  </div>
                </div>
                <div className="progress mt-2" style={{height:8}}>
                  <div className="progress-bar" style={{width: Math.min(100,b.level) + '%'}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
