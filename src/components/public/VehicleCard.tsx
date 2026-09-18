'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types/database';
import { formatKSH, getStoragePublicUrl } from '@/lib/formatters';
import { SafeImage } from '@/components/ui/SafeImage';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
}

export function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(vehicle.id));
  }, [vehicle.id]);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = toggleFavorite(vehicle.id);
    setFav(nextState);
  };

  // Extract primary image
  const primaryImgObj =
    vehicle.vehicle_images?.find((img) => img.is_primary) ||
    vehicle.vehicle_images?.sort((a, b) => a.display_order - b.display_order)[0];

  const imageUrl = primaryImgObj
    ? getStoragePublicUrl(primaryImgObj.storage_path)
    : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80';

  const brandName = vehicle.brand?.name || '';
  const modelName = vehicle.model?.name || '';
  const title = `${brandName} ${modelName} ${vehicle.variant || ''}`.trim();
  const carSlug = vehicle.slug || vehicle.id;

  // Format listing type badge
  const listingTypeLabel =
    vehicle.listing_type === 'BANK_REPOSSESSED'
      ? 'Bank Repossessed'
      : vehicle.listing_type === 'DIRECT_OWNER'
      ? 'Direct Owner'
      : vehicle.listing_type === 'DEALER'
      ? 'Dealer'
      : vehicle.listing_type;

  const listingBadgeColor =
    vehicle.listing_type === 'BANK_REPOSSESSED'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : vehicle.listing_type === 'DIRECT_OWNER'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : 'bg-purple-100 text-purple-800 border-purple-300';

  // Build specs line: e.g. "2016 • Automatic • 2000cc"
  const specsParts = [
    vehicle.year ? `${vehicle.year}` : null,
    vehicle.transmission || null,
    vehicle.engine_size || null,
    vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null,
  ].filter(Boolean);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-row sm:flex-col overflow-hidden">
      
      {/* Vehicle Image Container (Horizontal on mobile, vertical card on desktop) */}
      <div className="relative w-2/5 sm:w-full min-w-[125px] max-w-[160px] sm:max-w-none aspect-square sm:aspect-16/10 bg-slate-100 overflow-hidden shrink-0">
        <Link href={`/cars/${carSlug}`} className="block w-full h-full">
          <SafeImage
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>

        {/* Verification & Listing Type Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 items-center z-10 pointer-events-none">
          {vehicle.verification_status === 'VERIFIED' && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-600 text-white text-[9px] sm:text-[11px] font-extrabold shadow-sm flex items-center gap-0.5 uppercase tracking-wide">
              <span>✓</span> <span className="hidden sm:inline">VERIFIED</span>
            </span>
          )}
          {listingTypeLabel && (
            <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-extrabold border shadow-xs ${listingBadgeColor}`}>
              <span className="sm:hidden">
                {vehicle.listing_type === 'BANK_REPOSSESSED' ? 'Repo' : vehicle.listing_type === 'DIRECT_OWNER' ? 'Owner' : 'Dealer'}
              </span>
              <span className="hidden sm:inline">{listingTypeLabel}</span>
            </span>
          )}
        </div>

        {/* Favorite Toggle Button */}
        <button
          onClick={handleToggleFav}
          type="button"
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            fav
              ? 'bg-white text-red-600 scale-110'
              : 'bg-white/80 backdrop-blur-md text-slate-500 hover:text-red-500 hover:bg-white'
          }`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className="text-xs sm:text-lg leading-none">{fav ? '♥' : '♡'}</span>
        </button>
      </div>

      {/* Vehicle Info Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4 min-w-0">
        <div>
          {/* Brand & Model */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider block truncate">
                {brandName}
              </span>
              <Link href={`/cars/${carSlug}`}>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                  {title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Quick Specs summary */}
          <p className="mt-1 text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">
            {specsParts.join(' • ')}
          </p>

          {/* Location if present */}
          {vehicle.location && (
            <div className="mt-1 sm:mt-2.5 flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 font-medium truncate">
              <span>📍</span>
              <span className="truncate">{vehicle.location}</span>
            </div>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-xs font-bold text-slate-400 block uppercase">Price</span>
            <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight block truncate">
              {formatKSH(vehicle.price)}
            </span>
          </div>

          <Link
            href={`/cars/${carSlug}`}
            className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-all active:scale-95 shrink-0"
          >
            <span>View</span>
            <span className="hidden sm:inline">Vehicle</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
