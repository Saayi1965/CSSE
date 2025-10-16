import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/users')
      .then(res => {
        if (!mounted) return;
        setUsers(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load users', err);
        if (!mounted) return;
        setError('Failed to load users');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Overview of system status and user management.</p>

      <div className="row mb-4">
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

      <div>
        <h4>Users</h4>
        {loading && <div>Loading users…</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id || u.username}>
                    <td>{u.username}</td>
                    <td>{u.role?.replace('ROLE_','') || ''}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                      <button className="btn btn-sm btn-outline-danger">Disable</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
