import React from 'react';

export default function AdminDashboard(){
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Overview of system status, quick metrics and actions for administrators.</p>
      <div className="row">
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6>Active Bins</h6>
            <div className="fs-4">128</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6>Pending Reports</h6>
            <div className="fs-4">24</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6>Collectors Online</h6>
            <div className="fs-4">12</div>
          </div>
        </div>
      </div>
    </div>
  );
}
