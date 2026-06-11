import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Search, X, Plus, Minus, ShoppingCart,
  Heart, Sparkles, Star,
} from 'lucide-react';
import { Product, CartItem, PaymentMethod, Category, Member, HomePromoConfig } from './types';
import { CATEGORIES } from './constants';
import { BRAND, StorePage } from './constants/brand';
import BraidsShopSection from './components/BraidsShopSection';
import WelcomeChat from './components/storefront/WelcomeChat';
import AboutPage from './components/storefront/AboutPage';
import ContactPage from './components/storefront/ContactPage';
import ConnectButton from './components/storefront/ConnectButton';
import OfferBanner from './components/storefront/OfferBanner';
import HomePage from './components/storefront/HomePage';
import HomeChatbot from './components/storefront/HomeChatbot';
import GlowTipPopup from './components/storefront/GlowTipPopup';
import PromoPrice from './components/storefront/PromoPrice';
import { getActiveTheme, getActiveGlowTip, getEffectivePrice } from './utils/homePromos';
import { getBraidStyle } from './utils/braidFilters';
import { generateOrderNumber, openWhatsAppOrder } from './utils/whatsapp';
import { WhatsAppCheckoutDetails } from './types';
import { getReturningMember, saveMember } from './utils/members';
import { generateReceiptPdf, shareReceiptPdf } from './utils/receiptPdf';

const LogoImage = () => {
  const [error, setError] = React.useState(false);
  return (
    <div className="w-11 h-11 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden rounded-2xl shadow-lg">
      {!error ? (
        <img src="/logo.jpg" alt="BLUMERA" className="w-full h-full object-contain" onError={() => setError(true)} />
      ) : (
        <span className="text-pink-500 font-display font-black text-xl">B</span>
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
  handleCheckout: (details?: WhatsAppCheckoutDetails) => void;
  onAdminLoginClick: () => void;
  homePromoConfig: HomePromoConfig;
  promoSubtotal: number;
  promoSavings: number;
}

const CATEGORY_ICONS: Partial<Record<Category, string>> = {
  All: '✨', Hair: '💇', Skincare: '🧴', Makeup: '💄',
  Facial: '🌸', Perfumes: '🌺', Soaps: '🫧', Nails: '💅', Body: '🛁',
  Accessories: '👜', Other: '🛍️',
};

const NAV: { id: StorePage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'braids', label: 'Braids' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export default function Storefront({
  products, cart, addToCart, removeFromCart, updateCartQuantity,
  cartTotalItems, cartSubtotal, cartDiscount, cartTotal,
  isCartOpen, setIsCartOpen,
  checkoutCustomerName, setCheckoutCustomerName,
  checkoutCustomerPhone, setCheckoutCustomerPhone,
  checkoutPaymentMethod, setCheckoutPaymentMethod,
  handleCheckout, onAdminLoginClick,
  homePromoConfig, promoSubtotal, promoSavings,
}: StorefrontProps) {
  const activeTheme = getActiveTheme(homePromoConfig);
  const glowTip = getActiveGlowTip(homePromoConfig);
  const [activePage, setActivePage] = React.useState<StorePage>('home');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<Category>('All');
  const [location, setLocation] = React.useState('');
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [showWishlist, setShowWishlist] = React.useState(false);
  const [member, setMember] = React.useState<Member | null>(null);
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  React.useEffect(() => {
    const returning = getReturningMember();
    if (returning) {
      setMember(returning);
      setCheckoutCustomerName(returning.name);
      setCheckoutCustomerPhone(returning.phone.replace(/^254/, '0'));
      if (returning.location) setLocation(returning.location);
      setShowWelcome(true);
    }
  }, [setCheckoutCustomerName, setCheckoutCustomerPhone]);

  React.useEffect(() => {
    if (activePage === 'home') setShowWelcome(false);
  }, [activePage]);

  const navigate = (page: StorePage, category?: Category) => {
    setActivePage(page);
    if (category) setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addPackageToCart = (productIds: string[]) => {
    productIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) addToCart(product);
    });
    setIsCartOpen(true);
  };

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
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));

  const processWhatsAppCheckout = async () => {
    if (!checkoutCustomerName?.trim() || !checkoutCustomerPhone?.trim() || !location?.trim() || !deliveryDate) {
      alert('Please fill in all checkout details (Name, Phone, Location, Delivery Date)');
      return;
    }
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const details: WhatsAppCheckoutDetails = {
        orderNumber,
        customerName: checkoutCustomerName.trim(),
        customerPhone: checkoutCustomerPhone.trim(),
        location: location.trim(),
        deliveryDate,
        paymentMethod: checkoutPaymentMethod,
      };

      const receiptInput = {
        ...details,
        cart,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        total: cartTotal,
      };

      const pdfBlob = generateReceiptPdf(receiptInput);
      await shareReceiptPdf(pdfBlob, orderNumber);

      const saved = saveMember({
        name: details.customerName,
        phone: details.customerPhone,
        location: details.location,
        orderNumber,
      });
      setMember(saved);

      openWhatsAppOrder(receiptInput);
      handleCheckout(details);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-gray-50 cursor-pointer" onClick={() => setSelectedProduct(product)}>
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">{product.category}</span>
        <button onClick={(e) => toggleWishlist(product, e)} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Heart size={15} className={wishlist.includes(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-400'} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">{product.brand}</p>
        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 cursor-pointer hover:text-pink-600" onClick={() => setSelectedProduct(product)}>{product.name}</h3>
        <div className="flex items-center gap-0.5 mb-3">
          {[...Array(5)].map((_, j) => (
            <Star key={j} size={11} className={j < Math.floor(product.rating || 5) ? 'fill-pink-400 text-pink-400' : 'text-gray-200'} />
          ))}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <PromoPrice price={getEffectivePrice(product, homePromoConfig)} size="sm" />
          <button onClick={() => addToCart(product)} className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center hover:bg-pink-500 transition-colors">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );

  return (
    <div className={`min-h-screen storefront-gradient flex flex-col font-sans text-gray-800 theme-${activeTheme}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        activeTheme === 'pink-thursday'
          ? 'bg-gradient-to-r from-black via-pink-950/95 to-amber-950/90 border-amber-500/20'
          : activeTheme === 'sellout-day'
          ? 'bg-gradient-to-r from-amber-950/95 via-black to-black border-amber-400/20'
          : 'bg-black/95 border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <button onClick={() => navigate('home')} className="flex items-center gap-3 text-left">
            <LogoImage />
            <div>
              <h1 className="text-xl font-display font-bold text-white leading-none">{BRAND.systemName}</h1>
              <p className="text-[10px] text-pink-500 font-bold">{BRAND.tagline}</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activePage === item.id ? 'bg-pink-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onAdminLoginClick} className="hidden sm:block text-xs text-gray-400 hover:text-pink-400 px-3 py-2">Staff</button>
            <button onClick={() => { setShowWishlist(!showWishlist); navigate('shop'); }} className="p-2.5 rounded-full bg-white/10 text-white border border-white/20">
              <Heart size={18} className={showWishlist ? 'fill-pink-500 text-pink-500' : ''} />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-pink-500 text-white rounded-full">
              <ShoppingCart size={18} />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-pink-600 text-[9px] font-bold rounded-full flex items-center justify-center">{cartTotalItems}</span>
              )}
            </button>
          </div>
        </div>

        <nav className="md:hidden flex gap-1 overflow-x-auto hide-scrollbar px-4 pb-3">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${activePage === item.id ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-300'}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <GlowTipPopup tip={glowTip} theme={activeTheme} />
      <OfferBanner onNavigate={(page) => navigate(page)} homePromoConfig={homePromoConfig} />

      {activePage === 'home' && (
        <HomePage
          products={products}
          homePromoConfig={homePromoConfig}
          onNavigate={navigate}
          onProductClick={setSelectedProduct}
          onAddToCart={addToCart}
          onAddPackage={addPackageToCart}
        />
      )}

      {activePage === 'shop' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <h2 className="text-3xl font-display font-bold mb-2">Shop</h2>
          <p className="text-gray-500 mb-8">Wigs, skincare, makeup & more — excluding braids</p>
          <div className="sticky top-20 z-30 bg-white py-4 border-b border-gray-100 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {shopCategories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-black text-white' : 'border border-gray-200'}`}>
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20"><ShoppingBag className="mx-auto text-pink-200 mb-4" size={48} /><p className="font-bold">No products found</p></div>
          )}
        </main>
      )}

      {activePage === 'braids' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <BraidsShopSection products={products} addToCart={addToCart} onProductClick={setSelectedProduct} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
        </main>
      )}

      {activePage === 'about' && <main className="flex-1 w-full"><AboutPage /></main>}
      {activePage === 'contact' && <main className="flex-1 w-full"><ContactPage /></main>}

      <footer className="border-t border-gray-100 py-8 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">{BRAND.systemName} · {BRAND.shopName}</p>
          <ConnectButton className="bg-black text-white hover:bg-pink-500" size="sm" />
        </div>
      </footer>

      {showWelcome && member && activePage !== 'home' && (
        <WelcomeChat member={member} onClose={() => setShowWelcome(false)} onNavigate={navigate} />
      )}

      {activePage === 'home' && (
        <HomeChatbot
          member={member}
          products={products}
          homePromoConfig={homePromoConfig}
          onNavigate={navigate}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Product modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[92vh] flex flex-col sm:flex-row">
              <div className="sm:w-1/2 aspect-square relative bg-gray-50">
                <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <button onClick={() => setSelectedProduct(null)} className="float-right p-2"><X size={20} /></button>
                <p className="text-xs font-bold text-pink-500 uppercase">{selectedProduct.brand}</p>
                <h2 className="text-2xl font-display font-bold mb-2">{selectedProduct.name}</h2>
                <div className="mb-4">
                  <PromoPrice price={getEffectivePrice(selectedProduct, homePromoConfig)} size="lg" />
                </div>
                {selectedProduct.category === 'Braids' && getBraidStyle(selectedProduct) && (
                  <p className="text-sm text-gray-500 mb-4">{getBraidStyle(selectedProduct)} · #{selectedProduct.colorNumber}</p>
                )}
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setIsCartOpen(true); }}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-pink-500 flex items-center justify-center gap-2">
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/30 z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
              <div className="p-5 border-b flex justify-between items-center">
                <h2 className="font-display font-bold">Your Bag ({cartTotalItems})</h2>
                <button onClick={() => setIsCartOpen(false)}><X size={22} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-20">Your bag is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
                        <img src={item.product.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <p className="font-bold text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-pink-500">{item.product.brand}</p>
                          <div className="flex justify-between items-center mt-2">
                            <PromoPrice price={getEffectivePrice(item.product, homePromoConfig)} size="sm" />
                            <div className="flex items-center gap-2 border rounded-lg p-0.5">
                              <button onClick={() => updateCartQuantity(item.product.id, -1)}><Minus size={14} /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.product.id, 1)}><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300"><X size={16} /></button>
                      </div>
                    ))}
                    <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
                      <p className="text-sm font-bold text-gray-800 mb-1">Connect to complete order</p>
                      <p className="text-xs text-gray-600">Order + PDF receipt sent to <strong>{BRAND.whatsappDisplay}</strong> for negotiation & tracking.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Name', value: checkoutCustomerName, set: setCheckoutCustomerName, type: 'text' },
                        { label: 'Phone', value: checkoutCustomerPhone, set: setCheckoutCustomerPhone, type: 'tel' },
                        { label: 'Location', value: location, set: setLocation, type: 'text' },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">{f.label}</label>
                          <input type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)}
                            className="w-full mt-1 px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-200" />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Delivery date</label>
                        <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full mt-1 px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t">
                  <div className="flex justify-between mb-1"><span>Subtotal</span><span className="font-bold">KSh {promoSubtotal}</span></div>
                  {promoSavings > 0 && <p className="text-sm text-pink-600 mb-1">Promo savings: -KSh {promoSavings}</p>}
                  {cartDiscount > 0 && <p className="text-sm text-emerald-600 mb-2">Bundle discount: -KSh {cartDiscount}</p>}
                  <div className="flex justify-between mb-3"><span>Total</span><span className="text-xl font-black">KSh {cartTotal}</span></div>
                  <button onClick={processWhatsAppCheckout} disabled={checkoutLoading}
                    className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-400 disabled:opacity-60">
                    <Sparkles size={18} /> {checkoutLoading ? 'Preparing receipt...' : 'Connect & send order'}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-2">PDF receipt downloads · attach in chat to {BRAND.whatsappDisplay}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
