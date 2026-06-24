'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: '🔑' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💰' },
  { href: '/dashboard/usage', label: 'Usage', icon: '📈' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

const adminItems = [
  { href: '/admin', label: 'Overview', icon: '🏠' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/abuse', label: 'Abuse Alerts', icon: '🚨' },
  { href: '/admin/models', label: 'Models', icon: '🤖' },
  { href: '/admin/plans', label: 'Plans', icon: '📋' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('qlens-access-token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Fetch current user
    api.me()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('qlens-access-token');
        router.push('/login');
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const items = isAdmin ? adminItems : navItems;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="text-xl font-bold text-brand-600">
              {isAdmin ? 'QLens Admin' : 'QLens AI'}
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">✕</button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 truncate">{user?.email}</div>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 ml-2">
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-500">
            ☰
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {items.find((i) => i.href === pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
