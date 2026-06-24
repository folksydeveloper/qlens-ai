'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/usage/summary').catch(() => null),
      apiFetch('/users/me').catch(() => null),
    ]).then(([usage, user]) => {
      setStats({ usage, user });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  const usage = stats?.usage || {};
  const quotaUsed = usage.tokensUsed || 0;
  const quotaLimit = usage.tokensLimit || 100000;
  const quotaPct = Math.min((quotaUsed / quotaLimit) * 100, 100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tokens Used Today', value: quotaUsed.toLocaleString(), icon: '📊', color: 'text-[var(--accent)]' },
          { label: 'Daily Quota', value: `${quotaPct.toFixed(0)}%`, icon: '🎯', color: quotaPct > 80 ? 'text-[var(--error)]' : 'text-[var(--success)]' },
          { label: 'API Keys', value: usage.activeKeys ?? 0, icon: '🔑', color: 'text-yellow-400' },
          { label: 'Plan', value: stats?.user?.subscription?.plan?.displayName || 'Free', icon: '💎', color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quota Bar */}
      <div className="card mb-8">
        <h3 className="font-semibold mb-3">Daily Token Usage</h3>
        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 mb-2">
          <div className="bg-[var(--accent)] h-3 rounded-full transition-all" style={{ width: `${quotaPct}%` }} />
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()} tokens</div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold mb-4">Quick Start</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <h4 className="font-medium mb-2">1. Generate API Key</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Buat API key baru di halaman API Keys</p>
            <a href="/dashboard/api-keys" className="text-[var(--accent)] text-sm hover:underline">Go to API Keys →</a>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <h4 className="font-medium mb-2">2. Configure Your Tool</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Set base_url ke https://api.qlens.ai/v1 dan masukkan API key</p>
            <a href="/dashboard/docs" className="text-[var(--accent)] text-sm hover:underline">View Docs →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
