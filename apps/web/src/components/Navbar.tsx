'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-brand-600">
              QLens AI
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/#docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                <button onClick={() => logout()} className="btn-primary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
