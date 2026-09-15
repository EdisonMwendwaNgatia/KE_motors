'use client';

import React, { useState } from 'react';

interface FeatureManagerProps {
  features: string[];
  onChange: (features: string[]) => void;
}

const COMMON_PRESETS = [
  'Automatic',
  'Alloy Wheels',
  'Leather Interior',
  'Reverse Camera',
  'Sunroof',
  'Original Paint',
  'Foreign Used',
  'Extremely Clean',
  'Push Start',
  'Air Conditioning',
  'Keyless Entry',
  'Parking Sensors',
  'Navigation System',
];

export function FeatureManager({ features, onChange }: FeatureManagerProps) {
  const [newFeatureText, setNewFeatureText] = useState('');

  const handleAddFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    if (!features.includes(trimmed)) {
      onChange([...features, trimmed]);
    }
    setNewFeatureText('');
  };

  const handleTogglePreset = (preset: string) => {
    if (features.includes(preset)) {
      onChange(features.filter((f) => f !== preset));
    } else {
      onChange([...features, preset]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleEditInline = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...features];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === features.length - 1) return;
    const updated = [...features];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <span>✨ Vehicle Features & Options</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] text-red-400">
            {features.length} added
          </span>
        </label>
      </div>

      {/* Quick Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-zinc-400 font-medium">Quick Add Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PRESETS.map((preset) => {
            const isSelected = features.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleTogglePreset(preset)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input box to add custom feature */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newFeatureText}
          onChange={(e) => setNewFeatureText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddFeature();
            }
          }}
          placeholder="e.g. 360 Degree Camera, Cruise Control..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 transition"
        />
        <button
          type="button"
          onClick={handleAddFeature}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-1"
        >
          <span>+</span>
          <span>Add Feature</span>
        </button>
      </div>

      {/* Features List with Reordering & Inline Editing */}
      {features.length === 0 ? (
        <p className="text-xs text-zinc-500 italic py-2">
          No features added yet. Click a preset above or type a custom feature.
        </p>
      ) : (
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition group"
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  className="text-[10px] text-zinc-500 hover:text-white disabled:opacity-20 px-1"
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={index === features.length - 1}
                  onClick={() => handleMoveDown(index)}
                  className="text-[10px] text-zinc-500 hover:text-white disabled:opacity-20 px-1"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>

              <input
                type="text"
                value={feature}
                onChange={(e) => handleEditInline(index, e.target.value)}
                className="flex-1 bg-transparent text-sm text-white focus:outline-none focus:bg-zinc-950 px-2 py-1 rounded border border-transparent focus:border-zinc-700"
              />

              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="w-7 h-7 rounded-lg bg-zinc-800/60 hover:bg-red-950 hover:text-red-300 text-zinc-400 flex items-center justify-center text-xs font-bold transition"
                title="Remove Feature"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
