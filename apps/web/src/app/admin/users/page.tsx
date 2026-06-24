'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.adminUsers({ page: 1, limit: 50 }).then((u) => { setUsers(u); setLoading(false); }).catch(console.error);
  }, []);

  const handleStatusChange = async (userId: string, status: string) => {
    await api.adminChangeStatus(userId, status);
    setUsers(users.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <input className="input max-w-md" placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users
              .filter((u: any) => u.email.toLowerCase().includes(search.toLowerCase()))
              .map((user: any) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 text-sm">{user.email}</td>
                  <td className="px-4 py-2 text-sm">{user.role}</td>
                  <td className="px-4 py-2 text-sm">
                    <select className="input py-1 text-sm" value={user.status} onChange={(e) => handleStatusChange(user.id, e.target.value)}>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.riskScore > 70 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button className="text-brand-600 hover:underline mr-2">View</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
