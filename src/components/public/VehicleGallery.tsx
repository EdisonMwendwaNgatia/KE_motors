'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VehicleImage } from '@/types/database';
import { getStoragePublicUrl } from '@/lib/formatters';
import { SafeImage } from '@/components/ui/SafeImage';

interface VehicleGalleryProps {
  images: VehicleImage[];
  vehicleTitle: string;
}

export function VehicleGallery({ images, vehicleTitle }: VehicleGalleryProps) {
  // Sort images by display_order, with is_primary first if defined
  const sortedImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    return [...images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fallbackUrl =
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80';

  const currentImgObj = sortedImages[currentIndex];
  const mainImageUrl = currentImgObj
    ? getStoragePublicUrl(currentImgObj.storage_path)
    : fallbackUrl;

  const handleNext = useCallback(() => {
    if (sortedImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  }, [sortedImages.length]);

  const handlePrev = useCallback(() => {
    if (sortedImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  }, [sortedImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  if (sortedImages.length === 0) {
    return (
      <div className="w-full aspect-16/10 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
        <SafeImage
          src={fallbackUrl}
          alt={vehicleTitle}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-16/10 w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-md group">
        <SafeImage
          key={mainImageUrl}
          src={mainImageUrl}
          alt={currentImgObj?.alt_text || vehicleTitle}
          className="w-full h-full object-cover cursor-pointer transition-opacity duration-300"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Fullscreen Expand Overlay Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          type="button"
          className="absolute top-4 right-4 z-10 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md transition flex items-center gap-1.5 shadow-md"
        >
          <span>🔍</span>
          <span>Expand Gallery</span>
        </button>

        {/* Previous / Next Arrow Controls */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center font-black text-lg transition opacity-90 hover:scale-105 active:scale-95"
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center font-black text-lg transition opacity-90 hover:scale-105 active:scale-95"
              aria-label="Next image"
            >
              ›
            </button>

            {/* Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {sortedImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {sortedImages.map((img, idx) => {
            const url = getStoragePublicUrl(img.storage_path);
            const isSelected = idx === currentIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setCurrentIndex(idx)}
                type="button"
                className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-red-600 scale-105 shadow-md ring-2 ring-red-600/30'
                    : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <SafeImage
                  src={url}
                  alt={img.alt_text || `${vehicleTitle} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          
          {/* Top Lightbox Header */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black tracking-tight">{vehicleTitle}</h3>
              <p className="text-xs text-slate-400 font-medium">
                Photo {currentIndex + 1} of {sortedImages.length}
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              type="button"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg transition"
              aria-label="Close Lightbox"
            >
              ✕
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden">
            <SafeImage
              key={mainImageUrl}
              src={mainImageUrl}
              alt={currentImgObj?.alt_text || vehicleTitle}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  type="button"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-slate-900 hover:text-slate-900 backdrop-blur-md shadow-lg flex items-center justify-center font-black text-2xl transition"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  type="button"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-slate-900 hover:text-slate-900 backdrop-blur-md shadow-lg flex items-center justify-center font-black text-2xl transition"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails */}
          <div className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto pt-4 border-t border-slate-800">
            {sortedImages.map((img, idx) => {
              const url = getStoragePublicUrl(img.storage_path);
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={img.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  type="button"
                  className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                    isSelected ? 'border-red-500 scale-110' : 'border-slate-700 opacity-50 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
