import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Filter, AlertTriangle, TrendingUp, ShoppingCart, X, Search,
  ImageIcon, ChevronDown, ChevronUp, Package, Calendar, Layers,
} from 'lucide-react';
import { Product, Category, Role, StockBatch } from '../types';
import { CATEGORIES } from '../constants';
import {
  LOW_STOCK_THRESHOLD,
  HIGH_STOCK_THRESHOLD,
  formatBatchDate,
  normalizeBatches,
  applyStockAddition,
  createProductWithBatch,
} from '../utils/inventory';
import { sanitizeProductText, safeImageUrl } from '../utils/sanitize';
import BraidFilters, { BraidDetailFields } from './BraidFilters';
import { BraidFilterState, emptyBraidFilters, filterBraidProducts, getBraidStyle } from '../utils/braidFilters';

interface InventoryPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  role: Role;
  activeEmployee: string | null;
  onRecordSale: (product: Product) => void;
  showNotification: (message: string, type?: 'error' | 'success') => void;
}

const emptyProductForm = () => ({
  name: '',
  brand: '',
  category: 'Other' as Category,
  quantity: 0,
  buyingPrice: 0,
  sellingPrice: 0,
  imageUrl: '',
  dateAdded: new Date().toISOString().split('T')[0],
  bestUsedBy: '',
  bestUsedWhen: '',
  bestUsedWith: '',
  resultsAfter: '',
  braidStyle: '',
  braidLength: '',
  colorNumber: '',
  brandSelect: '',
  styleSelect: '',
  customBrand: '',
  customStyle: '',
});

export default function InventoryPanel({
  products,
  setProducts,
  role,
  activeEmployee,
  onRecordSale,
  showNotification,
}: InventoryPanelProps) {
  const [inventoryCategory, setInventoryCategory] = useState<Category>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showHighStockOnly, setShowHighStockOnly] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingOn, setIsAddingOn] = useState(false);
  const [newProductData, setNewProductData] = useState(emptyProductForm);
  const [addOnData, setAddOnData] = useState({
    productId: '',
    quantity: 0,
    buyingPrice: 0,
    dateAdded: new Date().toISOString().split('T')[0],
  });
  const [addOnSearchQuery, setAddOnSearchQuery] = useState('');
  const [braidFilters, setBraidFilters] = useState<BraidFilterState>(emptyBraidFilters);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addedBy = role === 'admin' ? 'Admin' : (activeEmployee || 'Staff');

  const baseFiltered = useMemo(
    () =>
      products.filter(
        (p) =>
          (inventoryCategory === 'All' || p.category === inventoryCategory) &&
          (!showLowStockOnly || p.stockQuantity <= LOW_STOCK_THRESHOLD) &&
          (!showHighStockOnly || p.stockQuantity >= HIGH_STOCK_THRESHOLD)
      ),
    [products, inventoryCategory, showLowStockOnly, showHighStockOnly]
  );

  const filteredProducts = useMemo(() => {
    const list =
      inventoryCategory === 'Braids'
        ? filterBraidProducts(baseFiltered, braidFilters)
        : baseFiltered;
    return [...list].sort((a, b) => {
      const dateA = a.createdAt.split('T')[0];
      const dateB = b.createdAt.split('T')[0];
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return a.name.localeCompare(b.name);
    });
  }, [baseFiltered, inventoryCategory, braidFilters]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveNewProduct = () => {
    if (!newProductData.name.trim() || !newProductData.brand.trim()) {
      showNotification('Product name and brand are required', 'error');
      return;
    }
    if (newProductData.quantity <= 0) {
      showNotification('Quantity must be greater than 0', 'error');
      return;
    }

    const base = {
      id: Math.random().toString(36).substr(2, 9),
      name: sanitizeProductText(newProductData.name),
      brand: sanitizeProductText(newProductData.brand),
      category: newProductData.category,
      sellerId: 's1',
      firstPrice: newProductData.buyingPrice,
      lastPrice: newProductData.buyingPrice,
      sellingPrice: newProductData.sellingPrice,
      isFixedPrice: true,
      imageUrl: safeImageUrl(
        newProductData.imageUrl,
        `https://picsum.photos/seed/${encodeURIComponent(newProductData.name)}/400/400`
      ),
      createdAt: `${newProductData.dateAdded}T12:00:00.000Z`,
      bestUsedBy: newProductData.bestUsedBy ? sanitizeProductText(newProductData.bestUsedBy) : undefined,
      bestUsedWhen: newProductData.bestUsedWhen ? sanitizeProductText(newProductData.bestUsedWhen) : undefined,
      bestUsedWith: newProductData.bestUsedWith ? sanitizeProductText(newProductData.bestUsedWith) : undefined,
      resultsAfter: newProductData.resultsAfter ? sanitizeProductText(newProductData.resultsAfter) : undefined,
      braidStyle: newProductData.category === 'Braids' ? newProductData.braidStyle : undefined,
      braidLength: newProductData.category === 'Braids' ? newProductData.braidLength : undefined,
      braidType: newProductData.category === 'Braids' ? newProductData.braidStyle : undefined,
      colorNumber: newProductData.category === 'Braids' ? newProductData.colorNumber : undefined,
    };

    const newProduct = createProductWithBatch(
      base,
      newProductData.quantity,
      newProductData.buyingPrice,
      addedBy,
      newProductData.dateAdded
    );

    setProducts((prev) => [...prev, newProduct]);
    setIsAddingProduct(false);
    setNewProductData(emptyProductForm());
    showNotification('Product added to inventory', 'success');
  };

  const saveAddOn = () => {
    if (!addOnData.productId) {
      showNotification('Select a product', 'error');
      return;
    }
    if (addOnData.quantity <= 0) {
      showNotification('Quantity must be greater than 0', 'error');
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === addOnData.productId
          ? applyStockAddition(
              p,
              addOnData.quantity,
              addOnData.buyingPrice || p.lastPrice,
              addedBy,
              addOnData.dateAdded
            )
          : p
      )
    );

    setIsAddingOn(false);
    setAddOnData({
      productId: '',
      quantity: 0,
      buyingPrice: 0,
      dateAdded: new Date().toISOString().split('T')[0],
    });
    showNotification('Stock batch added', 'success');
  };

  const BatchTimeline = ({ batches }: { batches: StockBatch[] }) => (
    <div className="space-y-2">
      {batches.map((batch, i) => (
        <div
          key={`${batch.date}-${i}`}
          className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
            i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              i === 0 ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {i === 0 ? <Layers size={14} /> : <Package size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-800">{batch.quantity} units</span>
              {i === 0 && (
                <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                  Sells first
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Added {formatBatchDate(batch.date)} by {batch.addedBy}
              {role === 'admin' && ` · KSh ${batch.buyingPrice} cost`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900">
            {role === 'admin' ? 'Inventory' : 'Stock Check'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {role === 'admin'
              ? 'Add products with a date — oldest stock sells first (FIFO)'
              : 'View stock levels and record sales — contact admin to add products'}
          </p>
        </div>
        {role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 shadow-lg transition-all active:scale-95"
            >
              <Plus size={18} />
              New Product
            </button>
            <button
              onClick={() => setIsAddingOn(true)}
              className="flex items-center gap-2 bg-white text-pink-600 border-2 border-pink-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-50 transition-all active:scale-95"
            >
              <Calendar size={18} />
              Add Stock Batch
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-pink-100 rounded-xl px-3 py-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={inventoryCategory}
            onChange={(e) => setInventoryCategory(e.target.value as Category)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setShowLowStockOnly(!showLowStockOnly);
            if (!showLowStockOnly) setShowHighStockOnly(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showLowStockOnly
              ? 'bg-amber-100 text-amber-700 border border-amber-200'
              : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50'
          }`}
        >
          <AlertTriangle size={16} />
          Low Stock
        </button>
        <button
          onClick={() => {
            setShowHighStockOnly(!showHighStockOnly);
            if (!showHighStockOnly) setShowLowStockOnly(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showHighStockOnly
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50'
          }`}
        >
          <TrendingUp size={16} />
          High Stock
        </button>
        <span className="text-xs text-gray-400 ml-auto">{filteredProducts.length} products</span>
      </div>

      {inventoryCategory === 'Braids' && (
        <BraidFilters filters={braidFilters} onChange={setBraidFilters} resultCount={filteredProducts.length} compact />
      )}

      {/* Product list */}
      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const batches = normalizeBatches(product);
          const isExpanded = expandedProductId === product.id;
          const oldestBatch = batches[0];

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-pink-500 font-bold uppercase">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                        {product.category}
                      </span>
                      {product.category === 'Braids' && getBraidStyle(product) && (
                        <span className="text-[10px] text-pink-500 font-medium">{getBraidStyle(product)}</span>
                      )}
                      {product.colorNumber && (
                        <span className="text-[10px] text-amber-600 font-medium">#{product.colorNumber}</span>
                      )}
                      {oldestBatch && product.stockQuantity > 0 && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Calendar size={10} />
                          Oldest: {formatBatchDate(oldestBatch.date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Stock</p>
                    <p
                      className={`text-lg font-black ${
                        product.stockQuantity === 0
                          ? 'text-red-500'
                          : product.stockQuantity <= LOW_STOCK_THRESHOLD
                            ? 'text-amber-600'
                            : 'text-gray-800'
                      }`}
                    >
                      {product.stockQuantity}
                    </p>
                  </div>
                  {role === 'admin' && (
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Cost</p>
                      <p className="text-sm font-bold text-gray-600">KSh {product.lastPrice}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Price</p>
                    <p className="text-sm font-black text-pink-600">KSh {product.sellingPrice}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {batches.length > 0 && (
                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors"
                        title="View stock batches"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    )}
                    <button
                      disabled={product.stockQuantity === 0}
                      onClick={() => onRecordSale(product)}
                      className="p-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-pink-200/50"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && batches.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-pink-50"
                  >
                    <div className="p-4 sm:p-5 bg-pink-50/30">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Stock batches (FIFO order)
                      </p>
                      <BatchTimeline batches={batches} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-pink-100">
            <Package className="mx-auto text-pink-200 mb-3" size={40} />
            <p className="font-bold text-gray-700">No products match your filters</p>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="mt-4 text-pink-600 font-bold text-sm hover:underline"
            >
              Add your first product
            </button>
          </div>
        )}
      </div>

      {/* New Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <Modal onClose={() => setIsAddingProduct(false)} title="Add New Product">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date Added" className="col-span-2 sm:col-span-1">
                  <input
                    type="date"
                    value={newProductData.dateAdded}
                    onChange={(e) => setNewProductData({ ...newProductData, dateAdded: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Category" className="col-span-2 sm:col-span-1">
                  <select
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value as Category })}
                    className={inputClass}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Product Name">
                <input
                  type="text"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Dr Rashel Vitamin C Serum"
                />
              </Field>
              {newProductData.category !== 'Braids' && (
                <Field label="Brand">
                  <input
                    type="text"
                    value={newProductData.brand}
                    onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              )}

              <div className="grid grid-cols-3 gap-3">
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    value={newProductData.quantity || ''}
                    onChange={(e) => setNewProductData({ ...newProductData, quantity: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Buying Price">
                  <input
                    type="number"
                    min={0}
                    value={newProductData.buyingPrice || ''}
                    onChange={(e) => setNewProductData({ ...newProductData, buyingPrice: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Selling Price">
                  <input
                    type="number"
                    min={0}
                    value={newProductData.sellingPrice || ''}
                    onChange={(e) => setNewProductData({ ...newProductData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </Field>
              </div>

              {newProductData.category === 'Braids' && (
                <BraidDetailFields
                  brand={newProductData.brand}
                  setBrand={(v) => setNewProductData({ ...newProductData, brand: v })}
                  braidStyle={newProductData.braidStyle}
                  setBraidStyle={(v) => setNewProductData({ ...newProductData, braidStyle: v })}
                  braidLength={newProductData.braidLength}
                  setBraidLength={(v) => setNewProductData({ ...newProductData, braidLength: v })}
                  colorNumber={newProductData.colorNumber}
                  setColorNumber={(v) => setNewProductData({ ...newProductData, colorNumber: v })}
                  customBrand={newProductData.customBrand}
                  setCustomBrand={(v) => setNewProductData({ ...newProductData, customBrand: v })}
                  customStyle={newProductData.customStyle}
                  setCustomStyle={(v) => setNewProductData({ ...newProductData, customStyle: v })}
                  brandSelect={newProductData.brandSelect}
                  setBrandSelect={(v) => setNewProductData({ ...newProductData, brandSelect: v })}
                  styleSelect={newProductData.styleSelect}
                  setStyleSelect={(v) => setNewProductData({ ...newProductData, styleSelect: v })}
                  inputClass={inputClass}
                />
              )}

              <Field label="Product Photo">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewProductData((prev) => ({ ...prev, imageUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full h-28 bg-pink-50 border-2 border-dashed border-pink-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-all overflow-hidden relative"
                >
                  {newProductData.imageUrl ? (
                    <img src={newProductData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="text-pink-300 mb-1" size={24} />
                      <p className="text-[10px] text-pink-400 font-bold uppercase">Drop or click to upload</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
              </Field>

              <p className="text-xs text-gray-400 bg-pink-50 p-3 rounded-xl">
                This creates the first stock batch on <strong>{formatBatchDate(newProductData.dateAdded)}</strong>.
                When sold, this batch is used before any newer stock.
              </p>

              <button onClick={saveNewProduct} className={primaryBtnClass}>
                Save Product
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add Stock Batch Modal */}
      <AnimatePresence>
        {isAddingOn && (
          <Modal onClose={() => setIsAddingOn(false)} title="Add Stock Batch">
            <div className="space-y-4">
              <Field label="Search Product">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Type to filter..."
                    className={`${inputClass} pl-9`}
                    onChange={(e) => setAddOnSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={addOnData.productId}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    setAddOnData({
                      ...addOnData,
                      productId: e.target.value,
                      buyingPrice: p?.lastPrice || 0,
                    });
                  }}
                  className={inputClass}
                >
                  <option value="">Select a product...</option>
                  {[...products]
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(addOnSearchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(addOnSearchQuery.toLowerCase())
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) — {p.stockQuantity} in stock
                      </option>
                    ))}
                </select>
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Date Added">
                  <input
                    type="date"
                    value={addOnData.dateAdded}
                    onChange={(e) => setAddOnData({ ...addOnData, dateAdded: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    value={addOnData.quantity || ''}
                    onChange={(e) => setAddOnData({ ...addOnData, quantity: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Buying Price">
                  <input
                    type="number"
                    min={0}
                    value={addOnData.buyingPrice || ''}
                    onChange={(e) => setAddOnData({ ...addOnData, buyingPrice: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                New batches are queued behind existing stock. Only the <strong>oldest batch</strong> sells until it runs out.
              </p>

              <button onClick={saveAddOn} className={primaryBtnClass}>
                Add Batch
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const inputClass =
  'w-full px-3 py-2.5 bg-pink-50/80 border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 outline-none transition-all';
const primaryBtnClass =
  'w-full bg-pink-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-200/50 hover:bg-pink-600 active:scale-[0.98] transition-all';

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-pink-100 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-gray-800">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-full text-gray-400">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
