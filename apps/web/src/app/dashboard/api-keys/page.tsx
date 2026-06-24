'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.listKeys().then((k) => { setKeys(k); setLoading(false); }).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await api.createKey(newKeyName);
      setNewKey(res.key);
      setKeys([...keys, res.apiKey]);
      setShowCreate(false);
      setNewKeyName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this key? This cannot be undone.')) return;
    await api.revokeKey(id);
    setKeys(keys.filter((k) => k.id !== id));
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Create Key</button>
      </div>

      {newKey && (
        <div className="card border-2 border-yellow-400">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Copy your API key now — you won't see it again!</h3>
          <code className="block bg-gray-100 p-3 rounded text-sm font-mono break-all">{newKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(newKey); setNewKey(''); }} className="btn-secondary mt-3">Copy & Dismiss</button>
        </div>
      )}

      {showCreate && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <div className="flex gap-3">
            <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name (e.g. Production)" className="input flex-1" />
            <button onClick={handleCreate} disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {keys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No API keys yet. Create one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prefix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keys.map((key: any) => (
                  <tr key={key.id}>
                    <td className="px-4 py-2 text-sm">{key.name}</td>
                    <td className="px-4 py-2 text-sm font-mono">{key.keyPrefix}...</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${key.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(key.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <button onClick={() => handleRevoke(key.id)} className="text-red-600 hover:text-red-700">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
