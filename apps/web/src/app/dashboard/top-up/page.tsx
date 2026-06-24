'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function TopUpPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/billing/top-up-packages').catch(() => []),
      apiFetch('/billing/subscription').catch(() => ({ topupBalance: 0 })),
    ]).then(([pkgs, sub]: any) => {
      setPackages(pkgs || []);
      setBalance(sub?.topupBalance || 0);
      setLoading(false);
    });
  }, []);

  const handlePurchase = async (pkgId: string) => {
    setProcessing(true);
    try {
      const res = await apiFetch('/billing/top-up', { method: 'POST', body: JSON.stringify({ packageId: pkgId }) });
      if (res?.invoiceUrl) {
        window.open(res.invoiceUrl, '_blank');
      }
      alert('Payment initiated! Complete payment to receive tokens.');
    } catch (e: any) {
      alert(e.message || 'Payment failed');
    }
    setProcessing(false);
  };

  if (loading) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Top Up Token</h1>
      <p className="text-[var(--text-secondary)] mb-6">Beli token tambahan untuk dipakai saat daily quota habis. Token tidak pernah expired.</p>

      {/* Balance */}
      <div className="card mb-8 bg-[var(--accent)]/5 border-[var(--accent)]/30">
        <div className="text-sm text-[var(--text-secondary)] mb-1">Top Up Balance</div>
        <div className="text-3xl font-bold text-[var(--accent)]">{balance.toLocaleString()} tokens</div>
      </div>

      {/* Packages */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.length === 0 ? (
          <div className="card text-center text-[var(--text-secondary)]">No packages available</div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="card hover:border-[var(--accent)]/50 transition-colors cursor-pointer" onClick={() => setSelected(pkg.id)}>
              <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
              <div className="text-2xl font-bold text-[var(--accent)] mb-1">{(pkg.price / 100).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
              <div className="text-lg text-[var(--text-secondary)] mb-4">{(pkg.tokens / 1000000).toFixed(1)}M tokens</div>
              <button
                onClick={(e) => { e.stopPropagation(); handlePurchase(pkg.id); }}
                disabled={processing}
                className="btn-primary w-full py-2"
              >
                {processing ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
