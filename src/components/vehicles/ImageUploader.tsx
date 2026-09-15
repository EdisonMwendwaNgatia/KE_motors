'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';
import { getStoragePublicUrl } from '@/lib/formatters';

export interface ImageItem {
  id?: string;
  storage_path: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  file?: File;
  preview_url?: string;
  isUploading?: boolean;
}

interface ImageUploaderProps {
  vehicleId?: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ vehicleId, images, onChange }: ImageUploaderProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = vehicleId ? `${vehicleId}/${fileName}` : `temp/${fileName}`;

    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return data.path;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      setUploadProgress(10);
      const newImageItems: ImageItem[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 90));

        try {
          const path = await uploadFileToSupabase(file);
          const isFirst = images.length === 0 && i === 0;

          newImageItems.push({
            storage_path: path,
            alt_text: file.name.replace(/\.[^/.]+$/, ''),
            is_primary: isFirst,
            display_order: images.length + i,
            preview_url: URL.createObjectURL(file),
          });
        } catch (err: any) {
          console.error('Failed to upload image:', file.name, err);
          showToast('Image Upload Error', `Failed to upload ${file.name}: ${err.message}`, 'error');
        }
      }

      const updated = [...images, ...newImageItems];
      // Ensure at least one image is primary if images exist
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      onChange(updated);
      showToast('Images Uploaded', `Successfully added ${newImageItems.length} image(s).`, 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'An error occurred uploading images.', 'error');
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = (targetIndex: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === targetIndex,
    }));
    onChange(updated);
  };

  const handleRemove = async (targetIndex: number) => {
    const itemToRemove = images[targetIndex];
    if (itemToRemove.id && vehicleId) {
      try {
        await supabase.from('vehicle_images').delete().eq('id', itemToRemove.id);
      } catch (err) {
        console.error('Error deleting vehicle_images row:', err);
      }
    }

    const updated = images.filter((_, idx) => idx !== targetIndex);
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true;
    }
    onChange(updated);
  };

  const handleUpdateAltText = (targetIndex: number, text: string) => {
    const updated = [...images];
    updated[targetIndex].alt_text = text;
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    // Recalculate display_order
    updated.forEach((img, idx) => {
      img.display_order = idx;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <span>🖼️ Vehicle Images Gallery</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] text-red-400">
            {images.length} uploaded
          </span>
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950 transition flex items-center gap-1.5"
        >
          <span>+ Upload Images</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
          isDragging
            ? 'border-red-500 bg-red-950/20'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl text-zinc-400">
          📁
        </div>
        <p className="text-xs font-semibold text-zinc-300">
          Drag & drop vehicle photos here, or <span className="text-red-400 underline">browse</span>
        </p>
        <p className="text-[11px] text-zinc-500">Supports PNG, JPG, WEBP. First image will be set as primary thumbnail.</p>
      </div>

      {/* Progress Bar */}
      {uploadProgress !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Uploading images to Supabase Storage...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {images.map((img, idx) => {
            const url = img.preview_url || getStoragePublicUrl(img.storage_path);

            return (
              <div
                key={img.id || img.storage_path + idx}
                className={`relative rounded-2xl bg-zinc-900 border overflow-hidden transition flex flex-col ${
                  img.is_primary
                    ? 'border-red-500 ring-2 ring-red-500/20 shadow-xl'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-44 bg-zinc-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={img.alt_text || 'Vehicle photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80');
                    }}
                  />

                  {/* Primary Badge */}
                  {img.is_primary && (
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-lg">
                      ⭐ PRIMARY THUMBNAIL
                    </span>
                  )}

                  {/* Controls overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-xl p-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, idx - 1)}
                      className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] disabled:opacity-30"
                      title="Move Left/Up"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, idx + 1)}
                      className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] disabled:opacity-30"
                      title="Move Right/Down"
                    >
                      ▶
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="w-6 h-6 rounded bg-red-950 hover:bg-red-800 text-red-300 text-xs font-bold"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-zinc-900 space-y-2">
                  <input
                    type="text"
                    value={img.alt_text || ''}
                    onChange={(e) => handleUpdateAltText(idx, e.target.value)}
                    placeholder="Alt text / description..."
                    className="w-full px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
                  />

                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition"
                    >
                      Set as Primary Thumbnail
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
