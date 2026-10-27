import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Vehicle Brands Directory | KE Motors',
  description: 'Explore verified vehicles by brand — Toyota, Subaru, Mazda, Honda, BMW, Audi and more.',
};

export default async function BrandsPage() {
  const supabase = await createClient();

  const { data: brandsData } = await supabase
    .from('brands')
    .select(`
      *,
      vehicles(id, status, verification_status)
    `)
    .order('name');

  const brands = (brandsData || []).map((b: any) => {
    const activeCount = (b.vehicles || []).filter(
      (v: any) => v.status === 'PUBLISHED' && v.verification_status === 'VERIFIED'
    ).length;
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logo_url,
      count: activeCount,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="border-b border-slate-200 pb-5 sm:pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vehicle Brands</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Browse verified cars by manufacturer across Kenya.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="min-h-40 sm:min-h-56 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3 sm:p-6 shadow-xs hover:shadow-xl hover:border-red-600 transition-all group flex flex-col items-center justify-center sm:justify-between text-center gap-2 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-50 p-1.5 sm:p-2 flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-100">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-base sm:text-xl font-black text-slate-700">
                  {brand.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm sm:text-xl font-black text-slate-900 group-hover:text-red-600 transition">
                {brand.name}
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1">
                {brand.count} <span className="hidden sm:inline">verified </span>{brand.count === 1 ? 'vehicle' : 'vehicles'}
              </p>
            </div>

            <span className="text-[10px] sm:text-xs font-bold text-red-600 group-hover:underline inline-flex items-center gap-1">
              <span className="sm:hidden">View cars</span><span className="hidden sm:inline">View Inventory</span>
              <span>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
