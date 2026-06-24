'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function UsagePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getUsageSummary(), api.getUsageLogs({ limit: 50 })])
      .then(([s, l]) => {
        setSummary(s);
        setLogs(l);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Usage</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Tokens</p>
          <p className="text-2xl font-bold">{summary?.totalTokens?.toLocaleString() || '0'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold">{summary?.totalRequests?.toLocaleString() || '0'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg Latency</p>
          <p className="text-2xl font-bold">{summary?.avgLatency ? `${summary.avgLatency}ms` : 'N/A'}</p>
        </div>
      </div>

      {/* Logs */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Request Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">No usage logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Input</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm font-mono">{log.model}</td>
                    <td className="px-4 py-2 text-sm">{log.inputTokens?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{log.outputTokens?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm font-medium">{log.totalTokens?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{log.latency}ms</td>
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
