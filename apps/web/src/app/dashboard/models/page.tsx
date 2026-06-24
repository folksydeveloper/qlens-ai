'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/usage/models').then((m: any) => { setModels(m?.data || m || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Models</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {models.length === 0 ? (
          <div className="card text-center text-[var(--text-secondary)]">No models available</div>
        ) : (
          models.map((m, i) => (
            <div key={i} className="card hover:border-[var(--accent)]/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{m.displayName || m.publicModelId}</h3>
                <span className={`badge ${m.enabled ? 'badge-success' : 'badge-error'}`}>{m.enabled ? 'Available' : 'Disabled'}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3">{m.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[var(--text-secondary)]">Context: <span className="text-[var(--text-primary)]">{m.contextLength?.toLocaleString() || 'N/A'}</span></div>
                <div className="text-[var(--text-secondary)]">Max Output: <span className="text-[var(--text-primary)]">{m.maxOutputTokens?.toLocaleString() || 'N/A'}</span></div>
                <div className="text-[var(--text-secondary)]">Category: <span className="text-[var(--text-primary)]">{m.category}</span></div>
                <div className="text-[var(--text-secondary)]">Mode: <span className="text-[var(--text-primary)]">{m.compatibilityModes}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
