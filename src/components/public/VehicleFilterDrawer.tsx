'use client';

import React from 'react';
import { Brand, Model } from '@/types/database';

export interface FilterState {
  search: string;
  brand: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  fuel: string;
  transmission: string;
  body: string;
  location: string;
  listingType: string;
  sort: string;
}

interface VehicleFilterDrawerProps {
  filters: FilterState;
  onChangeFilter: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  brands: Brand[];
  models: Model[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  totalResultsCount?: number;
}

export function VehicleFilterDrawer({
  filters,
  onChangeFilter,
  onClearFilters,
  brands,
  models,
  isOpenMobile = false,
  onCloseMobile,
  totalResultsCount,
}: VehicleFilterDrawerProps) {
  // Filter models list by currently selected brand
  const selectedBrandObj = brands.find(
    (b) => b.slug === filters.brand || b.id === filters.brand || b.name.toLowerCase() === filters.brand.toLowerCase()
  );

  const availableModels = selectedBrandObj
    ? models.filter((m) => m.brand_id === selectedBrandObj.id)
    : models;

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900">Filter Vehicles</h3>
          {totalResultsCount !== undefined && (
            <p className="text-xs text-slate-500 font-medium">
              Showing {totalResultsCount} verified {totalResultsCount === 1 ? 'vehicle' : 'vehicles'}
            </p>
          )}
        </div>
        <button
          onClick={onClearFilters}
          type="button"
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear Filters
        </button>
      </div>

      {/* Brand & Model */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Make</label>
          <select
            value={filters.brand}
            onChange={(e) => {
              onChangeFilter('brand', e.target.value);
              onChangeFilter('model', ''); // Reset model on brand change
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
          <select
            value={filters.model}
            onChange={(e) => onChangeFilter('model', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
          >
            <option value="">All Models</option>
            {availableModels.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Listing Type</label>
        <select
          value={filters.listingType}
          onChange={(e) => onChangeFilter('listingType', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
        >
          <option value="">All Listing Types</option>
          <option value="BANK_REPOSSESSED">Bank Repossessed</option>
          <option value="DIRECT_OWNER">Direct Owner</option>
          <option value="DEALER">Dealer</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Price Range (KSh)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => onChangeFilter('minPrice', e.target.value)}
            placeholder="Min Price"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onChangeFilter('maxPrice', e.target.value)}
            placeholder="Max Price"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Year Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minYear}
            onChange={(e) => onChangeFilter('minYear', e.target.value)}
            placeholder="Min Year"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
          />
          <input
            type="number"
            value={filters.maxYear}
            onChange={(e) => onChangeFilter('maxYear', e.target.value)}
            placeholder="Max Year"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Transmission & Fuel */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
          <select
            value={filters.transmission}
            onChange={(e) => onChangeFilter('transmission', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
          >
            <option value="">Any</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
          <select
            value={filters.fuel}
            onChange={(e) => onChangeFilter('fuel', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
          >
            <option value="">Any</option>
            <option value="Gasoline">Gasoline / Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
      </div>

      {/* Body Type & Location */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Body Type</label>
          <select
            value={filters.body}
            onChange={(e) => onChangeFilter('body', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
          >
            <option value="">All Body Types</option>
            <option value="SUV">SUV / Crossover</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Pickup">Pickup Truck</option>
            <option value="Station Wagon">Station Wagon</option>
            <option value="Coupe">Coupe</option>
            <option value="Van">Van / Minivan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onChangeFilter('location', e.target.value)}
            placeholder="e.g. Kiambu Road, Nairobi"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
          />
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Panel */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-3xl p-6 shadow-xs sticky top-24">
        {content}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <span className="text-lg font-black text-slate-900">Filters</span>
                <button
                  onClick={onCloseMobile}
                  type="button"
                  className="p-2 rounded-full bg-slate-100 text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={onCloseMobile}
                type="button"
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
