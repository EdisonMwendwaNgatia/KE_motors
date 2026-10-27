'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Vehicles',
    href: '/admin/vehicles',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Brands',
    href: '/admin/brands',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    showBadge: true,
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

export function AdminLayoutClient({ children, userEmail, userRole }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);

  const fetchNewInquiriesCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'NEW');

      if (!error && count !== null) {
        setNewInquiriesCount(count);
      }
    } catch (err) {
      console.error('Error fetching new inquiries count:', err);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNewInquiriesCount();

    const channel = supabase
      .channel('inquiries-sidebar-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          fetchNewInquiriesCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNewInquiriesCount, supabase]);

  useEffect(() => {
    fetchNewInquiriesCount();
  }, [pathname, fetchNewInquiriesCount]);

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
        {/* Brand Header without logo image */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="group">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-white group-hover:text-zinc-200 transition">
                KE MOTORS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-widest">
                ADMIN
              </span>
            </div>
            <span className="block text-[11px] font-medium text-zinc-500 tracking-wide mt-0.5">
              Management Portal
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold border-l-2 border-rose-500 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-rose-400' : 'text-zinc-400'}>{item.svg}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.showBadge && newInquiriesCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white shadow-sm shadow-rose-900/50 animate-pulse">
                    {newInquiriesCount > 99 ? '99+' : newInquiriesCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-zinc-800/80 mt-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Quick Shortcuts
            </div>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View Public Site</span>
              </div>
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">↗</span>
            </Link>
          </div>
        </nav>

        {/* User Info & Settings */}
        <div className="p-4 border-t border-zinc-800 space-y-3 bg-zinc-950/40">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200">
              {userEmail ? userEmail[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userEmail || 'Admin User'}</p>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 uppercase">
                {userRole || 'admin'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition"
          >
            {isLoggingOut ? (
              <span className="w-3.5 h-3.5 border-2 border-zinc-400/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-black text-lg tracking-wider text-white">KE MOTORS</span>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
            ADMIN
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold"
          >
            Public Site ↗
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 space-y-2 sticky top-[61px] z-40 shadow-2xl animate-in slide-in-from-top">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold border-l-2 border-rose-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span>{item.svg}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.showBadge && newInquiriesCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white shadow-sm shadow-rose-900/50">
                    {newInquiriesCount > 99 ? '99+' : newInquiriesCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-zinc-300 font-semibold hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-zinc-900/80 border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              KE Motors Management Console
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition flex items-center gap-1.5"
            >
              <span>View Public Site</span>
              <span className="text-[10px] text-zinc-400">↗</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
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
