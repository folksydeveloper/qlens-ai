'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/usage-logs').then((r: any) => { setLogs(r?.data || r || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usage Logs (All Users)</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Time</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">User</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Model</th>
              <th className="text-right py-3 px-4 text-[var(--text-secondary)]">Tokens</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Source</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-[var(--text-secondary)]">No logs</td></tr>
            ) : (
              logs.slice(0, 100).map((log: any) => (
                <tr key={log.id} className="border-b border-[var(--border-color)]/50">
                  <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">{log.userId?.slice(0, 8)}...</td>
                  <td className="py-3 px-4 font-mono text-xs">{log.model}</td>
                  <td className="py-3 px-4 text-right">{(log.totalTokens || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs">{log.deductionSource}</td>
                  <td className="py-3 px-4"><span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>{log.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
