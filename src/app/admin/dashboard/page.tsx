import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatKSH, formatDate, getStoragePublicUrl } from '@/lib/formatters';
import { Vehicle, Inquiry } from '@/types/database';
import { SafeImage } from '@/components/ui/SafeImage';

export const revalidate = 0; // Fresh server-side fetch

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch counts from database
  const [
    { count: totalVehicles },
    { count: publishedCount },
    { count: pendingVerificationCount },
    { count: soldCount },
    { count: reservedCount },
    { count: totalInquiries },
    { count: featuredCount },
  ] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('verification_status', 'PENDING'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'SOLD'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'RESERVED'),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('is_featured', true),
  ]);

  // 2. Fetch recent vehicles with brand, model & images
  const { data: recentVehiclesData } = await supabase
    .from('vehicles')
    .select(`
      *,
      brand:brands(name),
      model:models(name),
      vehicle_images(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentVehicles: Vehicle[] = (recentVehiclesData as any[]) || [];

  // 3. Fetch recent inquiries with vehicle info
  const { data: recentInquiriesData } = await supabase
    .from('inquiries')
    .select(`
      *,
      vehicle:vehicles(variant, brand:brands(name), model:models(name))
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentInquiries: Inquiry[] = (recentInquiriesData as any[]) || [];

  const statCards = [
    { label: 'Total Vehicles', value: totalVehicles || 0, icon: '🚘', color: 'border-zinc-800 bg-zinc-900/90' },
    { label: 'Published', value: publishedCount || 0, icon: '🟢', color: 'border-emerald-800/40 bg-emerald-950/20' },
    { label: 'Pending Verification', value: pendingVerificationCount || 0, icon: '⏳', color: 'border-amber-800/40 bg-amber-950/20' },
    { label: 'Sold', value: soldCount || 0, icon: '🏷️', color: 'border-blue-800/40 bg-blue-950/20' },
    { label: 'Reserved', value: reservedCount || 0, icon: '🔒', color: 'border-purple-800/40 bg-purple-950/20' },
    { label: 'Total Inquiries', value: totalInquiries || 0, icon: '💬', color: 'border-sky-800/40 bg-sky-950/20' },
    { label: 'Featured Vehicles', value: featuredCount || 0, icon: '⭐', color: 'border-yellow-800/40 bg-yellow-950/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Welcome Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/30 p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Dealership Overview
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time telemetry and management controls for KE Motors fleet.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/vehicles/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Vehicle</span>
          </Link>
          <Link
            href="/admin/vehicles"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
          >
            Manage Vehicles
          </Link>
          <Link
            href="/admin/inquiries"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
          >
            View Inquiries
          </Link>
          <Link
            href="/admin/brands"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
          >
            Manage Brands
          </Link>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`p-5 rounded-2xl border ${card.color} shadow-xl backdrop-blur-md flex flex-col justify-between space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {card.label}
              </span>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Vehicles & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Vehicles */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🚗</span> Recent Vehicle Listings
              </h2>
              <p className="text-xs text-zinc-400">Latest additions to the dealership inventory</p>
            </div>
            <Link
              href="/admin/vehicles"
              className="text-xs font-bold text-red-400 hover:text-red-300 transition"
            >
              View All →
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {recentVehicles.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No vehicles found in database.
              </div>
            ) : (
              recentVehicles.map((vehicle) => {
                const primaryImage =
                  vehicle.vehicle_images?.find((img) => img.is_primary) ||
                  vehicle.vehicle_images?.[0];
                const imageSrc = getStoragePublicUrl(primaryImage?.storage_path || '');
                const title = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.variant || ''}`.trim();

                return (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition"
                  >
                    <div className="w-16 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 relative">
                      <SafeImage
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{title || 'Untitled Vehicle'}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {vehicle.year} • {formatKSH(vehicle.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        vehicle.status === 'PUBLISHED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : vehicle.status === 'SOLD'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {vehicle.status}
                      </span>
                      <Link
                        href={`/admin/vehicles/${vehicle.id}`}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-white underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>💬</span> Recent Customer Inquiries
              </h2>
              <p className="text-xs text-zinc-400">Buyer requests and contact submissions</p>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-bold text-red-400 hover:text-red-300 transition"
            >
              View All →
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {recentInquiries.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No customer inquiries yet.
              </div>
            ) : (
              recentInquiries.map((inquiry) => {
                const vehicleTitle = inquiry.vehicle
                  ? `${(inquiry.vehicle as any)?.brand?.name || ''} ${(inquiry.vehicle as any)?.model?.name || ''} ${(inquiry.vehicle as any)?.variant || ''}`.trim()
                  : 'General Inquiry';

                return (
                  <div
                    key={inquiry.id}
                    className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{inquiry.name}</h4>
                      <span className="text-[10px] text-zinc-500">{formatDate(inquiry.created_at)}</span>
                    </div>

                    <p className="text-xs text-zinc-300 truncate">
                      <span className="text-zinc-500">Re:</span> {vehicleTitle}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-mono">{inquiry.phone}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        inquiry.status === 'NEW'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
