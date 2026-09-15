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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vehicle Brands</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Browse verified cars by manufacturer across Kenya.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-xl hover:border-red-600 transition-all group flex flex-col items-center justify-between text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 p-2 flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-100">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xl font-black text-slate-700">
                  {brand.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition">
                {brand.name}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {brand.count} verified {brand.count === 1 ? 'vehicle' : 'vehicles'}
              </p>
            </div>

            <span className="text-xs font-bold text-red-600 group-hover:underline inline-flex items-center gap-1">
              <span>View Inventory</span>
              <span>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
