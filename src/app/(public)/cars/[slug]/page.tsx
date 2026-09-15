import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { VehicleGallery } from '@/components/public/VehicleGallery';
import { InquiryForm } from '@/components/public/InquiryForm';
import { VehicleCard } from '@/components/public/VehicleCard';
import { formatKSH, getStoragePublicUrl } from '@/lib/formatters';
import { Vehicle } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_HOTLINE = '+254700000000';

async function getVehicleBySlugOrId(supabase: any, slug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let { data: vehicle } = await supabase
    .from('vehicles')
    .select(`
      *,
      brand:brands(*),
      model:models(*),
      vehicle_images(*),
      vehicle_features(*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (!vehicle && isUuid) {
    const { data: byId } = await supabase
      .from('vehicles')
      .select(`
        *,
        brand:brands(*),
        model:models(*),
        vehicle_images(*),
        vehicle_features(*)
      `)
      .eq('id', slug)
      .maybeSingle();
    vehicle = byId;
  }

  return vehicle;
}

// Dynamic Metadata Generation for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const vehicle = await getVehicleBySlugOrId(supabase, slug);

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found | KE Motors',
      description: 'The requested vehicle could not be found on KE Motors.',
    };
  }

  const brandName = vehicle.brand?.name || '';
  const modelName = vehicle.model?.name || '';
  const title = `${brandName} ${modelName} ${vehicle.year || ''} ${vehicle.transmission || ''} — ${formatKSH(vehicle.price)} | KE Motors`.trim();
  const description = vehicle.description
    ? vehicle.description.substring(0, 160)
    : `View detailed specs, features, and photos for ${title} on KE Motors.`;

  const primaryImg = vehicle.vehicle_images?.find((img: any) => img.is_primary) || vehicle.vehicle_images?.[0];
  const ogImageUrl = primaryImg ? getStoragePublicUrl(primaryImg.storage_path) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
  };
}

export default async function VehicleDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const vehicleData = await getVehicleBySlugOrId(supabase, slug);

  if (!vehicleData) {
    notFound();
  }

  const vehicle: Vehicle = vehicleData as Vehicle;

  // Only allow public viewing if PUBLISHED & VERIFIED
  if (vehicle.status !== 'PUBLISHED' || vehicle.verification_status !== 'VERIFIED') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto">
          ⚠️
        </div>
        <h2 className="text-2xl font-black text-slate-900">Vehicle Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          This vehicle listing is currently undergoing review or is no longer active in our public marketplace.
        </p>
        <Link
          href="/marketplace"
          className="inline-block px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md"
        >
          Browse Active Vehicles
        </Link>
      </div>
    );
  }

  // Related vehicles for recommendations
  const { data: relatedData } = await supabase
    .from('vehicles')
    .select(`*, brand:brands(*), model:models(*), vehicle_images(*), vehicle_features(*)`)
    .eq('status', 'PUBLISHED')
    .eq('verification_status', 'VERIFIED')
    .neq('id', vehicle.id)
    .limit(3);

  const brandName = vehicle.brand?.name || '';
  const modelName = vehicle.model?.name || '';
  const vehicleTitle = `${brandName} ${modelName} ${vehicle.variant || ''}`.trim();

  // Dynamic WhatsApp message text
  const whatsappMsgText = `Hello KE Motors, I am interested in the ${brandName} ${modelName} ${vehicle.year || ''} listed at ${formatKSH(vehicle.price)}. Please provide more information.`;
  const whatsAppUrl = `https://wa.me/${DEFAULT_HOTLINE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsgText)}`;

  // Filter non-empty specifications
  const specs = [
    { label: 'Year', value: vehicle.year ? String(vehicle.year) : null },
    { label: 'Engine Size', value: vehicle.engine_size },
    { label: 'Gearbox / Transmission', value: vehicle.transmission },
    { label: 'Fuel Type', value: vehicle.fuel_type },
    { label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null },
    { label: 'Body Type', value: vehicle.body_type },
    { label: 'Location', value: vehicle.location },
    {
      label: 'Listing Source',
      value:
        vehicle.listing_type === 'BANK_REPOSSESSED'
          ? 'Bank Repossession'
          : vehicle.listing_type === 'DIRECT_OWNER'
          ? 'Direct Owner Deal'
          : vehicle.listing_type === 'DEALER'
          ? 'Selected Dealer'
          : vehicle.listing_type,
    },
  ].filter((s) => Boolean(s.value && String(s.value).trim() !== ''));

  // Sort vehicle features
  const sortedFeatures = [...(vehicle.vehicle_features || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition">Home</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-slate-900 transition">Marketplace</Link>
        <span>/</span>
        {brandName && (
          <>
            <Link href={`/brands/${vehicle.brand?.slug || brandName.toLowerCase()}`} className="hover:text-slate-900 transition">
              {brandName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-bold truncate max-w-xs">{vehicleTitle}</span>
      </nav>

      {/* Main Grid: Left Gallery & Right Actions/Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <VehicleGallery images={vehicle.vehicle_images || []} vehicleTitle={vehicleTitle} />

          {/* Description Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Vehicle Description</h3>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {vehicle.description || 'No detailed description provided for this vehicle.'}
            </div>
          </div>
        </div>

        {/* Right Column: Key Details, Price, Actions & Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Main Price & Title Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-xs">
                <span>✓</span> VERIFIED
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wide">
                {vehicle.listing_type.replace('_', ' ')}
              </span>
            </div>

            {/* Title & Price */}
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
                {brandName} {vehicle.year || ''}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                {vehicleTitle}
              </h1>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatKSH(vehicle.price)}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                  Negotiable
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Prominent Contact Action Buttons */}
            <div className="space-y-3 pt-1">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm text-center shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp KE Motors</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${DEFAULT_HOTLINE}`}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs text-center border border-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <span>📞 Call Sales</span>
                </a>

                <a
                  href="#inquiry-form-section"
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>✉️ Send Inquiry</span>
                </a>
              </div>
            </div>

          </div>

          {/* Specifications Table (Hiding empty fields) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Specifications</h3>
            
            <div className="divide-y divide-slate-100 text-xs">
              {specs.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-500">{item.label}</span>
                  <span className="font-extrabold text-slate-900 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features Checklist (Loaded dynamically from vehicle_features) */}
          {sortedFeatures.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Vehicle Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
                {sortedFeatures.map((feat) => (
                  <div key={feat.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <span>{feat.feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Inquiry Form Section */}
      <div id="inquiry-form-section" className="pt-8">
        <InquiryForm vehicleId={vehicle.id} vehicleTitle={vehicleTitle} />
      </div>

      {/* Related Vehicles */}
      {relatedData && relatedData.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Similar Vehicles</h3>
            <Link href="/marketplace" className="text-xs font-bold text-red-600 hover:underline">
              View All Marketplace Vehicles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(relatedData as Vehicle[]).map((rel) => (
              <VehicleCard key={rel.id} vehicle={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
