'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminModels().then((m) => { setModels(m); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Model Management</h2>
      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost/1K tokens</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {models.map((m: any) => (
              <tr key={m.id}>
                <td className="px-4 py-2 text-sm font-medium">{m.name}</td>
                <td className="px-4 py-2 text-sm">{m.provider}</td>
                <td className="px-4 py-2 text-sm">${m.costPer1kTokens}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
