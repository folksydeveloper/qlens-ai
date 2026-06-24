'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.me().then((u) => {
      setProfile(u);
      setFirstName(u.firstName || '');
      setLastName(u.lastName || '');
      setTimezone(u.timezone || 'Asia/Jakarta');
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.updateProfile({ firstName, lastName, timezone });
      setMsg('Profile updated');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setMsg('');
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setMsg('Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    if (!confirm('FINAL WARNING: This action cannot be undone.')) return;
    try {
      await api.deleteAccount();
      localStorage.clear();
      window.location.href = '/';
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {msg && <div className="p-3 bg-green-50 text-green-700 rounded-lg">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      {/* Profile */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="input bg-gray-50" value={profile?.email} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Asia/Jakarta">Jakarta (UTC+7)</option>
              <option value="Asia/Singapore">Singapore (UTC+8)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York (UTC-5)</option>
            </select>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <button onClick={handleChangePassword} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Change Password'}</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h3 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back.</p>
        <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete Account</button>
      </div>
    </div>
  );
}
