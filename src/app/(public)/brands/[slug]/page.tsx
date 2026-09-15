import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { VehicleCard } from '@/components/public/VehicleCard';
import { Vehicle } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from('brands')
    .select('name')
    .eq('slug', slug)
    .maybeSingle();

  if (!brand) {
    return {
      title: 'Brand Not Found | KE Motors',
    };
  }

  return {
    title: `${brand.name} Cars For Sale | KE Motors`,
    description: `Browse verified ${brand.name} vehicles for sale in Kenya, including bank repossessions and direct owner deals.`,
  };
}

export default async function BrandSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch brand details
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!brand) {
    notFound();
  }

  // Fetch verified & published vehicles for this brand
  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select(`
      *,
      brand:brands(*),
      model:models(*),
      vehicle_images(*),
      vehicle_features(*)
    `)
    .eq('brand_id', brand.id)
    .eq('status', 'PUBLISHED')
    .eq('verification_status', 'VERIFIED')
    .order('created_at', { ascending: false });

  const vehicles: Vehicle[] = (vehiclesData as Vehicle[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Brand Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          {brand.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="w-16 h-16 object-contain bg-white rounded-2xl p-2 border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shrink-0">
              {brand.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
              Verified Brand Inventory
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {brand.name} Cars For Sale
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Showing {vehicles.length} verified published {vehicles.length === 1 ? 'car' : 'cars'}
            </p>
          </div>
        </div>

        <Link
          href="/marketplace"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
        >
          View All Makes
        </Link>
      </div>

      {/* Vehicle Grid / Empty State */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto">
            🚗
          </div>
          <h3 className="text-xl font-black text-slate-900">
            No active {brand.name} vehicles listed right now
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            New vehicles are added frequently. Explore other brands or view all marketplace listings.
          </p>
          <div className="pt-2">
            <Link
              href="/marketplace"
              className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md inline-block"
            >
              Browse All Marketplace Vehicles
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle, idx) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} priority={idx < 3} />
          ))}
        </div>
      )}

    </div>
  );
}
