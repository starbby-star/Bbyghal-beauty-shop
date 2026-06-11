import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, Flame, Sparkles, Star, Truck, Tag, ShoppingBag,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { BRAND, StorePage } from '../../constants/brand';
import { HOME_TRUST_BADGES } from '../../constants/home';
import { LOW_STOCK_THRESHOLD } from '../../utils/inventory';
import ProductSlideshow from './ProductSlideshow';
import ConnectButton from './ConnectButton';

interface HomePageProps {
  products: Product[];
  onNavigate: (page: StorePage, category?: Category) => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const CATEGORY_QUICK: { cat: Category; emoji: string; label: string }[] = [
  { cat: 'Hair', emoji: '💇', label: 'Wigs & Hair' },
  { cat: 'Skincare', emoji: '🧴', label: 'Skincare' },
  { cat: 'Makeup', emoji: '💄', label: 'Makeup' },
  { cat: 'Perfumes', emoji: '🌺', label: 'Perfumes' },
];

export default function HomePage({
  products,
  onNavigate,
  onProductClick,
  onAddToCart,
}: HomePageProps) {
  const inStock = products.filter((p) => p.stockQuantity > 0);

  const sellOuts = inStock
    .filter((p) => p.stockQuantity <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 8);

  const newArrivals = [...inStock]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const braidCount = inStock.filter((p) => p.category === 'Braids').length;

  return (
    <>
      {/* Hero with product slideshow background */}
      <section className="relative min-h-[85vh] sm:min-h-[78vh] text-white overflow-hidden">
        <ProductSlideshow products={inStock} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 min-h-[85vh] sm:min-h-[78vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/40 rounded-full px-4 py-1.5 text-xs font-bold text-pink-300 mb-5">
              <Sparkles size={14} /> {BRAND.tagline}
            </div>

            <h2 className="text-4xl sm:text-6xl font-display font-bold mb-4 leading-tight">
              {BRAND.systemName}
            </h2>
            <p className="text-lg text-gray-300 mb-2">{BRAND.shopName}</p>
            <p className="text-gray-400 mb-8 max-w-lg leading-relaxed">
              Premium wigs, skincare & beauty essentials. Glow in and out — delivered countrywide across Kenya.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => onNavigate('shop')}
                className="inline-flex items-center gap-2 bg-pink-500 text-white px-7 py-3.5 rounded-full font-bold hover:bg-pink-400 shadow-lg shadow-pink-500/30 transition-all"
              >
                Shop now <ArrowRight size={18} />
              </button>
              <button
                onClick={() => onNavigate('braids')}
                className="px-7 py-3.5 rounded-full font-bold border border-white/25 hover:bg-white/10 transition-all"
              >
                🎀 Braids {braidCount > 0 && `(${braidCount})`}
              </button>
              <ConnectButton className="bg-white text-black hover:bg-gray-100" />
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              {HOME_TRUST_BADGES.map((badge) => (
                <span key={badge.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>{badge.emoji}</span> {badge.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bundle offer strip */}
      <section className="bg-black text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                <Tag className="text-pink-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Bundle & save</p>
                <p className="text-xs text-gray-400">2 items −KSh 10 · 3+ items −KSh 20</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                <Truck className="text-pink-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Countrywide delivery</p>
                <p className="text-xs text-gray-400">From {BRAND.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                <Flame className="text-pink-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{sellOuts.length} sell-outs live</p>
                <p className="text-xs text-gray-400">Limited stock — shop before they're gone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category quick links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Shop by category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORY_QUICK.map((item) => (
            <button
              key={item.cat}
              onClick={() => onNavigate('shop', item.cat)}
              className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-pink-300 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
            >
              <span className="text-2xl mb-2 block">{item.emoji}</span>
              <p className="font-bold text-gray-800 text-sm group-hover:text-pink-600">{item.label}</p>
            </button>
          ))}
          <button
            onClick={() => onNavigate('braids')}
            className="group p-5 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
          >
            <span className="text-2xl mb-2 block">🎀</span>
            <p className="font-bold text-sm">Braids</p>
            <p className="text-xs text-pink-100 mt-0.5">Filter by brand & style</p>
          </button>
        </div>
      </section>

      {/* Sell-outs */}
      {sellOuts.length > 0 && (
        <section className="bg-gradient-to-b from-rose-50 to-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-xs font-bold mb-3">
                  <Flame size={14} /> Sell-outs
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                  Selling fast — limited stock
                </h3>
                <p className="text-gray-500 text-sm mt-1">Grab these before they're gone</p>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-pink-600 hover:text-pink-500 shrink-0"
              >
                View all <ArrowRight size={16} />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {sellOuts.map((product, i) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="shrink-0 w-44 sm:w-52 bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div
                    className="aspect-[4/5] relative cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Only {product.stockQuantity} left
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-pink-500 uppercase">{product.brand}</p>
                    <h4
                      className="font-bold text-xs line-clamp-2 mb-2 cursor-pointer hover:text-pink-600"
                      onClick={() => onProductClick(product)}
                    >
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm">KSh {product.sellingPrice.toLocaleString()}</p>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:bg-pink-500 text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">New arrivals</h3>
              <p className="text-gray-500 text-sm mt-1">Fresh picks just added</p>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="flex items-center gap-1 text-sm font-bold text-pink-600 hover:text-pink-500"
            >
              Shop all <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {newArrivals.map((product, i) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className="aspect-[4/5] relative cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-pink-500 uppercase">{product.brand}</p>
                  <h4
                    className="font-bold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-pink-600"
                    onClick={() => onProductClick(product)}
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={10}
                        className={j < Math.floor(product.rating || 5) ? 'fill-pink-400 text-pink-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-black">KSh {product.sellingPrice.toLocaleString()}</p>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center hover:bg-pink-500"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* Motto CTA */}
      <section className="bg-black text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-pink-400 font-bold text-sm mb-3">{BRAND.tagline}</p>
          <h3 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            &ldquo;{BRAND.motto}&rdquo; ✨
          </h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            {BRAND.systemName} is where beauty blossoms, confidence shines, and every glow tells a story.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('about')}
              className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 font-semibold text-sm"
            >
              Our story
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-3 rounded-full bg-pink-500 hover:bg-pink-400 font-bold text-sm"
            >
              Start shopping
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
