import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Product, Role } from '../types';
import BraidFilters from './BraidFilters';
import { BraidFilterState, emptyBraidFilters, filterBraidProducts, getBraidStyle } from '../utils/braidFilters';

interface BraidsPanelProps {
  products: Product[];
  role: Role;
  onRecordSale: (product: Product) => void;
  onAddBraid?: () => void;
  inStockOnly?: boolean;
  title?: string;
}

export default function BraidsPanel({
  products,
  role,
  onRecordSale,
  onAddBraid,
  inStockOnly = false,
  title = 'Braids Catalog',
}: BraidsPanelProps) {
  const [filters, setFilters] = useState<BraidFilterState>(emptyBraidFilters);

  const filtered = useMemo(
    () => filterBraidProducts(products, filters, { inStockOnly }),
    [products, filters, inStockOnly]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Filter by brand, style, length, or color number
          </p>
        </div>
        {onAddBraid && (
          <button
            onClick={onAddBraid}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 shadow-lg shadow-pink-200/50"
          >
            <Plus size={18} /> Add Braid
          </button>
        )}
      </div>

      <BraidFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-pink-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative bg-gray-50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-white/90 text-[10px] font-bold px-2 py-1 rounded-full">
                {product.brand}
              </span>
              {product.stockQuantity <= 0 && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Out of stock</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h4>
              <div className="flex flex-wrap gap-1 mt-2">
                {getBraidStyle(product) && (
                  <span className="text-[9px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                    {getBraidStyle(product)}
                  </span>
                )}
                {product.braidLength && (
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {product.braidLength}
                  </span>
                )}
                {product.colorNumber && (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    #{product.colorNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-lg font-black text-pink-600">KSh {product.sellingPrice}</p>
                  {role === 'admin' && (
                    <p className="text-[10px] text-gray-400">Cost: KSh {product.lastPrice}</p>
                  )}
                  <p className="text-[10px] text-gray-400">{product.stockQuantity} in stock</p>
                </div>
                <button
                  disabled={product.stockQuantity === 0}
                  onClick={() => onRecordSale(product)}
                  className="p-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-40 transition-all"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-pink-100">
          <p className="text-4xl mb-3">🎀</p>
          <p className="font-bold text-gray-700">No braids match your filters</p>
          <button
            onClick={() => setFilters(emptyBraidFilters())}
            className="mt-3 text-rose-600 text-sm font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </motion.div>
  );
}
