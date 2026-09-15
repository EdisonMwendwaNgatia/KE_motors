'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InquiryFormProps {
  vehicleId?: string | null;
  vehicleTitle?: string;
  className?: string;
}

export function InquiryForm({ vehicleId, vehicleTitle, className = '' }: InquiryFormProps) {
  const supabase = createClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    vehicleTitle
      ? `Hello KE Motors, I am interested in the ${vehicleTitle}. Please provide more information.`
      : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Please include a message with your inquiry.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        vehicle_id: vehicleId || null,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        message: message.trim(),
        status: 'NEW',
      };

      const { error } = await supabase.from('inquiries').insert([payload]);

      if (error) {
        throw error;
      }

      setSuccessMessage('Thank you! Your inquiry has been submitted. Our team will contact you shortly.');
      // Clear form
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      setErrorMessage(
        err.message || 'Unable to submit inquiry at this moment. Please call or WhatsApp us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {vehicleTitle ? 'Inquire About This Vehicle' : 'Send Us an Inquiry'}
        </h3>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {vehicleTitle
            ? `Fill out the form below to get in touch with our team regarding ${vehicleTitle}.`
            : 'Have questions or looking for a specific car? Leave a message and we will call you back.'}
        </p>
      </div>

      {successMessage ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto font-black">
            ✓
          </div>
          <h4 className="text-base font-bold text-emerald-900">Inquiry Sent Successfully!</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            type="button"
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            Send Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl">
              ⚠️ {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Kamau"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712 345 678"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we assist you with this vehicle?"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition resize-y"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Inquiry...</span>
              </>
            ) : (
              <span>Submit Inquiry</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
