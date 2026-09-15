'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';
import { formatKSH, formatDate, getStoragePublicUrl } from '@/lib/formatters';
import { Vehicle, Brand, VehicleStatus, VerificationStatus, ListingType } from '@/types/database';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeletons';
import { SafeImage } from '@/components/ui/SafeImage';

export default function VehiclesListPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedListingType, setSelectedListingType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedVerification, setSelectedVerification] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'year'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Fetch Brands
  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase.from('brands').select('*').order('name');
      if (data) setBrands(data);
    };
    fetchBrands();
  }, [supabase]);

  // Fetch Vehicles
  const loadVehicles = useCallback(async () => {
    try {
      setIsLoading(true);

      let query = supabase.from('vehicles').select(`
        *,
        brand:brands(name),
        model:models(name),
        vehicle_images(*)
      `);

      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand);
      }
      if (selectedListingType) {
        query = query.eq('listing_type', selectedListingType);
      }
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      if (selectedVerification) {
        query = query.eq('verification_status', selectedVerification);
      }
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;

      let results: Vehicle[] = (data as any[]) || [];

      // Filter search client-side for fast multi-field matching
      if (search.trim()) {
        const queryTerm = search.toLowerCase();
        results = results.filter((v) => {
          const brandName = (v.brand?.name || '').toLowerCase();
          const modelName = (v.model?.name || '').toLowerCase();
          const variant = (v.variant || '').toLowerCase();
          const location = (v.location || '').toLowerCase();
          return (
            brandName.includes(queryTerm) ||
            modelName.includes(queryTerm) ||
            variant.includes(queryTerm) ||
            location.includes(queryTerm)
          );
        });
      }

      setVehicles(results);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      showToast('Error Loading Vehicles', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedBrand, selectedListingType, selectedStatus, selectedVerification, featuredOnly, sortBy, sortOrder, search, showToast]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Quick Action Handlers
  const handleUpdateStatus = async (vehicleId: string, newStatus: VehicleStatus) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', vehicleId);

      if (error) throw error;
      showToast('Status Updated', `Vehicle status changed to ${newStatus}`, 'success');
      loadVehicles();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleUpdateVerification = async (vehicleId: string, newVerification: VerificationStatus) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ verification_status: newVerification, updated_at: new Date().toISOString() })
        .eq('id', vehicleId);

      if (error) throw error;
      showToast('Verification Updated', `Vehicle verification set to ${newVerification}`, 'success');
      loadVehicles();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleToggleFeatured = async (vehicleId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_featured: !currentFeatured, updated_at: new Date().toISOString() })
        .eq('id', vehicleId);

      if (error) throw error;
      showToast(
        !currentFeatured ? 'Featured On' : 'Featured Off',
        `Vehicle ${!currentFeatured ? 'added to' : 'removed from'} featured list.`,
        'info'
      );
      loadVehicles();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const promptDeleteVehicle = (vehicleId: string, vehicleTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${vehicleTitle}?`,
      message: 'This action is permanent and cannot be undone. All vehicle features and images will also be removed.',
      action: async () => {
        try {
          setIsModalLoading(true);
          const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
          if (error) throw error;
          showToast('Vehicle Deleted', `${vehicleTitle} removed from inventory.`, 'success');
          loadVehicles();
        } catch (err: any) {
          showToast('Delete Failed', err.message, 'error');
        } finally {
          setIsModalLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Vehicles Management</h1>
          <p className="text-xs text-zinc-400">
            Search, filter, edit, and publish vehicle listings across the dealership database.
          </p>
        </div>

        <Link
          href="/admin/vehicles/new"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+ Add New Vehicle</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search make, model, variant..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Brand Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="SOLD">SOLD</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Listing Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Listing Type</label>
            <select
              value={selectedListingType}
              onChange={(e) => setSelectedListingType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value="">All Listing Types</option>
              <option value="DEALER">DEALER</option>
              <option value="DIRECT_OWNER">DIRECT_OWNER</option>
              <option value="BANK_REPOSSESSED">BANK_REPOSSESSED</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Verification, Featured & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-red-600"
              />
              <span>⭐ Featured Only</span>
            </label>

            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
            >
              <option value="">Verification: All</option>
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
            >
              <option value="created_at">Date Created</option>
              <option value="price">Price</option>
              <option value="year">Year</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-white text-xs font-bold"
              title="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : vehicles.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-3 shadow-xl">
          <span className="text-4xl">🚘</span>
          <h3 className="text-lg font-bold text-white">No vehicles found</h3>
          <p className="text-xs text-zinc-400">
            No listings match your search or active filter settings.
          </p>
          <Link
            href="/admin/vehicles/new"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            Add New Vehicle
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Year & Price</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Listing & Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {vehicles.map((vehicle) => {
                  const primaryImage =
                    vehicle.vehicle_images?.find((img) => img.is_primary) ||
                    vehicle.vehicle_images?.[0];
                  const imageSrc = getStoragePublicUrl(primaryImage?.storage_path || '');
                  const title = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.variant || ''}`.trim();

                  return (
                    <tr key={vehicle.id} className="hover:bg-zinc-800/40 transition">
                      {/* Vehicle Thumbnail & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800 relative">
                            <SafeImage
                              src={imageSrc}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                            {vehicle.is_featured && (
                              <span className="absolute top-0.5 left-0.5 px-1 rounded bg-amber-500 text-black text-[9px] font-black">
                                ★
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{title || 'Untitled Vehicle'}</h4>
                            <span className="text-[11px] text-zinc-500">{vehicle.location || 'Nairobi'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Year & Price */}
                      <td className="p-4">
                        <div className="font-bold text-amber-400">{formatKSH(vehicle.price)}</div>
                        <div className="text-zinc-400 text-[11px]">Year {vehicle.year}</div>
                      </td>

                      {/* Details */}
                      <td className="p-4 space-y-0.5">
                        <div>{vehicle.fuel_type || 'N/A'} • {vehicle.transmission || 'N/A'}</div>
                        <div className="text-[11px] text-zinc-500">
                          {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A'}
                        </div>
                      </td>

                      {/* Listing & Verification Status */}
                      <td className="p-4 space-y-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-800 text-zinc-300">
                          {vehicle.listing_type}
                        </span>
                        <div>
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                            vehicle.verification_status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : vehicle.verification_status === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border border-red-800/50'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          }`}>
                            {vehicle.verification_status}
                          </span>
                        </div>
                      </td>

                      {/* Publication Status & Toggles */}
                      <td className="p-4">
                        <select
                          value={vehicle.status}
                          onChange={(e) => handleUpdateStatus(vehicle.id, e.target.value as VehicleStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            vehicle.status === 'PUBLISHED'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                              : vehicle.status === 'SOLD'
                              ? 'bg-blue-950 text-blue-400 border-blue-800/50'
                              : vehicle.status === 'RESERVED'
                              ? 'bg-purple-950 text-purple-400 border-purple-800/50'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="SOLD">SOLD</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(vehicle.id, vehicle.is_featured)}
                          className={`px-2 py-1 rounded text-[11px] font-bold ${
                            vehicle.is_featured ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-500 hover:text-white'
                          }`}
                          title="Toggle Featured status"
                        >
                          {vehicle.is_featured ? '★ Featured' : '☆ Feature'}
                        </button>

                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => promptDeleteVehicle(vehicle.id, title)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 font-semibold text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete Vehicle"
        isDanger={true}
        isLoading={isModalLoading}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
