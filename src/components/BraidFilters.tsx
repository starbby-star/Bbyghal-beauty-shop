import React from 'react';
import { Search, X, Scissors, Ruler, Palette, Tag } from 'lucide-react';
import { BRAID_BRANDS, BRAID_STYLES, BRAID_LENGTHS } from '../constants/braids';
import { BraidFilterState, emptyBraidFilters, hasActiveBraidFilters } from '../utils/braidFilters';

interface BraidFiltersProps {
  filters: BraidFilterState;
  onChange: (filters: BraidFilterState) => void;
  resultCount?: number;
  compact?: boolean;
}

export default function BraidFilters({ filters, onChange, resultCount, compact = false }: BraidFiltersProps) {
  const set = (patch: Partial<BraidFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className={`bg-white rounded-2xl border border-pink-100 shadow-sm ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className={`font-black text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>
            🎀 Braid Filters
          </h3>
          {!compact && (
            <p className="text-xs text-gray-500 mt-0.5">
              Search by name, brand, or color · filter by style & length
            </p>
          )}
        </div>
        {hasActiveBraidFilters(filters) && (
          <button
            onClick={() => onChange(emptyBraidFilters())}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-full bg-rose-50"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="🔍 Search name, brand, or color number..."
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 bg-pink-50/60 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Brand */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
            <Tag size={11} /> Brand
          </label>
          <select
            value={filters.brand}
            onChange={(e) => set({ brand: e.target.value, customBrand: e.target.value === '__custom__' ? filters.customBrand : '' })}
            className="w-full px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All brands</option>
            {BRAID_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
            <option value="__custom__">+ Custom brand</option>
          </select>
          {filters.brand === '__custom__' && (
            <input
              type="text"
              placeholder="Enter brand name..."
              value={filters.customBrand}
              onChange={(e) => set({ customBrand: e.target.value })}
              className="w-full mt-2 px-3 py-2 bg-white border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
            />
          )}
        </div>

        {/* Style */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
            <Scissors size={11} /> Style
          </label>
          <select
            value={filters.style}
            onChange={(e) => set({ style: e.target.value, customStyle: e.target.value === '__custom__' ? filters.customStyle : '' })}
            className="w-full px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All styles</option>
            {BRAID_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom__">+ Custom style</option>
          </select>
          {filters.style === '__custom__' && (
            <input
              type="text"
              placeholder="Enter style..."
              value={filters.customStyle}
              onChange={(e) => set({ customStyle: e.target.value })}
              className="w-full mt-2 px-3 py-2 bg-white border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
            />
          )}
        </div>

        {/* Length */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
            <Ruler size={11} /> Length
          </label>
          <select
            value={filters.length}
            onChange={(e) => set({ length: e.target.value })}
            className="w-full px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All lengths</option>
            {BRAID_LENGTHS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Color number */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
            <Palette size={11} /> Color #
          </label>
          <input
            type="text"
            placeholder='e.g. 27, 900, 1/900'
            value={filters.colorNumber}
            onChange={(e) => set({ colorNumber: e.target.value })}
            className="w-full px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
      </div>

      {resultCount !== undefined && (
        <p className="text-xs text-gray-400 mt-3 font-medium">
          {resultCount} braid{resultCount === 1 ? '' : 's'} found
        </p>
      )}
    </div>
  );
}

/** Braid detail inputs for add/edit product forms */
export function BraidDetailFields({
  brand,
  setBrand,
  braidStyle,
  setBraidStyle,
  braidLength,
  setBraidLength,
  colorNumber,
  setColorNumber,
  customBrand,
  setCustomBrand,
  customStyle,
  setCustomStyle,
  brandSelect,
  setBrandSelect,
  styleSelect,
  setStyleSelect,
  inputClass,
}: {
  brand: string;
  setBrand: (v: string) => void;
  braidStyle: string;
  setBraidStyle: (v: string) => void;
  braidLength: string;
  setBraidLength: (v: string) => void;
  colorNumber: string;
  setColorNumber: (v: string) => void;
  customBrand: string;
  setCustomBrand: (v: string) => void;
  customStyle: string;
  setCustomStyle: (v: string) => void;
  brandSelect: string;
  setBrandSelect: (v: string) => void;
  styleSelect: string;
  setStyleSelect: (v: string) => void;
  inputClass: string;
}) {
  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-pink-50 to-rose-50/50 rounded-2xl border border-pink-100">
      <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Braid Details</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">🏷️ Brand</label>
          <select
            value={brandSelect}
            onChange={(e) => {
              setBrandSelect(e.target.value);
              if (e.target.value !== '__custom__') setBrand(e.target.value);
            }}
            className={inputClass}
          >
            <option value="">Select brand...</option>
            {BRAID_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
            <option value="__custom__">+ Custom</option>
          </select>
          {brandSelect === '__custom__' && (
            <input
              type="text"
              value={customBrand}
              onChange={(e) => { setCustomBrand(e.target.value); setBrand(e.target.value); }}
              placeholder="Custom brand"
              className={`${inputClass} mt-2`}
            />
          )}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">✂️ Style</label>
          <select
            value={styleSelect}
            onChange={(e) => {
              setStyleSelect(e.target.value);
              if (e.target.value !== '__custom__') setBraidStyle(e.target.value);
            }}
            className={inputClass}
          >
            <option value="">Select style...</option>
            {BRAID_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom__">+ Custom</option>
          </select>
          {styleSelect === '__custom__' && (
            <input
              type="text"
              value={customStyle}
              onChange={(e) => { setCustomStyle(e.target.value); setBraidStyle(e.target.value); }}
              placeholder="Custom style"
              className={`${inputClass} mt-2`}
            />
          )}
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">📏 Length</label>
          <select value={braidLength} onChange={(e) => setBraidLength(e.target.value)} className={inputClass}>
            <option value="">Select length...</option>
            {BRAID_LENGTHS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">🎨 Color #</label>
          <input
            type="text"
            value={colorNumber}
            onChange={(e) => setColorNumber(e.target.value)}
            placeholder="27, 900, 1/900..."
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
