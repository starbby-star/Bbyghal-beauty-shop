import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Heart, Star } from 'lucide-react';
import { PublicProduct } from '../utils/productPublic';
import BraidFilters from './BraidFilters';
import { BraidFilterState, emptyBraidFilters, filterBraidProducts, getBraidStyle } from '../utils/braidFilters';

interface BraidsShopSectionProps {
  products: PublicProduct[];
  addToCart: (product: PublicProduct) => void;
  onProductClick: (product: PublicProduct) => void;
  wishlist: string[];
  onToggleWishlist: (product: PublicProduct, e: React.MouseEvent) => void;
}

export default function BraidsShopSection({
  products,
  addToCart,
  onProductClick,
  wishlist,
  onToggleWishlist,
}: BraidsShopSectionProps) {
  const [filters, setFilters] = useState<BraidFilterState>(emptyBraidFilters);

  const filtered = useMemo(
    () => filterBraidProducts(products, filters, { inStockOnly: true }),
    [products, filters]
  );

  return (
    <section id="braids" className="scroll-mt-28 py-12 border-t border-[var(--sf-accent-muted)]">
      <div className="mb-8">
        <div className="sf-section-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
          🎀 Braids Collection
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
          Find your perfect braid
        </h2>
        <p className="text-gray-600 max-w-xl">
          Browse by brand, style, length, or color number — Jibambe, Havana, X-Pression & more.
        </p>
      </div>

      <BraidFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-8">
        {filtered.map((product, i) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className="group bg-white rounded-2xl overflow-hidden border border-pink-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div
              className="aspect-[4/5] relative overflow-hidden bg-gray-50 cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-bold px-2 py-1 rounded-full">
                {product.brand}
              </span>
              <button
                onClick={(e) => onToggleWishlist(product, e)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
              >
                <Heart size={14} className={wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} />
              </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{product.brand}</p>
              <h3
                className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 cursor-pointer hover:text-rose-600"
                onClick={() => onProductClick(product)}
              >
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-1 mb-2">
                {getBraidStyle(product) && (
                  <span className="text-[9px] font-bold bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded">
                    {getBraidStyle(product)}
                  </span>
                )}
                {product.braidLength && (
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                    {product.braidLength}
                  </span>
                )}
                {product.colorNumber && (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                    #{product.colorNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={10} className={j < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                ))}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-base font-black text-gray-900">KSh {product.sellingPrice.toLocaleString()}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="sf-btn-primary w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 mt-4 bg-white rounded-2xl border border-pink-100">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-bold text-gray-700">No braids match your search</p>
          <button onClick={() => setFilters(emptyBraidFilters())} className="mt-3 text-rose-600 text-sm font-bold hover:underline">
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}
