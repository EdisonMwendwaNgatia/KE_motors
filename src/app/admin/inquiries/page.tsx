'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';
import { Inquiry, InquiryStatus } from '@/types/database';
import { formatDate, formatWhatsAppUrl } from '@/lib/formatters';
import { TableSkeleton } from '@/components/ui/Skeletons';

export default function InquiriesPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadInquiries = useCallback(async () => {
    try {
      setIsLoading(true);

      let query = supabase.from('inquiries').select(`
        *,
        vehicle:vehicles(
          id,
          variant,
          year,
          brand:brands(name),
          model:models(name)
        )
      `).order('created_at', { ascending: false });

      if (selectedStatusFilter) {
        query = query.eq('status', selectedStatusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results: Inquiry[] = (data as any[]) || [];

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        results = results.filter((inq) => {
          const nameMatch = (inq.name || '').toLowerCase().includes(term);
          const phoneMatch = (inq.phone || '').toLowerCase().includes(term);
          const emailMatch = (inq.email || '').toLowerCase().includes(term);
          const messageMatch = (inq.message || '').toLowerCase().includes(term);
          return nameMatch || phoneMatch || emailMatch || messageMatch;
        });
      }

      setInquiries(results);
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      showToast('Error Loading Inquiries', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedStatusFilter, searchTerm, showToast]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleUpdateStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', inquiryId);

      if (error) throw error;
      showToast('Inquiry Updated', `Status changed to ${newStatus}`, 'success');
      loadInquiries();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Customer Inquiries</h1>
          <p className="text-xs text-zinc-400">
            Track buyer inquiries, test drive requests, and negotiate vehicle sales.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer name, phone, email, message..."
            className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500 max-w-sm w-full"
          />

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">All Inquiry Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="VIEWING">VIEWING</option>
            <option value="NEGOTIATING">NEGOTIATING</option>
            <option value="CLOSED">CLOSED</option>
            <option value="SPAM">SPAM</option>
          </select>
        </div>

        <span className="text-xs text-zinc-400 font-bold">
          Showing {inquiries.length} inquiry/inquiries
        </span>
      </div>

      {/* Inquiries Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : inquiries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-2 shadow-xl">
          <h3 className="text-lg font-bold text-white">No customer inquiries found</h3>
          <p className="text-xs text-zinc-400">
            Inquiries submitted by buyers will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Vehicle Interested</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {inquiries.map((inq) => {
                  const vehicleTitle = inq.vehicle
                    ? `${(inq.vehicle as any)?.brand?.name || ''} ${(inq.vehicle as any)?.model?.name || ''} ${(inq.vehicle as any)?.variant || ''}`.trim()
                    : null;
                  const whatsAppUrl = formatWhatsAppUrl(inq.phone, vehicleTitle || undefined);

                  return (
                    <tr key={inq.id} className="hover:bg-zinc-800/40 transition">
                      {/* Customer Name */}
                      <td className="p-4">
                        <span className="font-bold text-white block">{inq.name}</span>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-0.5">
                        <a
                          href={`tel:${inq.phone}`}
                          className="font-mono text-zinc-300 hover:text-white hover:underline block"
                        >
                          {inq.phone}
                        </a>
                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-zinc-500 hover:text-zinc-300 hover:underline block text-[11px]"
                          >
                            {inq.email}
                          </a>
                        )}
                      </td>

                      {/* Associated Vehicle */}
                      <td className="p-4">
                        {inq.vehicle ? (
                          <Link
                            href={`/admin/vehicles/${inq.vehicle_id}`}
                            className="font-bold text-zinc-300 hover:text-white hover:underline"
                          >
                            {vehicleTitle}
                          </Link>
                        ) : (
                          <span className="text-zinc-500 italic">General Inquiry</span>
                        )}
                      </td>

                      {/* Message */}
                      <td className="p-4 max-w-xs">
                        <p className="text-zinc-300 line-clamp-2 text-xs leading-relaxed">
                          {inq.message || 'No message attached.'}
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="p-4">
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value as InquiryStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            inq.status === 'NEW'
                              ? 'bg-amber-950 text-amber-400 border-amber-800/50'
                              : inq.status === 'CONTACTED'
                              ? 'bg-blue-950 text-blue-400 border-blue-800/50'
                              : inq.status === 'VIEWING'
                              ? 'bg-purple-950 text-purple-400 border-purple-800/50'
                              : inq.status === 'NEGOTIATING'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                              : inq.status === 'CLOSED'
                              ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              : 'bg-red-950 text-red-400 border-red-800/50'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="VIEWING">VIEWING</option>
                          <option value="NEGOTIATING">NEGOTIATING</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="SPAM">SPAM</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-zinc-400 text-[11px]">
                        {formatDate(inq.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-300 font-bold text-xs transition"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
