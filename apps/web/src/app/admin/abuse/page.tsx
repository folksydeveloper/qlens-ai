'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminAbusePage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminAbuseAlerts().then((a) => { setAlerts(a); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Abuse Alerts</h2>
      <div className="card">
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No abuse alerts. All clear! ✅</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alerts.map((a: any) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 text-sm">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm">{a.alertType}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.severity === 'HIGH' ? 'bg-red-100 text-red-800' : a.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{a.details}</td>
                  <td className="px-4 py-2 text-sm">{a.resolved ? '✅ Resolved' : '⏳ Open'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
