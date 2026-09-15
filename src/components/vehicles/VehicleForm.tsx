'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';
import { Brand, Model, Vehicle, ListingType, VehicleStatus, VerificationStatus } from '@/types/database';
import { formatKSH, generateSlug } from '@/lib/formatters';
import { FeatureManager } from './FeatureManager';
import { ImageUploader, ImageItem } from './ImageUploader';

interface VehicleFormProps {
  initialVehicle?: Vehicle;
  brands: Brand[];
  initialModels?: Model[];
}

export function VehicleForm({ initialVehicle, brands, initialModels = [] }: VehicleFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const isEditing = !!initialVehicle?.id;

  // Form Fields State
  const [brandId, setBrandId] = useState(initialVehicle?.brand_id || brands[0]?.id || '');
  const [models, setModels] = useState<Model[]>(initialModels);
  const [modelId, setModelId] = useState(initialVehicle?.model_id || '');
  const [variant, setVariant] = useState(initialVehicle?.variant || '');
  const [year, setYear] = useState<number>(initialVehicle?.year || new Date().getFullYear());
  const [price, setPrice] = useState<number>(initialVehicle?.price || 0);
  const [mileage, setMileage] = useState<number | ''>(initialVehicle?.mileage ?? '');
  const [fuelType, setFuelType] = useState(initialVehicle?.fuel_type || 'Petrol');
  const [transmission, setTransmission] = useState(initialVehicle?.transmission || 'Automatic');
  const [engineSize, setEngineSize] = useState(initialVehicle?.engine_size || '');
  const [bodyType, setBodyType] = useState(initialVehicle?.body_type || 'SUV');
  const [location, setLocation] = useState(initialVehicle?.location || 'Nairobi');
  const [description, setDescription] = useState(initialVehicle?.description || '');
  const [listingType, setListingType] = useState<ListingType>((initialVehicle?.listing_type as ListingType) || 'DEALER');
  const [status, setStatus] = useState<VehicleStatus>((initialVehicle?.status as VehicleStatus) || 'DRAFT');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>((initialVehicle?.verification_status as VerificationStatus) || 'PENDING');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialVehicle?.is_featured || false);

  // Features State
  const [features, setFeatures] = useState<string[]>(
    initialVehicle?.vehicle_features?.map((f) => f.feature) || []
  );

  // Images State
  const [images, setImages] = useState<ImageItem[]>(
    initialVehicle?.vehicle_images?.map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text || '',
      is_primary: img.is_primary,
      display_order: img.display_order,
    })) || []
  );

  const [isSaving, setIsSaving] = useState(false);

  // Load models when brand selection changes
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('brand_id', brandId)
        .order('name');
      
      if (!error && data) {
        setModels(data);
        if (!data.some((m) => m.id === modelId)) {
          setModelId(data[0]?.id || '');
        }
      }
    };

    fetchModels();
  }, [brandId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form Validations
    if (!brandId) {
      showToast('Validation Error', 'Please select a Brand.', 'error');
      return;
    }
    if (!modelId) {
      showToast('Validation Error', 'Please select a Model.', 'error');
      return;
    }
    if (!year || year < 1900 || year > new Date().getFullYear() + 2) {
      showToast('Validation Error', 'Please enter a valid vehicle year.', 'error');
      return;
    }
    if (!price || price <= 0) {
      showToast('Validation Error', 'Please enter a positive vehicle price.', 'error');
      return;
    }

    const selectedBrand = brands.find((b) => b.id === brandId);
    const selectedModel = models.find((m) => m.id === modelId);

    const generatedSlug = generateSlug(
      selectedBrand?.name || '',
      selectedModel?.name || '',
      variant,
      year
    ) + `-${Date.now().toString(36).slice(-4)}`;

    try {
      setIsSaving(true);

      const vehiclePayload = {
        brand_id: brandId,
        model_id: modelId,
        variant: variant.trim() || null,
        year: Number(year),
        price: Number(price),
        mileage: mileage === '' ? null : Number(mileage),
        fuel_type: fuelType || null,
        transmission: transmission || null,
        engine_size: engineSize || null,
        body_type: bodyType || null,
        location: location || null,
        description: description || null,
        listing_type: listingType,
        status: status,
        verification_status: verificationStatus,
        is_featured: isFeatured,
        slug: generatedSlug,
        updated_at: new Date().toISOString(),
      };

      let vehicleId = initialVehicle?.id;

      if (isEditing && vehicleId) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(vehiclePayload)
          .eq('id', vehicleId);

        if (updateError) throw updateError;
      } else {
        const { data: newVehicle, error: insertError } = await supabase
          .from('vehicles')
          .insert(vehiclePayload)
          .select()
          .single();

        if (insertError) throw insertError;
        vehicleId = newVehicle.id;
      }

      // Save Features (Delete existing & re-insert)
      if (vehicleId) {
        try {
          await supabase.from('vehicle_features').delete().eq('vehicle_id', vehicleId);
          if (features.length > 0) {
            const featureRows = features.map((feat, idx) => ({
              vehicle_id: vehicleId,
              feature: feat,
              display_order: idx,
            }));
            await supabase.from('vehicle_features').insert(featureRows);
          }
        } catch (featErr) {
          console.warn('Vehicle features save notice:', featErr);
        }

        // Save Vehicle Images
        if (images.length > 0) {
          // Delete existing images records and insert current image list
          await supabase.from('vehicle_images').delete().eq('vehicle_id', vehicleId);
          const imageRows = images.map((img, idx) => ({
            vehicle_id: vehicleId,
            storage_path: img.storage_path,
            alt_text: img.alt_text || null,
            is_primary: img.is_primary,
            display_order: idx,
          }));
          await supabase.from('vehicle_images').insert(imageRows);
        }
      }

      showToast(
        isEditing ? 'Vehicle Updated' : 'Vehicle Created',
        `Successfully saved vehicle listing.`,
        'success'
      );

      router.push('/admin/vehicles');
      router.refresh();
    } catch (err: any) {
      console.error('Save vehicle error:', err);
      showToast('Save Failed', err.message || 'Error saving vehicle listing.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">
            {isEditing ? 'Edit Vehicle Listing' : 'Create New Vehicle Listing'}
          </h1>
          <p className="text-xs text-zinc-400">
            Fill in specs, pricing, features, and upload photos for the vehicle catalogue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            <span>{isSaving ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Publish Listing'}</span>
          </button>
        </div>
      </div>

      {/* 1. Basic Information */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <span>📋</span> Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Brand / Make <span className="text-red-500">*</span>
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="" disabled>Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="" disabled>
                {models.length === 0 ? 'No models available for brand' : 'Select Model'}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variant */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Variant / Trim
            </label>
            <input
              type="text"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="e.g. 2.0 AWD, Hybrid Package, M-Sport"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Year of Manufacture <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1990"
              max={new Date().getFullYear() + 2}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Pricing & Financials */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <span>💰</span> Pricing & Currency
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Vehicle Price (Numeric) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g. 1680000"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex flex-col justify-center p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Formatted Kenyan Price Preview:
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1">
              {formatKSH(price)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Specifications */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <span>⚙️</span> Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Mileage (KM)
            </label>
            <input
              type="number"
              min="0"
              value={mileage}
              onChange={(e) => setMileage(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 75000"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Fuel Type
            </label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Transmission
            </label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Engine Capacity / Size
            </label>
            <input
              type="text"
              value={engineSize}
              onChange={(e) => setEngineSize(e.target.value)}
              placeholder="e.g. 1500cc, 2.0L, V6"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Body Type
            </label>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Pickup">Pickup</option>
              <option value="Station Wagon">Station Wagon</option>
              <option value="Coupe">Coupe</option>
              <option value="Van / Bus">Van / Bus</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi, Mombasa, Nakuru"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Listing Information & Badges */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <span>🏷️</span> Listing & Status Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Listing Type
            </label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as ListingType)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="DEALER">DEALER</option>
              <option value="DIRECT_OWNER">DIRECT_OWNER</option>
              <option value="BANK_REPOSSESSED">BANK_REPOSSESSED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="SOLD">SOLD</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Verification Status
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <span className="text-xs font-bold text-white block">Featured Vehicle</span>
              <span className="text-[11px] text-zinc-500">Showcase on homepage</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                isFeatured ? 'bg-amber-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Rich Description */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <span>📝</span> Detailed Vehicle Description
        </h3>

        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a comprehensive description detailing condition, service history, import origin, mechanical health..."
          className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 leading-relaxed"
        />
      </div>

      {/* 6. Dynamic Features Manager */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <FeatureManager features={features} onChange={setFeatures} />
      </div>

      {/* 7. Image Gallery Uploader */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <ImageUploader vehicleId={initialVehicle?.id} images={images} onChange={setImages} />
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-xl shadow-red-950 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          <span>{isSaving ? 'Saving Changes...' : isEditing ? 'Save Vehicle Changes' : 'Publish New Listing'}</span>
        </button>
      </div>
    </form>
  );
}
