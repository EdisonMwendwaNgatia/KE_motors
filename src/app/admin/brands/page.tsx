'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';
import { Brand, Model } from '@/types/database';
import { generateSlug, getStoragePublicUrl } from '@/lib/formatters';
import { SafeImage } from '@/components/ui/SafeImage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface BrandWithCount extends Brand {
  vehicle_count?: number;
  models?: Model[];
}

export default function BrandsManagementPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [brands, setBrands] = useState<BrandWithCount[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandWithCount | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Brand Creation/Editing
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Modal State for Model Creation/Editing
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelName, setModelName] = useState('');

  // Confirmation Modal
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

  // Fetch Brands and Vehicle counts
  const loadBrands = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (brandsError) throw brandsError;

      const brandsList: BrandWithCount[] = (brandsData as any[]) || [];

      // Fetch all vehicles brand_ids in a single fast query
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('brand_id');

      const countMap: Record<string, number> = {};
      if (vehiclesData) {
        for (const v of vehiclesData) {
          if (v.brand_id) {
            countMap[v.brand_id] = (countMap[v.brand_id] || 0) + 1;
          }
        }
      }

      for (const brand of brandsList) {
        brand.vehicle_count = countMap[brand.id] || 0;
      }

      setBrands(brandsList);

      setSelectedBrand((prev) => {
        if (!prev && brandsList.length > 0) return brandsList[0];
        if (prev) {
          return brandsList.find((b) => b.id === prev.id) || brandsList[0] || null;
        }
        return null;
      });
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      showToast('Error Loading Brands', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, showToast]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Fetch models for selected brand
  const loadModels = useCallback(async (brandId: string) => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('brand_id', brandId)
        .order('name');

      if (error) throw error;
      setModels(data || []);
    } catch (err: any) {
      console.error('Error loading models:', err);
      showToast('Error Loading Models', err.message, 'error');
    }
  }, [supabase, showToast]);

  useEffect(() => {
    if (selectedBrand?.id) {
      loadModels(selectedBrand.id);
    } else {
      setModels([]);
    }
  }, [selectedBrand?.id, loadModels]);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `brand_logos/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const publicUrl = getStoragePublicUrl(data.path);
      setBrandLogoUrl(publicUrl);
      showToast('Logo Uploaded', 'Brand logo added successfully.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message, 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Create / Edit Brand
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      showToast('Validation Error', 'Brand name is required.', 'error');
      return;
    }

    const slug = generateSlug(brandName, '');

    try {
      if (editingBrand) {
        const { error } = await supabase
          .from('brands')
          .update({
            name: brandName.trim(),
            slug: slug,
            logo_url: brandLogoUrl.trim() || null,
          })
          .eq('id', editingBrand.id);

        if (error) throw error;
        showToast('Brand Updated', `${brandName} saved successfully.`, 'success');
      } else {
        const { error } = await supabase.from('brands').insert({
          name: brandName.trim(),
          slug: slug,
          logo_url: brandLogoUrl.trim() || null,
        });

        if (error) throw error;
        showToast('Brand Created', `${brandName} added to database.`, 'success');
      }

      setIsBrandModalOpen(false);
      setEditingBrand(null);
      setBrandName('');
      setBrandLogoUrl('');
      loadBrands();
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    }
  };

  // Delete Brand
  const promptDeleteBrand = (brand: BrandWithCount) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Brand "${brand.name}"?`,
      message: `Are you sure you want to delete ${brand.name}? Any associated models and vehicles will be affected.`,
      action: async () => {
        try {
          setIsModalLoading(true);
          const { error } = await supabase.from('brands').delete().eq('id', brand.id);
          if (error) throw error;
          showToast('Brand Deleted', `${brand.name} has been removed.`, 'success');
          if (selectedBrand?.id === brand.id) setSelectedBrand(null);
          loadBrands();
        } catch (err: any) {
          showToast('Delete Failed', err.message, 'error');
        } finally {
          setIsModalLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Create / Edit Model
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;
    if (!modelName.trim()) {
      showToast('Validation Error', 'Model name is required.', 'error');
      return;
    }

    const slug = generateSlug(selectedBrand.name, modelName);

    try {
      if (editingModel) {
        const { error } = await supabase
          .from('models')
          .update({
            name: modelName.trim(),
            slug: slug,
          })
          .eq('id', editingModel.id);

        if (error) throw error;
        showToast('Model Updated', `${modelName} updated successfully.`, 'success');
      } else {
        const { error } = await supabase.from('models').insert({
          brand_id: selectedBrand.id,
          name: modelName.trim(),
          slug: slug,
        });

        if (error) throw error;
        showToast('Model Created', `${modelName} added under ${selectedBrand.name}.`, 'success');
      }

      setIsModelModalOpen(false);
      setEditingModel(null);
      setModelName('');
      loadModels(selectedBrand.id);
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    }
  };

  // Delete Model
  const promptDeleteModel = (model: Model) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Model "${model.name}"?`,
      message: `Are you sure you want to delete model ${model.name}?`,
      action: async () => {
        try {
          setIsModalLoading(true);
          const { error } = await supabase.from('models').delete().eq('id', model.id);
          if (error) throw error;
          showToast('Model Deleted', `${model.name} removed.`, 'success');
          if (selectedBrand) loadModels(selectedBrand.id);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Brands & Models Manager</h1>
          <p className="text-xs text-zinc-400">
            Organize automotive manufacturers and model series for vehicle listings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBrand(null);
            setBrandName('');
            setBrandLogoUrl('');
            setIsBrandModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <span>+ Add New Brand</span>
        </button>
      </div>

      {/* Main Grid: Brands List on Left, Selected Brand Models on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brands Panel */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center justify-between">
            <span>Automotive Brands</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-300 font-bold">
              {brands.length}
            </span>
          </h3>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-500 animate-pulse">
              Loading brands database...
            </div>
          ) : brands.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No vehicle brands found. Click Add Brand above.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {brands.map((brand) => {
                const isSelected = selectedBrand?.id === brand.id;
                return (
                  <div
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-800/90 border-zinc-600 shadow-md ring-1 ring-zinc-500/20'
                        : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {brand.logo_url ? (
                          <SafeImage
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="font-black text-zinc-400 text-xs">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">{brand.name}</h4>
                        <p className="text-[11px] text-zinc-400">
                          {brand.vehicle_count || 0} vehicle(s) listed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBrand(brand);
                          setBrandName(brand.name);
                          setBrandLogoUrl(brand.logo_url || '');
                          setIsBrandModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold"
                        title="Edit brand"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          promptDeleteBrand(brand);
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-950 hover:bg-red-950 text-zinc-400 hover:text-red-300 text-[11px] font-semibold border border-zinc-800"
                        title="Delete brand"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Models Panel for Selected Brand */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          {!selectedBrand ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              Select a brand on the left to view and manage its models.
            </div>
          ) : (
            <>
              {/* Selected Brand Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1">
                    {selectedBrand.logo_url ? (
                      <SafeImage
                        src={selectedBrand.logo_url}
                        alt={selectedBrand.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-red-500 text-base">
                        {selectedBrand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedBrand.name} Models</h2>
                    <p className="text-xs text-zinc-400">
                      Slug: <code className="text-red-400">{selectedBrand.slug}</code>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingModel(null);
                    setModelName('');
                    setIsModelModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition flex items-center gap-1"
                >
                  <span>+ Add Model</span>
                </button>
              </div>

              {/* Models List */}
              {models.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No models registered under {selectedBrand.name} yet. Click Add Model above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{model.name}</h4>
                        <p className="text-[11px] text-zinc-500">slug: {model.slug}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingModel(model);
                            setModelName(model.name);
                            setIsModelModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDeleteModel(model)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveBrand}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white">
              {editingBrand ? 'Edit Brand' : 'Create New Brand'}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Toyota, Mercedes-Benz, BMW"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Brand Logo
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  placeholder="https://... or upload logo"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                />
                <label className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer shrink-0">
                  {isUploadingLogo ? '...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                Save Brand
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Model Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveModel}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white">
              {editingModel ? 'Edit Model' : `Add Model to ${selectedBrand?.name}`}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Prado, Land Cruiser, Demio, X5"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                Save Model
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={isModalLoading}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
