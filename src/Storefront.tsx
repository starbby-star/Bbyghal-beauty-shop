import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, X, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, MapPin, Truck, Phone, MessageCircle, Heart } from 'lucide-react';
import { Product, CartItem, PaymentMethod, Category } from './types';
import { CATEGORIES } from './constants';

const LogoImage = ({ containerClassName, textClassName }: { containerClassName: string, textClassName: string }) => {
  const [error, setError] = React.useState(false);
  return (
    <div className={`bg-black flex items-center justify-center overflow-hidden ${containerClassName}`}>
      {!error ? (
        <img 
          src="/logo.jpg" 
          alt="Babyghal Logo" 
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className={`text-[#d4af37] font-serif italic ${textClassName}`}>B</span>
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

export default function Storefront({
  products,
  cart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  cartTotalItems,
  cartSubtotal,
  cartDiscount,
  cartTotal,
  isCartOpen,
  setIsCartOpen,
  checkoutCustomerName,
  setCheckoutCustomerName,
  checkoutCustomerPhone,
  setCheckoutCustomerPhone,
  checkoutPaymentMethod,
  setCheckoutPaymentMethod,
  handleCheckout,
  onAdminLoginClick
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
    setWishlist(prev => 
      prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
    );
  };

  const filteredProducts = products.filter(p => {
    if (showWishlist && !wishlist.includes(p.id)) return false;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const dateA = a.createdAt.split('T')[0];
    const dateB = b.createdAt.split('T')[0];
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return a.name.localeCompare(b.name);
  });

  const processWhatsAppCheckout = () => {
    if (!checkoutCustomerName || !checkoutCustomerPhone || !location || !deliveryDate) {
      alert("Please fill in all checkout details (Name, Phone, Location, Delivery Date)");
      return;
    }

    // Generate a unique order number (e.g., BB-A1B2C3)
    const orderNumber = `BB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let orderText = `Hello Babyghal! 💖 I'd like to place an order:\n\n`;
    orderText += `*Order Number:* ${orderNumber}\n`;
    orderText += `*Name:* ${checkoutCustomerName}\n`;
    orderText += `*Phone:* ${checkoutCustomerPhone}\n`;
    orderText += `*Location:* ${location}\n`;
    orderText += `*Delivery Date:* ${deliveryDate}\n\n`;
    orderText += `*Order Details:*\n`;
    cart.forEach(item => {
      orderText += `- ${item.quantity}x ${item.product.name} (KSh ${item.product.sellingPrice * item.quantity})\n`;
    });
    orderText += `\n*Subtotal:* KSh ${cartSubtotal}\n`;
    if (cartDiscount > 0) {
      orderText += `*Surprise Discount:* -KSh ${cartDiscount}\n`;
    }
    orderText += `*Total:* KSh ${cartTotal}\n`;
    orderText += `*Payment Method:* ${checkoutPaymentMethod}\n`;

    const encodedText = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/254752520441?text=${encodedText}`;

    window.open(waUrl, '_blank');
    handleCheckout(); // clear cart and record locally
  };

  const TikTokIcon = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-pink-50/30 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoImage containerClassName="w-10 h-10 rounded-xl shadow-lg shadow-pink-500/20" textClassName="text-2xl" />
            <div>
              <h1 className="text-2xl font-display font-black text-gray-800 leading-none">Babyghal</h1>
              <p className="text-pink-500 font-serif italic text-xs">beauty shop</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onAdminLoginClick}
              className="text-sm font-medium text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full transition-colors"
            >
              Staff Login
            </button>
            <button 
              onClick={() => setShowWishlist(!showWishlist)}
              className={`relative p-3 rounded-full transition-colors ${showWishlist ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
              title="My Wishlist"
            >
              <Heart size={24} className={showWishlist ? "fill-white text-white" : ""} />
              {wishlist.length > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${showWishlist ? 'bg-white text-pink-500' : 'bg-pink-500 text-white'}`}>
                  {wishlist.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-[32px] p-8 sm:p-12 text-white shadow-xl shadow-pink-500/20 mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-black mb-2">WE GLOW IN AND OUT ✨</h2>
            <p className="text-pink-100 text-xl font-medium mb-2">Wigs, skin & beauty must haves 💅</p>
            <p className="text-white font-black text-2xl tracking-widest mb-4">SHOP. SLAY. REPEAT.</p>
            <p className="text-pink-50 text-lg mb-6">Tap in and radiate with us! 💖</p>
            <div className="flex gap-4">
               <a href="https://wa.me/254752520441" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-500/30">
                 <MessageCircle size={20} /> WhatsApp Us: 0752520441
               </a>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category 
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20' 
                    : 'bg-white text-gray-500 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-pink-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-pink-100 hover:shadow-xl hover:shadow-pink-100/50 transition-all group flex flex-col"
            >
              <div 
                className="aspect-square relative overflow-hidden bg-gray-50 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-pink-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                    {product.category}
                  </span>
                </div>
                <button
                  onClick={(e) => toggleWishlist(product, e)}
                  title={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  className="absolute top-3 right-3 w-8 h-8 md:w-9 md:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors shadow-sm z-10"
                >
                  <Heart size={16} className={wishlist.includes(product.id) ? "fill-pink-500 text-pink-500" : "text-gray-400 hover:text-pink-400"} />
                </button>
                {product.stockQuantity <= 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">{product.brand}</p>
                  {product.braidType && (
                    <span className="text-[8px] font-bold bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded uppercase">
                      {product.braidType} {product.colorNumber && `(${product.colorNumber})`}
                    </span>
                  )}
                </div>
                <h3 
                  className="font-bold text-gray-800 mb-1 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.name}
                </h3>
                {product.shortDescription && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-1">{product.shortDescription}</p>
                )}
                <div className="flex items-end justify-between mt-auto pt-2">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Price</p>
                    <p className="text-lg font-black text-pink-600">KSh {product.sellingPrice}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stockQuantity <= 0}
                    className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            {showWishlist && wishlist.length === 0 ? (
              <>
                <Heart className="mx-auto text-pink-200 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-4">You haven't added any products to your wishlist yet.</p>
                <button onClick={() => setShowWishlist(false)} className="px-6 py-2 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors shadow-sm">
                  Explore Products
                </button>
              </>
            ) : (
              <>
                <ShoppingBag className="mx-auto text-pink-200 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or category filter.</p>
              </>
            )}
          </div>
        )}

        {/* About Us & TikTok Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mb-8">
           {/* About Us */}
           <div className="bg-white p-8 rounded-[32px] border border-pink-100 shadow-sm">
             <h3 className="text-2xl font-black text-gray-800 mb-4">About Us 🛍️</h3>
             <p className="text-gray-600 mb-6 leading-relaxed">We are your ultimate beauty destination! Whether you're looking for premium wigs, flawless skincare, or everyday beauty must-haves, we've got you covered. 👑</p>
             <ul className="space-y-4 text-gray-600 font-medium">
               <li className="flex items-center gap-3"><MapPin className="text-pink-500" size={24} /> <span>Physical Shop: <strong>Mururui</strong></span></li>
               <li className="flex items-center gap-3"><Truck className="text-pink-500" size={24} /> <span><strong>Countrywide Deliveries</strong> 🚚</span></li>
               <li className="flex items-center gap-3"><Phone className="text-pink-500" size={24} /> <span>Call / Text / WhatsApp:<br/><strong className="text-lg text-gray-800">0752520441</strong></span></li>
             </ul>
           </div>

           {/* TikTok */}
           <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[32px] text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500 rounded-full blur-[80px] opacity-30"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-30"></div>
             
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black mb-4 shadow-lg">
                 <TikTokIcon size={32} />
               </div>
               <h3 className="text-2xl font-black mb-3">Join our TikTok Fam! 💃</h3>
               <p className="text-gray-300 mb-6 max-w-sm">Scan the QR code to connect with us! We teach, give beauty advice, and share the best glow-up tips. Let's radiate together! ✨📱</p>
               <div className="bg-white p-3 rounded-2xl shadow-2xl">
                 {/* QR Code Placeholder */}
                 <img 
                   src="/tiktok-qr.jpg" 
                   alt="TikTok QR Code" 
                   className="w-32 h-32 rounded-xl object-cover" 
                   onError={(e) => { e.currentTarget.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.tiktok.com/@babyghalbeautyshop"; }}
                 />
               </div>
             </div>
           </div>
        </div>

        {/* Business Cards Section */}
        <div className="mt-20 mb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-black text-gray-800 mb-2">Connect With Us</h3>
            <p className="text-gray-500">Scan, follow, and radiate with the Babyghal family!</p>
          </div>

          <div className="flex justify-center items-center px-4">
            <div className="w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl border-[8px] border-black relative bg-gray-100 min-h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-0">
                <p className="text-gray-500 font-bold text-lg mb-2">Waiting for Image...</p>
                <p className="text-gray-400 text-sm">Please upload your image to the <b>public</b> folder and name it <b>business-cards.jpg</b></p>
              </div>
              <img 
                src="/business-cards.jpg" 
                alt="Babyghal Business Cards" 
                className="w-full h-auto object-cover relative z-10"
                onError={(e) => {
                  // Hide the image tag if the image isn't uploaded yet so the message underneath shows
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Product Image Side */}
              <div className="w-full md:w-1/2 bg-gray-50 relative min-h-[300px] md:min-h-full">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 hover:bg-white hover:text-pink-500 transition-colors shadow-sm md:hidden"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={(e) => toggleWishlist(selectedProduct, e)}
                  title={wishlist.includes(selectedProduct.id) ? "Remove from wishlist" : "Add to wishlist"}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-pink-500 hover:bg-white transition-colors shadow-sm md:hidden"
                >
                  <Heart size={20} className={wishlist.includes(selectedProduct.id) ? "fill-pink-500 text-pink-500" : "text-gray-400"} />
                </button>
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover absolute inset-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 md:top-4 md:right-4 md:bottom-auto md:left-auto">
                  <span className="bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>

              {/* Product Info Side */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">{selectedProduct.brand}</p>
                    <h2 className="text-3xl font-black text-gray-800 leading-tight">{selectedProduct.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleWishlist(selectedProduct, e)}
                      title={wishlist.includes(selectedProduct.id) ? "Remove from wishlist" : "Add to wishlist"}
                      className="hidden md:flex w-10 h-10 bg-gray-100 rounded-full items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors shrink-0"
                    >
                      <Heart size={18} className={wishlist.includes(selectedProduct.id) ? "fill-pink-500 text-pink-500" : "text-gray-400"} />
                    </button>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="hidden md:flex w-10 h-10 bg-gray-100 rounded-full items-center justify-center text-gray-500 hover:bg-pink-100 hover:text-pink-500 transition-colors shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Ratings (Mocked if not present) */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating || 5) ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">{selectedProduct.rating || '5.0'} ({selectedProduct.reviewsCount || '12'} reviews)</span>
                </div>

                <div className="mb-8">
                  <p className="text-3xl font-black text-pink-600">KSh {selectedProduct.sellingPrice}</p>
                  {selectedProduct.stockQuantity <= 0 ? (
                    <p className="text-sm font-bold text-red-500 mt-1">Out of Stock</p>
                  ) : (
                    <p className="text-sm font-medium text-green-500 mt-1">In Stock ({selectedProduct.stockQuantity} available)</p>
                  )}
                </div>

                <div className="space-y-6 flex-1">
                  {selectedProduct.braidType && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedProduct.braidType}
                      </span>
                      {selectedProduct.colorNumber && (
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">
                          Color: {selectedProduct.colorNumber}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedProduct.fullDescription || selectedProduct.shortDescription || "Experience the ultimate glow with this premium beauty product, carefully selected for our Babyghal collection."}
                    </p>
                  </div>

                  {selectedProduct.bestUsedBy && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Best Used By (Solution)</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.bestUsedBy}
                      </p>
                    </div>
                  )}
                  
                  {selectedProduct.bestUsedWhen && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Best Used When</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.bestUsedWhen}
                      </p>
                    </div>
                  )}

                  {selectedProduct.bestUsedWith && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Best Used With</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.bestUsedWith}
                      </p>
                    </div>
                  )}

                  {selectedProduct.resultsAfter && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Results After</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.resultsAfter}
                      </p>
                    </div>
                  )}

                  {selectedProduct.howToUse && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">How to Use</h4>
                      <p className="text-gray-600 text-sm leading-relaxed bg-pink-50 p-4 rounded-2xl border border-pink-100">
                        {selectedProduct.howToUse}
                      </p>
                    </div>
                  )}

                  {selectedProduct.ingredients && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Key Ingredients</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {selectedProduct.ingredients}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    }}
                    disabled={selectedProduct.stockQuantity <= 0}
                    className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold text-lg hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={24} />
                    {selectedProduct.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} Babyghal Beauty Shop. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-pink-100"
            >
              <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                    <ShoppingBag size={20} />
                  </div>
                  <h2 className="text-xl font-black text-gray-800">Your Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-pink-50 rounded-full text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-200">
                      <ShoppingCart size={48} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">Your cart is empty</p>
                      <p className="text-sm text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-3 bg-pink-50 text-pink-600 rounded-xl font-bold hover:bg-pink-100 transition-colors mt-4"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 bg-white border border-pink-50 p-3 rounded-2xl shadow-sm">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl bg-gray-50" referrerPolicy="no-referrer" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-pink-400 uppercase">{item.product.brand}</p>
                                {item.product.braidType && (
                                  <span className="text-[8px] font-bold bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded uppercase">
                                    {item.product.braidType} {item.product.colorNumber && `(${item.product.colorNumber})`}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.product.name}</h4>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-black text-pink-600">KSh {item.product.sellingPrice}</p>
                            <div className="flex items-center gap-3 bg-pink-50 rounded-lg p-1">
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, -1)}
                                className="w-6 h-6 bg-white rounded flex items-center justify-center text-pink-600 shadow-sm hover:bg-pink-100"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, 1)}
                                className="w-6 h-6 bg-white rounded flex items-center justify-center text-pink-600 shadow-sm hover:bg-pink-100"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-pink-50/50 rounded-2xl p-5 space-y-4 mt-8 border border-pink-100">
                      <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Checkout Details</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Your Name</label>
                          <input 
                            type="text" 
                            value={checkoutCustomerName}
                            onChange={(e) => setCheckoutCustomerName(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Phone Number</label>
                          <input 
                            type="tel" 
                            value={checkoutCustomerPhone}
                            onChange={(e) => setCheckoutCustomerPhone(e.target.value)}
                            placeholder="e.g. 0712345678"
                            className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Location</label>
                          <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Nairobi CBD"
                            className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Date of Delivery</label>
                          <input 
                            type="date" 
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Payment Method</label>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              disabled
                              className="py-2.5 rounded-xl text-sm font-bold transition-all border bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20 flex items-center justify-center gap-2"
                            >
                              M-Pesa Only
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-pink-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Subtotal ({cartTotalItems} items)</span>
                      <span className="font-bold text-gray-800">KSh {cartSubtotal}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-500">
                        <span className="font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Surprise Discount!</span>
                        <span className="font-black">-KSh {cartDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-pink-100">
                      <span className="text-gray-800 font-black">Total</span>
                      <span className="text-2xl font-black text-pink-600">KSh {cartTotal}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={processWhatsAppCheckout}
                    className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
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
