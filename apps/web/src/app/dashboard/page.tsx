'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getUsageSummary(), api.listKeys()])
      .then(([s, k]) => {
        setSummary(s);
        setKeys(k);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  const stats = [
    { label: 'Total Tokens Used', value: summary?.totalTokens?.toLocaleString() || '0', icon: '📊' },
    { label: 'API Keys Active', value: keys.filter((k: any) => k.status === 'ACTIVE').length, icon: '🔑' },
    { label: 'Total Requests', value: summary?.totalRequests?.toLocaleString() || '0', icon: '📡' },
    { label: 'Current Plan', value: summary?.plan || 'Free', icon: '💎' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Usage chart placeholder */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Usage (Last 30 Days)</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          📈 Chart coming soon — integrate recharts
        </div>
      </div>

      {/* Recent API Keys */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent API Keys</h3>
        {keys.length === 0 ? (
          <p className="text-gray-500">No API keys yet. Create one in the API Keys section.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prefix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keys.slice(0, 5).map((key: any) => (
                  <tr key={key.id}>
                    <td className="px-4 py-2 text-sm">{key.name}</td>
                    <td className="px-4 py-2 text-sm font-mono">{key.keyPrefix}...</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${key.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(key.createdAt).toLocaleDateString()}</td>
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
