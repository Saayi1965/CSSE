import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function UserDetails(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/users').then(res => {
      if (!mounted) return;
      setUsers(res.data || []);
    }).catch(() => {
      if (!mounted) return;
      setUsers([
        { id: '1', username: 'alice', role: 'ROLE_RESIDENTIAL' },
        { id: '2', username: 'bob', role: 'ROLE_COLLECTOR' },
        { id: '3', username: 'carol', role: 'ROLE_ADMIN' },
      ]);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>User Details</h2>
      {loading ? <div>Loading…</div> : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Username</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
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
  );
}
