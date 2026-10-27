import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { VehicleCard } from '@/components/public/VehicleCard';
import { Vehicle } from '@/types/database';
import { WHATSAPP_GROUP_URL } from '@/lib/formatters';
import { MobileSearchDisclosure } from '@/components/public/MobileSearchDisclosure';

export const metadata = {
  title: 'KE Motors — Find Your Next Car With Confidence',
  description:
    'Kenya’s premier marketplace for verified bank repossessions, direct owner deals, and selected dealer vehicles.',
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured published & verified vehicles
  const { data: featuredData } = await supabase
    .from('vehicles')
    .select(`
      *,
      brand:brands(*),
      model:models(*),
      vehicle_images(*),
      vehicle_features(*)
    `)
    .eq('status', 'PUBLISHED')
    .eq('verification_status', 'VERIFIED')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // If fewer than 6 featured, fetch general published & verified vehicles to fill
  let displayVehicles: Vehicle[] = (featuredData as Vehicle[]) || [];

  if (displayVehicles.length < 3) {
    const { data: generalData } = await supabase
      .from('vehicles')
      .select(`
        *,
        brand:brands(*),
        model:models(*),
        vehicle_images(*),
        vehicle_features(*)
      `)
      .eq('status', 'PUBLISHED')
      .eq('verification_status', 'VERIFIED')
      .order('created_at', { ascending: false })
      .limit(6);

    if (generalData) {
      // Merge unique vehicles
      const existingIds = new Set(displayVehicles.map((v) => v.id));
      for (const item of generalData as Vehicle[]) {
        if (!existingIds.has(item.id)) {
          displayVehicles.push(item);
        }
      }
    }
  }

  // Fetch brands with counts
  const { data: brandsData } = await supabase
    .from('brands')
    .select(`*, vehicles(id, status, verification_status)`);

  const brandsList = (brandsData || []).map((b: any) => {
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

  const whatsAppUrl = WHATSAPP_GROUP_URL;

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Text & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Find Your Next Car <br className="hidden sm:inline" />
                <span className="text-red-600 underline decoration-red-200 underline-offset-8">
                  With Confidence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
                Verified vehicles from trusted sources, including bank repossessions, direct owners and selected dealers.
              </p>

              {/* Primary Hero CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/marketplace"
                  className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg shadow-red-600/25 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                  <span>Browse Vehicles</span>
                  <span>→</span>
                </Link>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                  <span>WhatsApp Us</span>
                  <span>💬</span>
                </a>
              </div>

              {/* Hero Search Box */}
              <div className="pt-6">
                <MobileSearchDisclosure>
                <div className="mt-3 sm:mt-0 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl space-y-4">
                  <div className="hidden sm:block text-xs font-black text-slate-900 uppercase tracking-wider text-left border-b border-slate-100 pb-2">
                    Quick Vehicle Search
                  </div>
                  
                  <form action="/marketplace" method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 text-left">Make / Brand</label>
                      <select
                        name="brand"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600"
                      >
                        <option value="">All Brands</option>
                        {brandsList.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 text-left">Max Price (KSh)</label>
                      <select
                        name="maxPrice"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600"
                      >
                        <option value="">Any Price</option>
                        <option value="1000000">Under KSh 1.0 M</option>
                        <option value="2000000">Under KSh 2.0 M</option>
                        <option value="3000000">Under KSh 3.0 M</option>
                        <option value="5000000">Under KSh 5.0 M</option>
                        <option value="10000000">Under KSh 10.0 M</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 text-left">Listing Type</label>
                      <select
                        name="listingType"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600"
                      >
                        <option value="">All Source Types</option>
                        <option value="BANK_REPOSSESSED">Bank Repossession</option>
                        <option value="DIRECT_OWNER">Direct Owner</option>
                        <option value="DEALER">Dealer</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3 pt-1">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition"
                      >
                        Search Inventory
                      </button>
                    </div>
                  </form>
                </div>
                </MobileSearchDisclosure>
              </div>

            </div>

            {/* Hero Right Visual */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                  {/* High quality Hero Vehicle Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80"
                    alt="KE Motors Vehicle Showcase"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase">
                        ✓ Verified Inspection
                      </span>
                      <h4 className="text-xl font-black">Bank Repossessions & Premium Deals</h4>
                      <p className="text-xs text-slate-300 font-medium">Direct transparency from verified sources across Kenya</p>
                    </div>
                  </div>
                </div>

                {/* Floating Stat Card */}
                <div className="absolute -top-6 -left-4 sm:-left-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 font-black text-xl flex items-center justify-center">
                    100%
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 uppercase">Verified Records</div>
                    <div className="text-xs text-slate-500">Every car status confirmed</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
              Handpicked Deals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Featured Verified Vehicles
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 hover:underline"
          >
            <span>View All Marketplace Vehicles</span>
            <span>→</span>
          </Link>
        </div>

        {displayVehicles.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-2">
            <p className="text-base font-bold text-slate-700">No vehicles available at the moment.</p>
            <p className="text-xs">Check back soon as new verified cars are added daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVehicles.map((vehicle, idx) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} priority={idx === 0} />
            ))}
          </div>
        )}
      </section>

      {/* Why KE Motors — Marketplace Advantages */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Why KE Motors?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A Better Way To Buy Verified Cars
            </h2>
            <p className="text-sm text-slate-600">
              We connect vehicle buyers with verified bank repossessions, direct owner listings, and reputable dealers across Kenya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-4 md:p-8 shadow-xs hover:shadow-md transition">
              <div className="hidden md:flex w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-black text-2xl items-center justify-center mb-6">
                🏦
              </div>
              <h3 className="text-sm md:text-lg font-black text-slate-900 md:mb-2">Bank Repossessions</h3>
              <p className="hidden md:block text-xs text-slate-600 leading-relaxed">
                Direct access to bank-owned and repossessed vehicles listed at competitive, realistic market prices.
              </p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-4 md:p-8 shadow-xs hover:shadow-md transition">
              <div className="hidden md:flex w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-black text-2xl items-center justify-center mb-6">
                🔑
              </div>
              <h3 className="text-sm md:text-lg font-black text-slate-900 md:mb-2">Direct Owner Listings</h3>
              <p className="hidden md:block text-xs text-slate-600 leading-relaxed">
                Connect directly with vehicle owners for honest descriptions, genuine service histories, and negotiable terms.
              </p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-4 md:p-8 shadow-xs hover:shadow-md transition">
              <div className="hidden md:flex w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-2xl items-center justify-center mb-6">
                ✓
              </div>
              <h3 className="text-sm md:text-lg font-black text-slate-900 md:mb-2">Verified Status</h3>
              <p className="hidden md:block text-xs text-slate-600 leading-relaxed">
                Every vehicle listed publicly undergoes verification of basic details, ownership status, and physical location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      {brandsList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between sm:mb-8">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
                Top Makes
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Browse By Brand
              </h2>
            </div>
            <Link href="/brands" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:text-xs sm:hover:bg-transparent sm:hover:underline">
              <span>View All Brands</span><span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="overflow-hidden">
            <div className="flex w-max gap-3 animate-brand-marquee md:gap-4">
              {(brandsList.length > 0 ? [...brandsList, ...brandsList] : []).map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                href={`/brands/${brand.slug}`}
                className="flex w-36 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all hover:border-red-600 hover:shadow-lg group md:w-40 md:p-5"
              >
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm">
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-black text-slate-900 group-hover:text-red-600 transition">
                  {brand.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {brand.count} {brand.count === 1 ? 'car' : 'cars'}
                </span>
              </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sell Your Car CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold uppercase tracking-wider inline-block">
              Listing Options
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Looking to sell your vehicle with KE Motors?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              We review and verify listings from individual owners and verified dealers to connect you with serious buyers.
            </p>
          </div>

          <div className="z-10 w-full shrink-0 md:w-auto">
            <Link
              href="/sell"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-900 shadow-lg transition-all hover:bg-slate-100 md:inline-flex md:w-auto md:px-8 md:hover:scale-105"
            >
              <span>List Your Car For Sale</span><span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
