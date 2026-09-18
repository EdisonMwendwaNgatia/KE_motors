'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Vehicles', href: '/admin/vehicles', icon: '🚗' },
  { label: 'Brands', href: '/admin/brands', icon: '🏷️' },
  { label: 'Inquiries', href: '/admin/inquiries', icon: '💬' },
];

export function AdminLayoutClient({ children, userEmail, userRole }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      showToast('Logged out successfully', 'You have been signed out of the admin panel.', 'success');
      router.push('/admin/login');
      router.refresh();
    } catch (err: any) {
      showToast('Logout failed', err.message || 'An error occurred during logout.', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // If on login page or unauthorized page, render standalone layout without sidebars
  if (pathname === '/admin/login' || pathname === '/unauthorized') {
    return <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/KE_logoB.png"
              alt="KE Motors Logo"
              className="h-9 w-auto object-contain brightness-110 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                KE MOTORS
              </span>
              <span className="block text-[10px] font-semibold text-red-400 uppercase tracking-widest -mt-1">
                Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/40 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Settings */}
        <div className="p-4 border-t border-zinc-800 space-y-3 bg-zinc-900/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-red-400">
              {userEmail ? userEmail[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userEmail || 'Admin User'}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-red-950 text-red-400 border border-red-800/50 capitalize">
                {userRole || 'admin'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-red-950/40 hover:border-red-800/50 text-zinc-400 hover:text-red-300 text-xs font-semibold transition"
          >
            {isLoggingOut ? (
              <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <span>🚪</span>
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/KE_logoB.png"
            alt="KE Motors Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-extrabold text-base tracking-wider text-white">KE MOTORS</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 space-y-2 sticky top-[65px] z-40 shadow-2xl animate-in slide-in-from-top">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 font-semibold hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-zinc-900/60 border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-30">
          <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            KE Motors Management Console
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Connected</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
