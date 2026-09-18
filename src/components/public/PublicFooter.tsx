import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/KE_logoB.png"
                alt="KE Motors"
                className="h-14 sm:h-16 w-auto object-contain brightness-110"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Verified vehicles.<br />
              Better deals.<br />
              Confident decisions.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Bank Repossessions & Direct Owner Vehicles
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/marketplace" className="hover:text-white transition">
                  Vehicles Catalog
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-white transition">
                  Brands Directory
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About KE Motors
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition">
                  Saved Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Vehicle Brands */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Popular Brands
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="/brands/subaru" className="hover:text-white transition">Subaru</Link>
              <Link href="/brands/audi" className="hover:text-white transition">Audi</Link>
              <Link href="/brands/honda" className="hover:text-white transition">Honda</Link>
              <Link href="/brands/toyota" className="hover:text-white transition">Toyota</Link>
              <Link href="/brands/mazda" className="hover:text-white transition">Mazda</Link>
              <Link href="/brands/bmw" className="hover:text-white transition">BMW</Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-base">📍</span>
                <span>Kiambu Road / Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base">📞</span>
                <a href="tel:+254700000000" className="hover:text-white transition font-mono">
                  +254 700 000000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base">💬</span>
                <a
                  href="https://wa.me/254700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition font-mono"
                >
                  WhatsApp Support
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base">✉️</span>
                <a href="mailto:info@kemotors.co.ke" className="hover:text-white transition">
                  info@kemotors.co.ke
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>© 2026 KE Motors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
