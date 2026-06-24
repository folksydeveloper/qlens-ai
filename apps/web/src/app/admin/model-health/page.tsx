'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ModelHealthPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/model-health').then((r: any) => { setModels(r?.data || r || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Model Health</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.length === 0 ? (
          <div className="card text-center text-[var(--text-secondary)]">No model health data</div>
        ) : (
          models.map((m: any) => (
            <div key={m.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{m.model?.displayName || m.modelId}</h3>
                <span className={`badge ${m.status === 'HEALTHY' ? 'badge-success' : m.status === 'DEGRADED' ? 'badge-warning' : 'badge-error'}`}>
                  {m.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[var(--text-secondary)]">Latency P50: <span className="text-[var(--text-primary)]">{m.latencyP50 || 0}ms</span></div>
                <div className="text-[var(--text-secondary)]">Latency P95: <span className="text-[var(--text-primary)]">{m.latencyP95 || 0}ms</span></div>
                <div className="text-[var(--text-secondary)]">Error Rate: <span className="text-[var(--text-primary)]">{(m.errorRate || 0).toFixed(2)}%</span></div>
                <div className="text-[var(--text-secondary)]">Req/min: <span className="text-[var(--text-primary)]">{m.requestsPerMin || 0}</span></div>
                <div className="text-[var(--text-secondary)]">Tokens/min: <span className="text-[var(--text-primary)]">{(m.tokensPerMin || 0).toLocaleString()}</span></div>
                <div className="text-[var(--text-secondary)]">Active Streams: <span className="text-[var(--text-primary)]">{m.activeStreams || 0}</span></div>
                <div className="text-[var(--text-secondary)]">Queue Depth: <span className="text-[var(--text-primary)]">{m.queueDepth || 0}</span></div>
                <div className="text-[var(--text-secondary)]">Last Beat: <span className="text-[var(--text-primary)]">{m.lastHeartbeat ? new Date(m.lastHeartbeat).toLocaleTimeString('id-ID') : 'Never'}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
