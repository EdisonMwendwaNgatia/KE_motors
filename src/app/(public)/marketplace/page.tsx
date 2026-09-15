'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { VehicleCard } from '@/components/public/VehicleCard';
import { VehicleFilterDrawer, FilterState } from '@/components/public/VehicleFilterDrawer';
import { Vehicle, Brand, Model } from '@/types/database';
import { CardSkeleton } from '@/components/ui/Skeletons';

function MarketplaceContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Initialize filter state from URL search params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    body: searchParams.get('body') || '',
    location: searchParams.get('location') || '',
    listingType: searchParams.get('listingType') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  // Sync state to URL params when filters change
  const updateUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, val]) => {
        if (val) {
          params.set(key, val);
        }
      });
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const handleClearFilters = () => {
    const cleared: FilterState = {
      search: '',
      brand: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuel: '',
      transmission: '',
      body: '',
      location: '',
      listingType: '',
      sort: 'newest',
    };
    setFilters(cleared);
    updateUrlParams(cleared);
  };

  // Fetch Brands & Models for dropdowns
  useEffect(() => {
    async function loadMeta() {
      try {
        const [bRes, mRes] = await Promise.all([
          supabase.from('brands').select('*').order('name'),
          supabase.from('models').select('*').order('name'),
        ]);
        if (bRes.data) setBrands(bRes.data);
        if (mRes.data) setModels(mRes.data);
      } catch (err) {
        console.error('Error fetching filter metadata:', err);
      }
    }
    loadMeta();
  }, [supabase]);

  // Load Vehicles based on filters
  const loadVehicles = useCallback(async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('vehicles')
        .select(`
          *,
          brand:brands(*),
          model:models(*),
          vehicle_images(*),
          vehicle_features(*)
        `)
        .eq('status', 'PUBLISHED')
        .eq('verification_status', 'VERIFIED');

      // Filter by min / max price
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice, 10));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice, 10));
      }

      // Filter by min / max year
      if (filters.minYear) {
        query = query.gte('year', parseInt(filters.minYear, 10));
      }
      if (filters.maxYear) {
        query = query.lte('year', parseInt(filters.maxYear, 10));
      }

      // Filter by transmission, fuel, body, listingType
      if (filters.transmission) {
        query = query.ilike('transmission', `%${filters.transmission}%`);
      }
      if (filters.fuel) {
        query = query.ilike('fuel_type', `%${filters.fuel}%`);
      }
      if (filters.body) {
        query = query.ilike('body_type', `%${filters.body}%`);
      }
      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }

      // Sorting
      if (filters.sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (filters.sort === 'year_desc') {
        query = query.order('year', { ascending: false });
      } else {
        // default newest
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let results: Vehicle[] = (data as Vehicle[]) || [];

      // In-memory filter for Brand, Model, Search keywords & Location for maximum flexibility
      if (filters.brand) {
        const targetBrand = filters.brand.toLowerCase();
        results = results.filter(
          (v) =>
            v.brand?.name.toLowerCase() === targetBrand ||
            v.brand?.slug.toLowerCase() === targetBrand
        );
      }

      if (filters.model) {
        const targetModel = filters.model.toLowerCase();
        results = results.filter(
          (v) =>
            v.model?.name.toLowerCase() === targetModel ||
            v.model?.slug.toLowerCase() === targetModel
        );
      }

      if (filters.location) {
        const loc = filters.location.toLowerCase();
        results = results.filter((v) => (v.location || '').toLowerCase().includes(loc));
      }

      if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        results = results.filter((v) => {
          const brandMatch = (v.brand?.name || '').toLowerCase().includes(term);
          const modelMatch = (v.model?.name || '').toLowerCase().includes(term);
          const variantMatch = (v.variant || '').toLowerCase().includes(term);
          const descMatch = (v.description || '').toLowerCase().includes(term);
          const yearMatch = (v.year ? String(v.year) : '').includes(term);
          return brandMatch || modelMatch || variantMatch || descMatch || yearMatch;
        });
      }

      setVehicles(results);
    } catch (err) {
      console.error('Error loading marketplace vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, filters]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Vehicles Marketplace
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Browse verified bank repossessions, direct owner deals, and selected dealer inventory.
          </p>
        </div>

        {/* Top Search Input & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search make, model, keywords..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            type="button"
            className="lg:hidden px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
          >
            <span>⚙️ Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Vehicle Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <div className="lg:col-span-1">
          <VehicleFilterDrawer
            filters={filters}
            onChangeFilter={handleFilterChange}
            onClearFilters={handleClearFilters}
            brands={brands}
            models={models}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            totalResultsCount={vehicles.length}
          />
        </div>

        {/* Right Vehicle Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting Control Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-700">
              Showing <span className="text-red-600 font-black">{vehicles.length}</span> verified {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Sort by:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-red-600"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="year_desc">Year: Newest</option>
              </select>
            </div>
          </div>

          {/* Vehicle Grid / Skeleton / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-3xl mx-auto">
                🏎️
              </div>
              <h3 className="text-xl font-black text-slate-900">No vehicles match your search</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Try adjusting your search criteria, price range, or clear active filters to discover available inventory.
              </p>
              <button
                onClick={handleClearFilters}
                type="button"
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, idx) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} priority={idx < 3} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8"><CardSkeleton /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
