'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getFavorites, FAVORITES_EVENT } from '@/lib/favorites';
import { VehicleCard } from '@/components/public/VehicleCard';
import { Vehicle } from '@/types/database';
import { CardSkeleton } from '@/components/ui/Skeletons';

export default function FavoritesPage() {
  const supabase = createClient();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedVehicles = async () => {
    try {
      setIsLoading(true);
      const favs = getFavorites();
      setFavoriteIds(favs);

      if (favs.length === 0) {
        setVehicles([]);
        setIsLoading(false);
        return;
      }

      // Fetch matching vehicles from Supabase
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          brand:brands(*),
          model:models(*),
          vehicle_images(*),
          vehicle_features(*)
        `)
        .in('id', favs);

      if (error) throw error;

      // Filter only active published & verified vehicles
      const valid = ((data as Vehicle[]) || []).filter(
        (v) => v.status === 'PUBLISHED' && v.verification_status === 'VERIFIED'
      );

      setVehicles(valid);
    } catch (err) {
      console.error('Error loading favorited vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedVehicles();

    const handleFavChange = () => {
      loadSavedVehicles();
    };

    window.addEventListener(FAVORITES_EVENT, handleFavChange);
    window.addEventListener('storage', handleFavChange);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleFavChange);
      window.removeEventListener('storage', handleFavChange);
    };
  }, []);

  const unavailableCount = favoriteIds.length - vehicles.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-red-600">♥</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Saved Vehicles
            </h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Vehicles you have saved locally to review later.
          </p>
        </div>

        {favoriteIds.length > 0 && (
          <span className="text-xs font-bold text-slate-500">
            {favoriteIds.length} saved vehicle(s)
          </span>
        )}
      </div>

      {/* Unavailable Vehicles Warning Banner */}
      {unavailableCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              {unavailableCount} of your saved {unavailableCount === 1 ? 'vehicle is' : 'vehicles are'} no longer available in the public marketplace (sold or unpublished).
            </span>
          </div>
        </div>
      )}

      {/* Favorites Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto font-black">
            ♡
          </div>
          <h3 className="text-xl font-black text-slate-900">No saved vehicles yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Click the heart icon <span className="text-red-500 font-bold">♡</span> on any vehicle card to save cars for quick comparison later.
          </p>
          <div className="pt-2">
            <Link
              href="/marketplace"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition inline-block"
            >
              Explore Vehicles Catalog
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
