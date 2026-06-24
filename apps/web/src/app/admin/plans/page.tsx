'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminPlans().then((p) => { setPlans(p); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plan Management</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <div key={plan.id} className="card">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-3xl font-bold text-brand-600 my-3">${plan.price}<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>📊 {plan.dailyTokens?.toLocaleString() || '∞'} tokens/day</li>
              <li>🔑 {plan.maxApiKeys} API keys</li>
              <li>🤖 Models: {plan.allowedModels?.join(', ') || 'All'}</li>
              <li>📈 {plan.priority ? 'Priority' : 'Standard'} support</li>
            </ul>
            <button className="btn-secondary w-full">Edit Plan</button>
          </div>
        ))}
      </div>
    </div>
  );
}
