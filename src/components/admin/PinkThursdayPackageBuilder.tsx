import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PinkThursdayPackage, Product } from '../../types';
import {
  PINK_THURSDAY_PACKAGE_SIZE,
  getPackageRegularTotal,
  getPackageSavings,
  isCompletePinkThursdayPackage,
  productsAvailableForPackageSlot,
} from '../../utils/pinkThursdayPackages';

const SLOT_LABELS = ['Product 1', 'Product 2', 'Product 3'];

interface PinkThursdayPackageBuilderProps {
  packages: PinkThursdayPackage[];
  products: Product[];
  onChange: (packages: PinkThursdayPackage[]) => void;
  showNotification: (msg: string, type?: 'error' | 'success') => void;
}

export default function PinkThursdayPackageBuilder({
  packages,
  products,
  onChange,
  showNotification,
}: PinkThursdayPackageBuilderProps) {
  const inStock = products.filter((p) => p.stockQuantity > 0);

  const addPackage = () => {
    const pkg: PinkThursdayPackage = {
      id: `pkg-${Date.now()}`,
      label: 'Pink Thursday Trio',
      productIds: ['', '', ''],
      packagePrice: 0,
    };
    onChange([...packages, pkg]);
  };

  const updatePackage = (id: string, patch: Partial<PinkThursdayPackage>) => {
    onChange(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePackage = (id: string) => {
    onChange(packages.filter((p) => p.id !== id));
  };

  const setSlotProduct = (pkgId: string, slotIndex: number, productId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return;

    const ids = [...pkg.productIds];
    while (ids.length < PINK_THURSDAY_PACKAGE_SIZE) ids.push('');
    ids[slotIndex] = productId;

    if (productId) {
      const product = products.find((p) => p.id === productId);
      const others = ids
        .map((id, i) => (i === slotIndex ? null : products.find((p) => p.id === id)))
        .filter((p): p is Product => Boolean(p));

      if (product && others.some((p) => p.category === product.category)) {
        showNotification('Each item must be from a different category (e.g. Soap, Hair, Facial)', 'error');
        return;
      }
    }

    updatePackage(pkgId, { productIds: ids.slice(0, PINK_THURSDAY_PACKAGE_SIZE) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-800">3-in-1 Pink Thursday packages</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Pick 3 products from <strong>different categories</strong> (e.g. Soap + Hair + Facial) sold together at one combined price
          </p>
        </div>
        <button onClick={addPackage} className="flex items-center gap-1 text-xs font-bold text-pink-600 shrink-0">
          <Plus size={14} /> Add package
        </button>
      </div>

      {packages.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-pink-200 rounded-2xl">
          No packages yet — add a 3-product bundle with a combined Pink Thursday price
        </p>
      )}

      {packages.map((pkg) => {
        const regularTotal = getPackageRegularTotal(pkg, inStock, (p) => p.sellingPrice);
        const savings = getPackageSavings(pkg, inStock, (p) => p.sellingPrice);
        const complete = isCompletePinkThursdayPackage(pkg, inStock);

        return (
          <div
            key={pkg.id}
            className={`p-4 mb-4 rounded-2xl border space-y-4 ${
              complete ? 'bg-gradient-to-br from-pink-50 to-amber-50 border-pink-200' : 'bg-amber-50/40 border-amber-100'
            }`}
          >
            <div className="flex flex-wrap gap-3 items-start">
              <input
                value={pkg.label}
                onChange={(e) => updatePackage(pkg.id, { label: e.target.value })}
                placeholder="Package name e.g. Glow Trio"
                className="flex-1 min-w-[180px] px-3 py-2 border rounded-xl text-sm font-bold"
              />
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Combined price KSh
                </label>
                <input
                  type="number"
                  value={pkg.packagePrice || ''}
                  onChange={(e) => updatePackage(pkg.id, { packagePrice: Number(e.target.value) })}
                  placeholder="3500"
                  className="w-32 px-3 py-2 border rounded-xl text-sm font-bold"
                />
              </div>
              <button onClick={() => removePackage(pkg.id)} className="p-2 text-red-400 mt-5">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {Array.from({ length: PINK_THURSDAY_PACKAGE_SIZE }).map((_, slotIndex) => {
                const available = productsAvailableForPackageSlot(pkg, inStock, slotIndex);
                const selectedId = pkg.productIds[slotIndex] ?? '';
                const selected = products.find((p) => p.id === selectedId);

                return (
                  <div key={slotIndex} className="bg-white rounded-xl border border-pink-100 p-3">
                    <p className="text-[10px] font-black text-pink-500 uppercase mb-2">
                      {SLOT_LABELS[slotIndex]}
                    </p>
                    {selected && (
                      <div className="flex gap-2 mb-2">
                        <img src={selected.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{selected.category}</p>
                          <p className="text-xs font-bold line-clamp-2">{selected.name}</p>
                          <p className="text-xs text-pink-600">KSh {selected.sellingPrice}</p>
                        </div>
                      </div>
                    )}
                    <select
                      value={selectedId}
                      onChange={(e) => setSlotProduct(pkg.id, slotIndex, e.target.value)}
                      className="w-full px-2 py-2 border rounded-lg text-xs bg-white"
                    >
                      <option value="">Choose product...</option>
                      {Object.entries(
                        available.reduce<Record<string, typeof available>>((acc, p) => {
                          if (!acc[p.category]) acc[p.category] = [];
                          acc[p.category].push(p);
                          return acc;
                        }, {})
                      ).map(([category, catProducts]) => (
                        <optgroup key={category} label={category}>
                          {catProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — KSh {p.sellingPrice}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              {regularTotal > 0 ? (
                <p className="text-gray-600">
                  Separate total: <span className="line-through">KSh {regularTotal.toLocaleString()}</span>
                  {pkg.packagePrice > 0 && (
                    <>
                      {' → '}
                      <span className="font-black text-pink-600">KSh {pkg.packagePrice.toLocaleString()}</span>
                      {savings > 0 && (
                        <span className="text-emerald-600 font-bold ml-1">(Save KSh {savings.toLocaleString()})</span>
                      )}
                    </>
                  )}
                </p>
              ) : (
                <p className="text-gray-400 text-xs">Select 3 products from different categories</p>
              )}
              {complete ? (
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  Ready for Pink Thursday
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Needs 3 categories + price
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
