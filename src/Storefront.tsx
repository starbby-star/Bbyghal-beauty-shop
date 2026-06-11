import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Search, X, Plus, Minus, ShoppingCart, CheckCircle2,
  MapPin, Truck, Phone, MessageCircle, Heart, Sparkles, Star, ArrowRight,
} from 'lucide-react';
import { Product, CartItem, PaymentMethod, Category } from './types';
import { CATEGORIES } from './constants';
import BraidsShopSection from './components/BraidsShopSection';
import { getBraidStyle } from './utils/braidFilters';

const LogoImage = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const [error, setError] = React.useState(false);
  const sizes = { sm: 'w-9 h-9', md: 'w-11 h-11', lg: 'w-14 h-14' };
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden rounded-2xl shadow-lg ${sizes[size]}`}>
      {!error ? (
        <img src="/logo.jpg" alt="Babyghal" className="w-full h-full object-contain" onError={() => setError(true)} />
      ) : (
        <span className="text-[#d4af37] font-display italic text-xl font-bold">B</span>
      )}
    </div>
  );
};

interface StorefrontProps {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  cartTotalItems: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  checkoutCustomerName: string;
  setCheckoutCustomerName: (name: string) => void;
  checkoutCustomerPhone: string;
  setCheckoutCustomerPhone: (phone: string) => void;
  checkoutPaymentMethod: PaymentMethod;
  setCheckoutPaymentMethod: (method: PaymentMethod) => void;
  handleCheckout: () => void;
  onAdminLoginClick: () => void;
}

const CATEGORY_ICONS: Partial<Record<Category, string>> = {
  All: '✨', Hair: '💇', Braids: '🎀', Skincare: '🧴', Makeup: '💄',
  Facial: '🌸', Perfumes: '🌺', Soaps: '🫧', Nails: '💅', Body: '🛁',
  Accessories: '👜', Other: '🛍️',
};

export default function Storefront({
  products, cart, addToCart, removeFromCart, updateCartQuantity,
  cartTotalItems, cartSubtotal, cartDiscount, cartTotal,
  isCartOpen, setIsCartOpen,
  checkoutCustomerName, setCheckoutCustomerName,
  checkoutCustomerPhone, setCheckoutCustomerPhone,
  checkoutPaymentMethod, setCheckoutPaymentMethod,
  handleCheckout, onAdminLoginClick,
}: StorefrontProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<Category>('All');
  const [location, setLocation] = React.useState('');
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [showWishlist, setShowWishlist] = React.useState(false);

  const toggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const shopCategories = CATEGORIES.filter((c) => c !== 'Braids');

  const filteredProducts = products
    .filter((p) => {
      if (p.category === 'Braids') return false;
      if (showWishlist && !wishlist.includes(p.id)) return false;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.stockQuantity > 0;
    })
    .sort((a, b) => {
      const dateA = a.createdAt.split('T')[0];
      const dateB = b.createdAt.split('T')[0];
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return a.name.localeCompare(b.name);
    });

  const featuredProducts = products.filter((p) => p.stockQuantity > 0).slice(0, 4);

  const processWhatsAppCheckout = () => {
    if (!checkoutCustomerName || !checkoutCustomerPhone || !location || !deliveryDate) {
      alert('Please fill in all checkout details (Name, Phone, Location, Delivery Date)');
      return;
    }
    const orderNumber = `BB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    let orderText = `Hello Babyghal! 💖 I'd like to place an order:\n\n`;
    orderText += `*Order Number:* ${orderNumber}\n*Name:* ${checkoutCustomerName}\n*Phone:* ${checkoutCustomerPhone}\n`;
    orderText += `*Location:* ${location}\n*Delivery Date:* ${deliveryDate}\n\n*Order Details:*\n`;
    cart.forEach((item) => {
      orderText += `- ${item.quantity}x ${item.product.name} (KSh ${item.product.sellingPrice * item.quantity})\n`;
    });
    orderText += `\n*Subtotal:* KSh ${cartSubtotal}\n`;
    if (cartDiscount > 0) orderText += `*Surprise Discount:* -KSh ${cartDiscount}\n`;
    orderText += `*Total:* KSh ${cartTotal}\n*Payment Method:* ${checkoutPaymentMethod}\n`;
    window.open(`https://wa.me/254752520441?text=${encodeURIComponent(orderText)}`, '_blank');
    handleCheckout();
  };

  const scrollToShop = () => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToBraids = () => document.getElementById('braids')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen storefront-gradient flex flex-col font-sans text-gray-800">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-pink-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoImage />
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900 leading-none tracking-tight">Babyghal</h1>
              <p className="text-[11px] text-rose-500 font-medium tracking-[0.2em] uppercase">Beauty Shop</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button onClick={scrollToShop} className="hover:text-rose-600 transition-colors">Shop</button>
            <button onClick={scrollToBraids} className="hover:text-rose-600 transition-colors">Braids</button>
            <a href="#about" className="hover:text-rose-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-rose-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onAdminLoginClick}
              className="hidden sm:block text-xs font-semibold text-gray-500 hover:text-rose-600 px-3 py-2 rounded-full hover:bg-rose-50 transition-all"
            >
              Staff
            </button>
            <button
              onClick={() => { setShowWishlist(!showWishlist); if (!showWishlist) scrollToShop(); }}
              className={`relative p-2.5 rounded-full transition-all ${showWishlist ? 'bg-rose-500 text-white shadow-lg shadow-rose-300/40' : 'bg-white text-rose-500 border border-pink-100 hover:border-rose-200'}`}
            >
              <Heart size={20} className={showWishlist ? 'fill-white' : ''} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
            >
              <ShoppingCart size={20} />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-amber-100/30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-100 rounded-full px-4 py-1.5 text-xs font-semibold text-rose-600 mb-6 shadow-sm">
                <Sparkles size={14} />
                Kenya&apos;s glow-up destination
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1] mb-5">
                We glow<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-400">in & out</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
                Premium wigs, skincare, braids & beauty must-haves — delivered countrywide. Shop. Slay. Repeat.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={scrollToShop}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/15 active:scale-95"
                >
                  Shop Now <ArrowRight size={18} />
                </button>
                <a
                  href="https://wa.me/254752520441"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-full font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Featured strip */}
            {featuredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="hidden lg:grid grid-cols-2 gap-3"
              >
                {featuredProducts.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`group relative rounded-2xl overflow-hidden bg-white shadow-lg border border-pink-50 hover:shadow-xl transition-all ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                  >
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{p.brand}</p>
                      <p className="text-white font-bold text-sm line-clamp-1">{p.name}</p>
                      <p className="text-rose-300 font-black text-sm">KSh {p.sellingPrice}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Shop */}
      <main id="shop" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        {/* Search + categories */}
        <div className="sticky top-16 sm:top-[72px] z-30 bg-cream/90 backdrop-blur-lg py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-2xl mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search wigs, skincare, braids..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-pink-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-300 focus:border-rose-200 outline-none shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {shopCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-pink-100 hover:border-rose-200 hover:text-rose-600'
                }`}
              >
                <span>{CATEGORY_ICONS[category]}</span>
                {category}
              </button>
            ))}
          </div>
        </div>

        {showWishlist && (
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Heart size={16} className="text-rose-500 fill-rose-500" />
            <span className="font-semibold text-gray-700">Showing wishlist ({wishlist.length})</span>
            <button onClick={() => setShowWishlist(false)} className="text-rose-500 font-medium hover:underline ml-2">View all</button>
          </div>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product, i) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="group bg-white rounded-2xl overflow-hidden border border-pink-50/80 shadow-sm hover:shadow-xl hover:shadow-rose-100/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-gray-50 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold text-gray-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
                <button
                  onClick={(e) => toggleWishlist(product, e)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                  <Heart size={15} className={wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-2 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSelectedProduct(product)}>
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={11} className={j < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-base font-black text-gray-900">KSh {product.sellingPrice.toLocaleString()}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag className="mx-auto text-pink-200 mb-4" size={48} />
            <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
              {showWishlist ? 'Your wishlist is empty' : 'No products found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {showWishlist ? 'Save items you love with the heart icon.' : 'Try a different search or category.'}
            </p>
            {showWishlist && (
              <button onClick={() => setShowWishlist(false)} className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm">
                Browse Shop
              </button>
            )}
          </div>
        )}

        <BraidsShopSection
          products={products}
          addToCart={addToCart}
          onProductClick={setSelectedProduct}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
        />

        {/* About + Contact */}
        <div id="about" className="grid md:grid-cols-2 gap-6 mt-20 scroll-mt-24">
          <div className="bg-white rounded-3xl p-8 border border-pink-50 shadow-sm">
            <h3 className="text-2xl font-display font-bold mb-4">About Babyghal</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Your ultimate beauty destination — premium wigs, flawless skincare, and everyday glow-up essentials. Based in Mururui with countrywide delivery.
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3"><MapPin className="text-rose-500 shrink-0" size={18} /> Mururui, Kenya</li>
              <li className="flex items-center gap-3"><Truck className="text-rose-500 shrink-0" size={18} /> Countrywide deliveries</li>
              <li className="flex items-center gap-3"><Phone className="text-rose-500 shrink-0" size={18} /> <strong>0752520441</strong></li>
            </ul>
          </div>
          <div id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl scroll-mt-24">
            <h3 className="text-2xl font-display font-bold mb-3">Get in touch</h3>
            <p className="text-gray-300 text-sm mb-6">Order via WhatsApp for the fastest response. M-Pesa accepted.</p>
            <a
              href="https://wa.me/254752520441"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100/60 py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Babyghal Beauty Shop</p>
        </div>
      </footer>

      {/* Product modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col sm:flex-row"
            >
              <div className="sm:w-1/2 aspect-square sm:aspect-auto relative bg-gray-50 shrink-0">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer" />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm sm:hidden">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{selectedProduct.brand}</p>
                    <h2 className="text-2xl font-display font-bold text-gray-900 mt-1">{selectedProduct.name}</h2>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="hidden sm:flex w-9 h-9 bg-gray-100 rounded-full items-center justify-center hover:bg-gray-200">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-3xl font-black text-gray-900 mb-4">KSh {selectedProduct.sellingPrice.toLocaleString()}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {selectedProduct.fullDescription || selectedProduct.shortDescription || 'Premium beauty product from the Babyghal collection.'}
                </p>
                {selectedProduct.category === 'Braids' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getBraidStyle(selectedProduct) && (
                      <span className="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full">{getBraidStyle(selectedProduct)}</span>
                    )}
                    {selectedProduct.braidLength && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{selectedProduct.braidLength}</span>
                    )}
                    {selectedProduct.colorNumber && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Color #{selectedProduct.colorNumber}</span>
                    )}
                  </div>
                )}
                {selectedProduct.bestUsedBy && (
                  <div className="mb-3"><span className="text-xs font-bold text-gray-500 uppercase">Best for</span><p className="text-sm text-gray-700">{selectedProduct.bestUsedBy}</p></div>
                )}
                <button
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setIsCartOpen(true); }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors mt-4"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-5 border-b border-pink-50 flex items-center justify-between">
                <h2 className="text-lg font-display font-bold">Your Bag ({cartTotalItems})</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-pink-50 rounded-full"><X size={22} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <ShoppingCart size={48} className="text-pink-200" />
                    <p className="font-bold text-gray-700">Your bag is empty</p>
                    <button onClick={() => setIsCartOpen(false)} className="text-rose-600 font-semibold text-sm">Continue shopping</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3 p-3 bg-pink-50/50 rounded-2xl">
                        <img src={item.product.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.product.name}</p>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 hover:text-red-500 shrink-0"><X size={16} /></button>
                          </div>
                          <p className="text-xs text-rose-500 font-semibold">{item.product.brand}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-black text-sm">KSh {item.product.sellingPrice}</p>
                            <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-pink-100">
                              <button onClick={() => updateCartQuantity(item.product.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-pink-50"><Minus size={14} /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.product.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-pink-50"><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-white border border-pink-100 rounded-2xl p-4 space-y-3 mt-6">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery details</p>
                      {[
                        { label: 'Name', value: checkoutCustomerName, set: setCheckoutCustomerName, type: 'text', placeholder: 'Jane Doe' },
                        { label: 'Phone', value: checkoutCustomerPhone, set: setCheckoutCustomerPhone, type: 'tel', placeholder: '0712345678' },
                        { label: 'Location', value: location, set: setLocation, type: 'text', placeholder: 'Nairobi CBD' },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">{f.label}</label>
                          <input type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder}
                            className="w-full mt-1 px-3 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200" />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Delivery date</label>
                        <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full mt-1 px-3 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-pink-50 bg-white">
                  <div className="flex justify-between mb-1 text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold">KSh {cartSubtotal}</span></div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 mb-1">
                      <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Discount</span>
                      <span className="font-bold">-KSh {cartDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t border-pink-100 mb-4">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-black text-gray-900">KSh {cartTotal}</span>
                  </div>
                  <button onClick={processWhatsAppCheckout}
                    className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                    <MessageCircle size={20} /> Order via WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
