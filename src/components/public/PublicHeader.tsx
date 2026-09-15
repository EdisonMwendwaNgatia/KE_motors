'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFavorites, FAVORITES_EVENT } from '@/lib/favorites';
import { formatWhatsAppUrl } from '@/lib/formatters';

const DEFAULT_PHONE = '+254700000000'; // Default KE Motors hotline / WhatsApp

export function PublicHeader() {
  const pathname = usePathname();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initial load of favorites count
    setFavoritesCount(getFavorites().length);

    const handleFavChange = () => {
      setFavoritesCount(getFavorites().length);
    };

    window.addEventListener(FAVORITES_EVENT, handleFavChange);
    window.addEventListener('storage', handleFavChange);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleFavChange);
      window.removeEventListener('storage', handleFavChange);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Vehicles' },
    { href: '/brands', label: 'Brands' },
    { href: '/sell', label: 'Sell Your Car' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const whatsAppUrl = formatWhatsAppUrl(DEFAULT_PHONE, undefined);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
              KE
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                KE MOTORS
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Verified Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-red-600 bg-red-50 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-4">
            {/* Favorites Icon Link */}
            <Link
              href="/favorites"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-red-600 hover:bg-slate-100 transition"
              title="View saved vehicles"
            >
              <span className="text-base text-red-500">
                {favoritesCount > 0 ? '♥' : '♡'}
              </span>
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="ml-0.5 px-2 py-0.5 text-xs font-extrabold bg-red-600 text-white rounded-full">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* WhatsApp CTA Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/favorites"
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 relative"
            >
              <span className="text-xl text-red-500">
                {favoritesCount > 0 ? '♥' : '♡'}
              </span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-black bg-red-600 text-white rounded-full">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="p-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition ${
                    isActive
                      ? 'text-red-600 bg-red-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <span>💬 WhatsApp KE Motors</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
