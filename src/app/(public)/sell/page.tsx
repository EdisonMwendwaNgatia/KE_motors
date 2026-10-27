import React from 'react';
import { InquiryForm } from '@/components/public/InquiryForm';

export const metadata = {
  title: 'Sell Your Car | KE Motors Vehicle Marketplace',
  description: 'List your vehicle with KE Motors. We review and verify listings from direct owners and verified dealers.',
};

export default function SellPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          List Your Vehicle With <span className="text-red-600">KE Motors</span>
        </h1>
        <p className="text-base text-slate-600 font-medium leading-relaxed">
          Whether you are a direct vehicle owner or an authorized dealer, KE Motors offers a verified marketplace to reach serious buyers across Kenya.
        </p>
      </div>

      {/* Process Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 border border-slate-200 font-black text-xl flex items-center justify-center shadow-xs">
            1
          </div>
          <h3 className="text-lg font-black text-slate-900">Submit Vehicle Details</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Fill out the inquiry form below with your car make, model, year, expected price, and contact information.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 border border-slate-200 font-black text-xl flex items-center justify-center shadow-xs">
            2
          </div>
          <h3 className="text-lg font-black text-slate-900">Verification Review</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Our team contacts you to verify vehicle condition, ownership documents, physical location, and photography.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 border border-slate-200 font-black text-xl flex items-center justify-center shadow-xs">
            3
          </div>
          <h3 className="text-lg font-black text-slate-900">Public Marketplace Listing</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Once approved, your vehicle receives the official <span className="text-emerald-600 font-bold">VERIFIED</span> badge and appears live in our public catalog.
          </p>
        </div>
      </div>

      {/* Seller Inquiry Form */}
      <div className="max-w-3xl mx-auto">
        <InquiryForm className="shadow-lg" />
      </div>

    </div>
  );
}
