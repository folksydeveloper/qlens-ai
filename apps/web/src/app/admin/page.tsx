'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminOverview().then((o) => { setOverview(o); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) return <div>Loading...</div>;

  const stats = [
    { label: 'Total Users', value: overview?.totalUsers || '0', icon: '👥' },
    { label: 'Active Subscriptions', value: overview?.activeSubscriptions || '0', icon: '💎' },
    { label: 'Total Revenue', value: `$${overview?.totalRevenue || '0'}`, icon: '💰' },
    { label: 'Open Abuse Alerts', value: overview?.openAbuseAlerts || '0', icon: '🚨' },
    { label: 'Total API Requests (24h)', value: overview?.totalRequests24h?.toLocaleString() || '0', icon: '📡' },
    { label: 'Models Online', value: `${overview?.modelsOnline || '0'}/${overview?.modelsTotal || '0'}`, icon: '🤖' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
