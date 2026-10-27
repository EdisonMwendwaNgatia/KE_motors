import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About KE Motors — Verified Automotive Marketplace',
  description: 'Learn about KE Motors, Kenya’s transparent vehicle marketplace connecting buyers with verified bank repossessions, direct owner cars, and selected dealers.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Transparency & Quality in <span className="text-red-600">Vehicle Buying</span>
        </h1>
        <p className="text-base text-slate-600 font-medium leading-relaxed">
          KE Motors is a Kenyan vehicle marketplace built around clarity, accurate information, and verified inventory. We bring together bank repossessions, direct owner listings, and selected dealer inventory into one seamless platform.
        </p>
      </div>

      {/* Core Marketplace Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="text-2xl mb-2">🏦</div>
          <h3 className="text-xl font-black text-slate-900">Bank Repossession Sourcing</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            We partner with financial institutions and asset managers to list repossessed vehicles directly. Buyers get access to realistic market pricing without hidden markups.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="text-2xl mb-2">🤝</div>
          <h3 className="text-xl font-black text-slate-900">Direct Owner Listings</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            We provide individual car owners a trustworthy platform to list their vehicles. Buyers can communicate directly with sellers to understand real vehicle history and maintenance records.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="text-xl font-black text-slate-900">Strict Verification Standards</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Before any vehicle displays the <span className="text-emerald-600 font-bold">VERIFIED</span> badge on KE Motors, our team confirms basic specifications, photographs, physical location, and seller details.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-xl font-black text-slate-900">Direct Communication</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            We do not lock buyers into complex online checkouts. Vehicles are high-value purchases that require inspection and conversation. We enable immediate contact via WhatsApp, phone, or formal inquiry forms.
          </p>
        </div>
      </div>

      {/* Commitment Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Our Commitment to Buyers and Sellers</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl font-medium">
          Our goal is simple: empower car buyers across Kenya to make confident, well-informed decisions based on verified facts, clear pricing, and reliable communication.
        </p>
        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            href="/marketplace"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
          >
            Explore Vehicles Catalog
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
          >
            Contact KE Motors
          </Link>
        </div>
      </div>

    </div>
  );
}
