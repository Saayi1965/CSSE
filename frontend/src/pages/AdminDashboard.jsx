import React, { useEffect, useState } from 'react';
import KPICard from '../components/KPICard';
import api from '../api/api';
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#34A853', '#4285F4', '#F39C12', '#10B981'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview').then(res => {
      const d = res.data || {};
      // map backend shape to UI shape
      const totalWaste = d.totalKg ? `${Math.round(d.totalKg)} kg` : '0 kg';
      const recyclingRate = d.recyclingRate || 0;
      const activeZones = d.activeZones || 0;
      const efficiency = d.efficiency || 'N/A';
      const monthly = (d.monthlyTrend || []).map(m => ({ month: m.month, collected: m.weightKg, recycled: 0 }));
      const wasteTypes = Object.entries(d.byType || {}).map(([name, value]) => ({ name, value }));
      setData({ totalWaste, recyclingRate, activeZones, efficiency, monthly, wasteTypes, missedAlerts: d.missedPickups });
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="p-4">
      <div className={`alert ${data?.missedAlerts > 0 ? 'alert-danger' : 'alert-success'} d-flex justify-content-between align-items-center`}>
        <span>{data?.missedAlerts > 0 ? `⚠ ${data.missedAlerts} missed pickups` : 'All pickups on schedule'}</span>
        <button className="btn btn-sm btn-success" onClick={() => {
          // download CSV
          window.open('/api/admin/report.csv', '_blank');
        }}>Generate Report</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><KPICard title="Total Waste Collected" value={data.totalWaste} icon="🗑️" color="#4285F4" /></div>
        <div className="col-md-3"><KPICard title="Recycling Rate" value={`${data.recyclingRate}%`} icon="♻️" color="#34A853" /></div>
        <div className="col-md-3"><KPICard title="Active Zones" value={data.activeZones} icon="📍" color="#673AB7" /></div>
        <div className="col-md-3"><KPICard title="Efficiency" value={data.efficiency} icon="⚡" color="#F39C12" /></div>
      </div>

      <div className="row g-3">
        <div className="col-md-7">
          <div className="card p-3">
            <h6 className="fw-bold mb-3">Monthly Waste Trend</h6>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthly}>
                <Tooltip />
                <Line type="monotone" dataKey="collected" stroke="#4285F4" strokeWidth={2} name="Collected" />
                <Line type="monotone" dataKey="recycled" stroke="#34A853" strokeWidth={2} name="Recycled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card p-3 text-center">
            <h6 className="fw-bold mb-3">Waste Type Distribution</h6>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.wasteTypes} dataKey="value" nameKey="name" outerRadius={80} label>
                  {data.wasteTypes.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
