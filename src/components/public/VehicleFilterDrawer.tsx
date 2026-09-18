'use client';

import React, { useState, useEffect } from 'react';
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
  onApplyFilters: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  brands: Brand[];
  models: Model[];
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  totalResultsCount?: number;
}

export function VehicleFilterDrawer({
  filters,
  onApplyFilters,
  onClearFilters,
  brands,
  models,
  isCollapsed = false,
  onToggleCollapse,
  totalResultsCount,
}: VehicleFilterDrawerProps) {
  // Local draft state for filters before user clicks "Apply Filters"
  const [draft, setDraft] = useState<FilterState>(filters);

  // Sync draft state if active filters change (e.g. from Clear Filters or URL)
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleDraftChange = (key: keyof FilterState, value: string) => {
    setDraft((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'brand') {
        updated.model = ''; // Reset model when brand changes
      }
      return updated;
    });
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApplyFilters(draft);
    if (onToggleCollapse) {
      onToggleCollapse(true); // Collapse filter grid after applying
    }
  };

  const handleClear = () => {
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
      sort: filters.sort || 'newest',
    };
    setDraft(cleared);
    onClearFilters();
  };

  // Filter models list by currently selected draft brand
  const selectedBrandObj = brands.find(
    (b) => b.slug === draft.brand || b.id === draft.brand || b.name.toLowerCase() === draft.brand.toLowerCase()
  );

  const availableModels = selectedBrandObj
    ? models.filter((m) => m.brand_id === selectedBrandObj.id)
    : models;

  // Count how many draft filters are active
  const activeCount = Object.entries(draft).filter(
    ([key, val]) => val && key !== 'sort' && key !== 'search'
  ).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden transition-all duration-300">
      
      {/* Collapsible Header Toggle Bar */}
      <div
        onClick={() => onToggleCollapse && onToggleCollapse(!isCollapsed)}
        className="p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ⚙️
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span>Filter Vehicles</span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold">
                  {activeCount} active
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {isCollapsed ? 'Click to expand filters' : 'Select options and click Apply Filters'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:border-red-600 transition flex items-center gap-1"
        >
          <span>{isCollapsed ? 'Show Filters' : 'Hide Filters'}</span>
          <span>{isCollapsed ? '▼' : '▲'}</span>
        </button>
      </div>

      {/* Collapsible Filter Body */}
      {!isCollapsed && (
        <form onSubmit={handleApply} className="p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          
          {/* Grid Layout of Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Brand / Make */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Make</label>
              <select
                value={draft.brand}
                onChange={(e) => handleDraftChange('brand', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
              <select
                value={draft.model}
                onChange={(e) => handleDraftChange('model', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
              >
                <option value="">All Models</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Type</label>
              <select
                value={draft.listingType}
                onChange={(e) => handleDraftChange('listingType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
              >
                <option value="">All Source Types</option>
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
                  value={draft.minPrice}
                  onChange={(e) => handleDraftChange('minPrice', e.target.value)}
                  placeholder="Min KSh"
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                />
                <input
                  type="number"
                  value={draft.maxPrice}
                  onChange={(e) => handleDraftChange('maxPrice', e.target.value)}
                  placeholder="Max KSh"
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={draft.minYear}
                  onChange={(e) => handleDraftChange('minYear', e.target.value)}
                  placeholder="Min Year"
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                />
                <input
                  type="number"
                  value={draft.maxYear}
                  onChange={(e) => handleDraftChange('maxYear', e.target.value)}
                  placeholder="Max Year"
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
              <select
                value={draft.transmission}
                onChange={(e) => handleDraftChange('transmission', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
              >
                <option value="">Any Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
              <select
                value={draft.fuel}
                onChange={(e) => handleDraftChange('fuel', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
              >
                <option value="">Any Fuel Type</option>
                <option value="Gasoline">Gasoline / Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Body Type</label>
              <select
                value={draft.body}
                onChange={(e) => handleDraftChange('body', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
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

          </div>

          {/* Action Footer Bar (Apply & Clear Buttons) */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition"
            >
              Reset Draft Filters
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleCollapse && onToggleCollapse(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20 transition active:scale-95 flex items-center gap-1.5"
              >
                <span>Apply Filters</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
