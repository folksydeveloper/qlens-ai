'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/audit-logs').then((r: any) => { setLogs(r?.data || r || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Time</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Admin</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Action</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Entity</th>
              <th className="text-left py-3 px-4 text-[var(--text-secondary)]">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">No audit logs</td></tr>
            ) : (
              logs.slice(0, 100).map((log: any) => (
                <tr key={log.id} className="border-b border-[var(--border-color)]/50">
                  <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-xs">{log.adminId?.slice(0, 8) || 'system'}</td>
                  <td className="py-3 px-4"><span className="badge badge-info">{log.action}</span></td>
                  <td className="py-3 px-4 text-xs">{log.entityType}#{log.entityId?.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-xs text-[var(--text-secondary)] truncate max-w-xs">{log.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
