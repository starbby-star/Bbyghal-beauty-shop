import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, Search, Edit2, Trash2, AlertTriangle, ChevronDown, ChevronUp,
  Layers, Palette, Scissors, Ruler, ShoppingCart, Tag
} from 'lucide-react';
import { Product, BraidVariant, BraidStyle, BraidLength } from '../types';
import { BRAID_TYPES, BRAID_LENGTHS, BRAID_BRANDS, COMMON_BRAID_COLORS, COLOR_MAP } from '../constants/braids';

const BRAID_STYLES = BRAID_TYPES;

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onRecordSale: (product: Product, variant?: BraidVariant) => void;
  role: 'admin' | 'staff';
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}

const LOW = 5;

function colorHex(n: string) { return COLOR_MAP[n] || '#888'; }
function totalStock(p: Product) { return (p.braidVariants || []).reduce((s, v) => s + v.stockQuantity, 0); }
function stockBadge(n: number) {
  if (n === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-600' };
  if (n <= LOW) return { label: `Low: ${n}pks`, cls: 'bg-amber-100 text-amber-700' };
  return { label: `${n} packs`, cls: 'bg-emerald-100 text-emerald-700' };
}

export default function BraidsManager({ products, setProducts, onRecordSale, role, showNotification }: Props) {
  const braidProds = products.filter(p => p.category === 'Braids');

  const [q, setQ] = useState('');
  const [fBrand, setFBrand] = useState('All');
  const [fStyle, setFStyle] = useState('All');
  const [fLength, setFLength] = useState('All');
  const [fColor, setFColor] = useState('');
  const [fLow, setFLow] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [showProd, setShowProd] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showVar, setShowVar] = useState<string | null>(null);
  const [editVar, setEditVar] = useState<BraidVariant | null>(null);

  const emptyProd = { name: '', brand: 'Avvis', customBrand: '', braidStyle: 'Box Braid' as BraidStyle, braidLength: 'Long' as BraidLength, lastPrice: 0, sellingPrice: 0, imageUrl: '', shortDescription: '' };
  const emptyVar = { colorNumber: '', colorName: '', pieces: 0, stockQuantity: 0 };
  const [pForm, setPForm] = useState(emptyProd);
  const [vForm, setVForm] = useState(emptyVar);

  const brands = useMemo(() => {
    const custom = braidProds.map(p => p.brand).filter(b => !BRAID_BRANDS.includes(b));
    return ['All', ...BRAID_BRANDS, ...Array.from(new Set(custom))];
  }, [braidProds]);

  const filtered = useMemo(() => braidProds.filter(p => {
    const ql = q.toLowerCase();
    const ms = !ql || p.name.toLowerCase().includes(ql) || p.brand.toLowerCase().includes(ql)
      || (p.braidVariants || []).some(v => v.colorNumber.toLowerCase().includes(ql) || (v.colorName || '').toLowerCase().includes(ql));
    const mb = fBrand === 'All' || p.brand === fBrand;
    const mst = fStyle === 'All' || p.braidStyle === fStyle;
    const ml = fLength === 'All' || p.braidLength === fLength;
    const mc = !fColor || (p.braidVariants || []).some(v => v.colorNumber.toLowerCase().includes(fColor.toLowerCase()) || (v.colorName || '').toLowerCase().includes(fColor.toLowerCase()));
    const ts = totalStock(p);
    const mls = !fLow || ts <= LOW;
    return ms && mb && mst && ml && mc && mls;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [braidProds, q, fBrand, fStyle, fLength, fColor, fLow]);

  const openProd = (p?: Product) => {
    if (p) {
      setEditProd(p);
      setPForm({ name: p.name, brand: BRAID_BRANDS.includes(p.brand) ? p.brand : 'Other', customBrand: BRAID_BRANDS.includes(p.brand) ? '' : p.brand, braidStyle: (p.braidStyle || 'Box Braid') as BraidStyle, braidLength: (p.braidLength || 'Long') as BraidLength, lastPrice: p.lastPrice, sellingPrice: p.sellingPrice, imageUrl: p.imageUrl || '', shortDescription: p.shortDescription || '' });
    } else { setEditProd(null); setPForm(emptyProd); }
    setShowProd(true);
  };

  const saveProd = () => {
    const brand = pForm.brand === 'Other' ? pForm.customBrand : pForm.brand;
    if (!pForm.name || !brand) { showNotification('Name and brand required', 'error'); return; }
    if (editProd) {
      setProducts(prev => prev.map(p => p.id !== editProd.id ? p : { ...p, name: pForm.name, brand, braidStyle: pForm.braidStyle, braidLength: pForm.braidLength, lastPrice: pForm.lastPrice, firstPrice: pForm.lastPrice, sellingPrice: pForm.sellingPrice, imageUrl: pForm.imageUrl, shortDescription: pForm.shortDescription, braidType: pForm.braidStyle }));
      showNotification('Updated', 'success');
    } else {
      const np: Product = { id: Math.random().toString(36).substr(2, 9), name: pForm.name, brand, category: 'Braids', sellerId: 's1', firstPrice: pForm.lastPrice, lastPrice: pForm.lastPrice, sellingPrice: pForm.sellingPrice, stockQuantity: 0, isFixedPrice: true, imageUrl: pForm.imageUrl || `https://picsum.photos/seed/${pForm.name}/400/400`, createdAt: new Date().toISOString(), braidStyle: pForm.braidStyle, braidType: pForm.braidStyle, braidLength: pForm.braidLength, shortDescription: pForm.shortDescription, braidVariants: [] };
      setProducts(prev => [...prev, np]);
      showNotification('Braid product added', 'success');
    }
    setShowProd(false);
  };

  const deleteProd = (id: string) => { setProducts(prev => prev.filter(p => p.id !== id)); showNotification('Deleted', 'success'); };

  const openVar = (pid: string, v?: BraidVariant) => {
    setShowVar(pid);
    if (v) { setEditVar(v); setVForm({ colorNumber: v.colorNumber, colorName: v.colorName || '', pieces: v.pieces || 0, stockQuantity: v.stockQuantity }); }
    else { setEditVar(null); setVForm(emptyVar); }
  };

  const saveVar = () => {
    if (!vForm.colorNumber) { showNotification('Color number required', 'error'); return; }
    setProducts(prev => prev.map(p => {
      if (p.id !== showVar) return p;
      const vs = p.braidVariants || [];
      if (editVar) return { ...p, braidVariants: vs.map(v => v.id === editVar.id ? { ...v, ...vForm } : v) };
      return { ...p, braidVariants: [...vs, { id: Math.random().toString(36).substr(2, 9), ...vForm }] };
    }));
    showNotification(editVar ? 'Color updated' : 'Color added', 'success');
    setShowVar(null); setEditVar(null);
  };

  const deleteVar = (pid: string, vid: string) => {
    setProducts(prev => prev.map(p => p.id !== pid ? p : { ...p, braidVariants: (p.braidVariants || []).filter(v => v.id !== vid) }));
    showNotification('Color removed', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><Scissors size={24} className="text-pink-500" />Braids Inventory</h2>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} products · {filtered.reduce((s, p) => s + totalStock(p), 0)} packs total</p>
        </div>
        {role === 'admin' && (
        <button onClick={() => openProd()} className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-pink-600 shadow-lg shadow-pink-200/50 transition-all active:scale-95 text-sm">
            <Plus size={16} /> Add Braid Product
          </button>
        )}
      </div>
      {/* Filters */}
      <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
            <input type="text" placeholder="Search name, brand, color…" value={q} onChange={e => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 outline-none" />
        </div>
          <select value={fBrand} onChange={e => setFBrand(e.target.value)} className="px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-2xl text-sm outline-none font-medium text-gray-700">
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={fStyle} onChange={e => setFStyle(e.target.value)} className="px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-2xl text-sm outline-none font-medium text-gray-700">
            {['All', ...BRAID_STYLES].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={fLength} onChange={e => setFLength(e.target.value)} className="px-3 py-2.5 bg-pink-50/60 border border-pink-100 rounded-2xl text-sm outline-none font-medium text-gray-700">
            {['All', ...BRAID_LENGTHS].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
            <input type="text" placeholder="Color no. e.g. 27" value={fColor} onChange={e => setFColor(e.target.value)}
              className="pl-8 pr-3 py-2 bg-pink-50/60 border border-pink-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pink-300 w-40" />
          </div>
          <button onClick={() => setFLow(!fLow)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${fLow ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-pink-50 text-gray-500 border border-pink-100 hover:bg-pink-100'}`}>
            <AlertTriangle size={13} /> Low Stock
          </button>
          {(q || fBrand !== 'All' || fStyle !== 'All' || fLength !== 'All' || fColor || fLow) && (
            <button onClick={() => { setQ(''); setFBrand('All'); setFStyle('All'); setFLength('All'); setFColor(''); setFLow(false); }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-pink-100 p-14 text-center">
          <Scissors className="mx-auto text-pink-200 mb-3" size={44} />
          <p className="font-bold text-gray-400 text-sm">No braid products found</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(product => {
          const ts = totalStock(product);
          const badge = stockBadge(ts);
          const isEx = expanded === product.id;
          const vars = product.braidVariants || [];
          return (
            <motion.div key={product.id} layout className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Row */}
              <div className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-pink-50 flex-shrink-0 border border-pink-100">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <div className="w-full h-full flex items-center justify-center"><Scissors className="text-pink-200" size={24} /></div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-gray-800 text-sm sm:text-base leading-tight">{product.name}</h3>
                    <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{product.brand}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {product.braidStyle && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400"><Scissors size={9} /> {product.braidStyle}</span>}
                    {product.braidLength && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400"><Ruler size={9} /> {product.braidLength}</span>}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                  </div>
                  {vars.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-gray-300 font-bold">{vars.length} colors</span>
                      <div className="flex gap-1">
                        {vars.slice(0, 10).map(v => (
                          <div key={v.id} title={`No.${v.colorNumber}${v.colorName ? ' – ' + v.colorName : ''}`}
                            className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: colorHex(v.colorNumber) }} />
                        ))}
                        {vars.length > 10 && <span className="text-[9px] text-gray-300">+{vars.length - 10}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <p className="text-base sm:text-lg font-black text-pink-600">KSh {product.sellingPrice}</p>
                  {role === 'admin' && <p className="text-[10px] text-gray-400">Cost KSh {product.lastPrice}</p>}
                  <div className="flex items-center gap-1 mt-0.5">
                    {role === 'admin' && <>
                      <button onClick={() => openProd(product)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => deleteProd(product.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={13} /></button>
                    </>}
                    <button onClick={() => setExpanded(isEx ? null : product.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-pink-500 hover:bg-pink-50 rounded-xl transition-all text-[10px] font-bold border border-pink-100">
                      {isEx ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Colors
                    </button>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <AnimatePresence>
                {isEx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-pink-50 overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-black text-gray-600 flex items-center gap-1.5 uppercase tracking-wider"><Layers size={13} className="text-pink-400" /> Colors ({vars.length})</h4>
                        {role === 'admin' && (
                          <button onClick={() => openVar(product.id)} className="flex items-center gap-1 text-[11px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl transition-all border border-pink-100">
                            <Plus size={12} /> Add Color
                          </button>
                        )}
                      </div>

                      {vars.length === 0 ? (
                        <div className="text-center py-8">
                          <Palette className="mx-auto text-pink-100 mb-2" size={32} />
                          <p className="text-xs text-gray-400 font-medium">No colors added yet</p>
                          {role === 'admin' && <p className="text-[10px] text-gray-300 mt-0.5">Click "Add Color" to add color variants</p>}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                          {vars.map(v => {
                            const vb = stockBadge(v.stockQuantity);
                            return (
                              <div key={v.id} className="group relative bg-gradient-to-br from-pink-50/50 to-white rounded-2xl p-3.5 flex items-center gap-3 border border-pink-100/60 hover:border-pink-200 transition-all hover:shadow-sm">
                                <div className="w-9 h-9 rounded-xl shadow-md flex-shrink-0 flex items-center justify-center text-white text-[8px] font-black border-2 border-white"
                                  style={{ backgroundColor: colorHex(v.colorNumber) }}>
                                  {v.colorNumber.length <= 3 ? v.colorNumber : ''}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-gray-800 text-xs">No. {v.colorNumber}</p>
                                  {v.colorName && <p className="text-[10px] text-gray-400 truncate">{v.colorName}</p>}
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {v.pieces && <span className="text-[9px] text-gray-400 font-medium">{v.pieces}pcs/pk</span>}
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${vb.cls}`}>{vb.label}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                                  <button onClick={() => onRecordSale(product, v)} className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all shadow-sm" title="Record sale">
                                    <ShoppingCart size={11} />
                                  </button>
                                  {role === 'admin' && <>
                                    <button onClick={() => openVar(product.id, v)} className="p-1.5 bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-200 transition-all" title="Edit"><Edit2 size={11} /></button>
                                    <button onClick={() => deleteVar(product.id, v.id)} className="p-1.5 bg-red-100 text-red-400 rounded-lg hover:bg-red-200 transition-all" title="Remove"><Trash2 size={11} /></button>
                                  </>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showProd && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm" onClick={() => setShowProd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-pink-100 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-pink-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-800">{editProd ? 'Edit Braid' : 'New Braid Product'}</h3>
                <button onClick={() => setShowProd(false)} className="p-2 hover:bg-pink-50 rounded-full text-gray-400"><X size={18} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Product Name</label>
                  <input type="text" value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })}
                    placeholder="e.g. Avvis Box Braid Long" className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Brand / Company</label>
                    <select value={pForm.brand} onChange={e => setPForm({ ...pForm, brand: e.target.value })}
                      className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none">
                      {BRAID_BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  {pForm.brand === 'Other' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Custom Brand</label>
                      <input type="text" value={pForm.customBrand} onChange={e => setPForm({ ...pForm, customBrand: e.target.value })}
                        placeholder="Brand name" className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Style / Type</label>
                    <select value={pForm.braidStyle} onChange={e => setPForm({ ...pForm, braidStyle: e.target.value as BraidStyle })}
                      className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none">
                      {BRAID_STYLES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Length</label>
                    <select value={pForm.braidLength} onChange={e => setPForm({ ...pForm, braidLength: e.target.value as BraidLength })}
                      className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none">
                      {BRAID_LENGTHS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Buying Price (KSh)</label>
                    <input type="number" value={pForm.lastPrice} onChange={e => setPForm({ ...pForm, lastPrice: +e.target.value })}
                      className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Selling Price (KSh)</label>
                    <input type="number" value={pForm.sellingPrice} onChange={e => setPForm({ ...pForm, sellingPrice: +e.target.value })}
                      className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Image URL (optional)</label>
                  <input type="text" value={pForm.imageUrl} onChange={e => setPForm({ ...pForm, imageUrl: e.target.value })}
                    placeholder="https://…" className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Description (optional)</label>
                  <input type="text" value={pForm.shortDescription} onChange={e => setPForm({ ...pForm, shortDescription: e.target.value })}
                    placeholder="e.g. Lightweight, tangle-free" className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                </div>
                <button onClick={saveProd} className="w-full bg-pink-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-100 active:scale-95 transition-all">
                  {editProd ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Variant Modal */}
      <AnimatePresence>
        {showVar && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm" onClick={() => { setShowVar(null); setEditVar(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-pink-100">
              <div className="p-6 border-b border-pink-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-800">{editVar ? 'Edit Color' : 'Add Color'}</h3>
                <button onClick={() => { setShowVar(null); setEditVar(null); }} className="p-2 hover:bg-pink-50 rounded-full text-gray-400"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Quick Select Common Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_BRAID_COLORS.map(c => (
                      <button key={c.number} onClick={() => setVForm({ ...vForm, colorNumber: c.number, colorName: c.name })}
                        title={`${c.number} – ${c.name}`}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border-2 transition-all ${vForm.colorNumber === c.number ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-pink-100 bg-gray-50 hover:border-pink-200 text-gray-600'}`}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colorHex(c.number) }} />
                        {c.number}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Color Number *</label>
                    <input type="text" value={vForm.colorNumber} onChange={e => setVForm({ ...vForm, colorNumber: e.target.value })}
                      placeholder="e.g. 27, 1/900" className="w-full px-3 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Color Name</label>
                    <input type="text" value={vForm.colorName} onChange={e => setVForm({ ...vForm, colorName: e.target.value })}
                      placeholder="e.g. Honey Blonde" className="w-full px-3 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Pieces / Pack</label>
                    <input type="number" value={vForm.pieces} onChange={e => setVForm({ ...vForm, pieces: +e.target.value })}
                      placeholder="e.g. 6" className="w-full px-3 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Stock (packs)</label>
                    <input type="number" value={vForm.stockQuantity} onChange={e => setVForm({ ...vForm, stockQuantity: +e.target.value })}
                      className="w-full px-3 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                </div>
                {vForm.colorNumber && (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-3 flex items-center gap-3 border border-pink-100">
                    <div className="w-10 h-10 rounded-xl shadow-md flex-shrink-0" style={{ backgroundColor: colorHex(vForm.colorNumber) }} />
                    <div>
                      <p className="font-black text-sm text-gray-800">No. {vForm.colorNumber}</p>
                      {vForm.colorName && <p className="text-[10px] text-gray-500">{vForm.colorName}</p>}
                      {vForm.pieces > 0 && <p className="text-[10px] text-gray-400">{vForm.pieces}pcs/pack · {vForm.stockQuantity} packs</p>}
                    </div>
                  </div>
                )}
                <button onClick={saveVar} className="w-full bg-pink-500 text-white py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 active:scale-95 transition-all">
                  {editVar ? 'Update Color' : 'Add Color'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
