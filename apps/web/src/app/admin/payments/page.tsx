'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminPayments().then((p) => { setPayments(p); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment History</h2>
      <div className="card">
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payments recorded yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm">{p.user?.email || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm font-medium">${p.amount}</td>
                  <td className="px-4 py-2 text-sm">{p.type}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'PAID' ? 'bg-green-100 text-green-800' : p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {p.status}
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
