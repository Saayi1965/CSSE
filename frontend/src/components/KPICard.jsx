import React from 'react';

export default function KPICard({ title, value, icon, color }) {
  return (
    <div className="card p-3 text-center">
      <div style={{ fontSize: 26, color }}>{icon}</div>
      <h6 className="mt-2 text-muted">{title}</h6>
      <h4 className="fw-bold" style={{ color }}>{value}</h4>
    </div>
  );
}
