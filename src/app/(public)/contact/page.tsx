import React from 'react';
import { InquiryForm } from '@/components/public/InquiryForm';
import { DEFAULT_PHONE_NUMBER, WHATSAPP_GROUP_URL } from '@/lib/formatters';

export const metadata = {
  title: 'Contact Us | KE Motors Vehicle Marketplace',
  description: 'Get in touch with KE Motors via phone, WhatsApp, email, or visit us along Kiambu Road, Nairobi.',
};

const PHONE_NUMBER = DEFAULT_PHONE_NUMBER;
const WHATSAPP_URL = WHATSAPP_GROUP_URL;
const EMAIL_ADDRESS = 'info@kemotors.co.ke';
const LOCATION = 'Kiambu Road / Nairobi, Kenya';

export default function ContactPage() {
  const whatsAppUrl = WHATSAPP_URL;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Get In Touch With <span className="text-red-600">KE Motors</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Have a question about a vehicle listing, bank repossession, or listing your car? Our team is available to assist you.
        </p>
      </div>

      {/* Main Grid: Contact Info Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-2xl flex items-center justify-center shrink-0">
              💬
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Instant WhatsApp Support</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick responses to vehicle inquiries</p>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-extrabold text-emerald-700 hover:underline"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 font-black text-2xl flex items-center justify-center shrink-0">
              📞
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Phone Hotline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Speak directly to our sales representatives</p>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="mt-2 inline-block text-xs font-mono font-extrabold text-slate-900 hover:text-red-600 hover:underline"
              >
                {PHONE_NUMBER}
              </a>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 font-black text-2xl flex items-center justify-center shrink-0">
              ✉️
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Email Address</h3>
              <p className="text-xs text-slate-500 mt-0.5">Official inquiries and partnership requests</p>
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="mt-2 inline-block text-xs font-extrabold text-slate-900 hover:text-red-600 hover:underline"
              >
                {EMAIL_ADDRESS}
              </a>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 font-black text-2xl flex items-center justify-center shrink-0">
              📍
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Physical Location</h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{LOCATION}</p>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <InquiryForm className="shadow-lg" />
        </div>

      </div>

    </div>
  );
}
