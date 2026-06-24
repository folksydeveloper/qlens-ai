'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { apiFetch } from '@/lib/api';

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/plans', label: 'Plans', icon: '💎' },
  { href: '/admin/models', label: 'Models', icon: '🤖' },
  { href: '/admin/logs', label: 'Usage Logs', icon: '📋' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/abuse', label: 'Abuse Alerts', icon: '🚨' },
  { href: '/admin/audit', label: 'Audit Logs', icon: '📝' },
  { href: '/admin/model-health', label: 'Model Health', icon: '💓' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }

    apiFetch('/users/me').then((u: any) => {
      setAuth(u, token);
      if (u.role !== 'ADMIN') { router.replace('/dashboard'); return; }
      setLoading(false);
    }).catch(() => { localStorage.removeItem('token'); router.replace('/login'); });
  }, []);

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><div className="text-[var(--text-secondary)]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] min-h-screen p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === item.href ? 'bg-red-500/10 text-red-400 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="btn-secondary text-center mt-4">Back to Dashboard</Link>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
