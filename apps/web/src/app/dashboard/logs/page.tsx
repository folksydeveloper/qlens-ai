'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      apiFetch('/usage/logs').catch(() => []),
      apiFetch('/usage/summary').catch(() => null),
    ]).then(([l, s]: any) => {
      setLogs(Array.isArray(l) ? l : l?.data || []);
      setSummary(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Request Logs</h1>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold">{summary.totalRequests || 0}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Requests</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">{(summary.totalTokens || 0).toLocaleString()}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Tokens</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">{summary.successRate || '0%'}</div>
            <div className="text-sm text-[var(--text-secondary)]">Success Rate</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Time</th>
                <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Model</th>
                <th className="text-right py-3 px-4 text-[var(--text-secondary)]">Tokens</th>
                <th className="text-right py-3 px-4 text-[var(--text-secondary)]">Latency</th>
                <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">No logs yet</td></tr>
              ) : (
                logs.slice(0, 50).map((log: any) => (
                  <tr key={log.id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-hover)]">
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 font-mono text-xs">{log.model || '-'}</td>
                    <td className="py-3 px-4 text-right">{(log.totalTokens || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{log.latency ? `${log.latency}ms` : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                        {log.status || 'ERROR'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
