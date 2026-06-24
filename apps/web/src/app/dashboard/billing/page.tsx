'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSubscription(), api.listPlans(), api.getInvoices()])
      .then(([sub, p, inv]) => {
        setSubscription(sub);
        setPlans(p);
        setInvoices(inv);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>

      {/* Current Plan */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        {subscription ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-brand-600">{subscription.plan?.name || 'Free'}</p>
              <p className="text-sm text-gray-500">
                {subscription.status} — {subscription.plan?.price ? `$${subscription.plan.price}/mo` : 'Free tier'}
              </p>
            </div>
            <button className="btn-primary">Upgrade Plan</button>
          </div>
        ) : (
          <p className="text-gray-500">No active subscription.</p>
        )}
      </div>

      {/* Available Plans */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-2xl font-bold text-brand-600 my-2">${plan.price}<span className="text-sm text-gray-500 font-normal">/mo</span></p>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <ul className="text-sm space-y-1 mb-4">
                <li>✓ {plan.dailyTokens?.toLocaleString() || '∞'} tokens/day</li>
                <li>✓ {plan.maxApiKeys} API keys</li>
              </ul>
              <button className="btn-secondary w-full">Select</button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
        {invoices.length === 0 ? (
          <p className="text-gray-500">No invoices yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="px-4 py-2 text-sm">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm">${inv.amount}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
