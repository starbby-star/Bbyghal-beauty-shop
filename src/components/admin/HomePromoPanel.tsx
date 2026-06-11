import React from 'react';
import { Plus, Trash2, Sparkles, Flame, Sun, ToggleLeft, ToggleRight } from 'lucide-react';
import { HomePromoConfig, Product, GlowTip } from '../../types';
import {
  activatePinkThursday,
  activateSelloutDay,
  deactivatePinkThursday,
  deactivateSelloutDay,
  getActiveTheme,
  pinkThursdayTimeLeft,
  selloutTimeLeft,
} from '../../utils/homePromos';
import PinkThursdayPackageBuilder from './PinkThursdayPackageBuilder';

interface HomePromoPanelProps {
  config: HomePromoConfig;
  products: Product[];
  onSave: (config: HomePromoConfig) => void | Promise<void>;
  showNotification: (msg: string, type?: 'error' | 'success') => void;
}

type Tab = 'pink' | 'sellout' | 'tips';

export default function HomePromoPanel({
  config,
  products,
  onSave,
  showNotification,
}: HomePromoPanelProps) {
  const [tab, setTab] = React.useState<Tab>('pink');
  const [draft, setDraft] = React.useState(config);
  const theme = getActiveTheme(config);

  React.useEffect(() => setDraft(config), [config]);

  const inStock = products.filter((p) => p.stockQuantity > 0);

  const save = (next: HomePromoConfig) => {
    onSave(next);
    showNotification('Home promo settings saved', 'success');
  };

  const updatePromoProduct = (
    listKey: 'pinkThursdayProducts' | 'selloutProducts',
    productId: string,
    promoPrice: number
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existing = draft[listKey].filter((p) => p.productId !== productId);
    save({
      ...draft,
      [listKey]: [
        ...existing,
        { productId, originalPrice: product.sellingPrice, promoPrice },
      ],
    });
  };

  const removePromoProduct = (listKey: 'pinkThursdayProducts' | 'selloutProducts', productId: string) => {
    save({
      ...draft,
      [listKey]: draft[listKey].filter((p) => p.productId !== productId),
    });
  };

  const addTip = (listKey: 'pinkThursdayTips' | 'glowTips') => {
    const tip: GlowTip = {
      id: `tip-${Date.now()}`,
      title: 'New tip',
      message: 'Your glow reminder message here...',
      emoji: '✨',
    };
    save({ ...draft, [listKey]: [...draft[listKey], tip] });
  };

  const updateTip = (
    listKey: 'pinkThursdayTips' | 'glowTips',
    id: string,
    patch: Partial<GlowTip>
  ) => {
    save({
      ...draft,
      [listKey]: draft[listKey].map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const removeTip = (listKey: 'pinkThursdayTips' | 'glowTips', id: string) => {
    save({
      ...draft,
      [listKey]: draft[listKey].filter((t) => t.id !== id),
    });
  };

  const PromoProductPicker = ({
    listKey,
    accent,
  }: {
    listKey: 'pinkThursdayProducts' | 'selloutProducts';
    accent: string;
  }) => (
    <div className="space-y-3">
      {draft[listKey].map((promo) => {
        const product = products.find((p) => p.id === promo.productId);
        if (!product) return null;
        return (
          <div key={promo.productId} className="flex flex-wrap items-center gap-3 p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
            <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1 min-w-[140px]">
              <p className="font-bold text-sm text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-400 line-through">Was KSh {promo.originalPrice}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Now KSh</label>
              <input
                type="number"
                value={promo.promoPrice}
                onChange={(e) =>
                  updatePromoProduct(listKey, promo.productId, Number(e.target.value))
                }
                className="w-24 mt-1 px-2 py-1.5 border rounded-lg text-sm font-bold"
              />
            </div>
            <button
              onClick={() => removePromoProduct(listKey, promo.productId)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
      <select
        className="w-full px-3 py-2.5 border rounded-xl text-sm"
        value=""
        onChange={(e) => {
          if (!e.target.value) return;
          const p = products.find((x) => x.id === e.target.value);
          if (p) updatePromoProduct(listKey, p.id, Math.round(p.sellingPrice * 0.85));
        }}
      >
        <option value="">+ Add product to {accent}...</option>
        {inStock
          .filter((p) => !draft[listKey].some((x) => x.productId === p.id))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (KSh {p.sellingPrice})
            </option>
          ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Home & Promos</h3>
            <p className="text-sm text-gray-500">Control Pink Thursday, sell-out days, and glow reminders on the storefront</p>
          </div>
          <div className="flex gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                theme === 'pink-thursday'
                  ? 'bg-pink-500 text-white'
                  : theme === 'sellout-day'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Live: {theme === 'pink-thursday' ? 'Pink Thursday' : theme === 'sellout-day' ? 'Sell-out Day' : 'Default'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { id: 'pink' as Tab, label: 'Pink Thursday', icon: Sparkles },
            { id: 'sellout' as Tab, label: 'Sell-out Day', icon: Flame },
            { id: 'tips' as Tab, label: 'Glow Tips', icon: Sun },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === id ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === 'pink' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-pink-500/10 to-amber-500/10 rounded-2xl border border-pink-200">
              <div>
                <p className="font-bold text-gray-800">Pink Thursday (24 hours)</p>
                <p className="text-xs text-gray-500">Pink & gold theme · packages · special prices</p>
                {config.pinkThursdayActive && pinkThursdayTimeLeft(config) && (
                  <p className="text-xs text-pink-600 font-bold mt-1">{pinkThursdayTimeLeft(config)}</p>
                )}
              </div>
              <button
                onClick={() =>
                  save(
                    config.pinkThursdayActive
                      ? deactivatePinkThursday(config)
                      : activatePinkThursday(config)
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
                  config.pinkThursdayActive
                    ? 'bg-gray-800 text-white'
                    : 'bg-pink-500 text-white'
                }`}
              >
                {config.pinkThursdayActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {config.pinkThursdayActive ? 'End Pink Thursday' : 'Start Pink Thursday now'}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Auto-activate weeks of month (Thursdays)</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((week) => (
                  <button
                    key={week}
                    onClick={() => {
                      const weeks = draft.pinkThursdayWeeks.includes(week)
                        ? draft.pinkThursdayWeeks.filter((w) => w !== week)
                        : [...draft.pinkThursdayWeeks, week];
                      save({ ...draft, pinkThursdayWeeks: weeks.sort() });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      draft.pinkThursdayWeeks.includes(week)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Week {week}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-3">Pink Thursday product prices</h4>
              <PromoProductPicker listKey="pinkThursdayProducts" accent="Pink Thursday" />
            </div>

            <PinkThursdayPackageBuilder
              packages={draft.pinkThursdayPackages}
              products={products}
              onChange={(pinkThursdayPackages) => save({ ...draft, pinkThursdayPackages })}
              showNotification={showNotification}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800">Pink Thursday glow tips</h4>
                <button onClick={() => addTip('pinkThursdayTips')} className="text-xs font-bold text-pink-600 flex items-center gap-1">
                  <Plus size={14} /> Add tip
                </button>
              </div>
              {draft.pinkThursdayTips.map((tip) => (
                <div key={tip.id} className="p-3 mb-2 bg-white border rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={tip.emoji ?? ''}
                      onChange={(e) => updateTip('pinkThursdayTips', tip.id, { emoji: e.target.value })}
                      className="w-12 px-2 py-1 border rounded-lg text-center"
                    />
                    <input
                      value={tip.title}
                      onChange={(e) => updateTip('pinkThursdayTips', tip.id, { title: e.target.value })}
                      className="flex-1 px-3 py-1 border rounded-lg text-sm font-bold"
                    />
                    <button onClick={() => removeTip('pinkThursdayTips', tip.id)} className="text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={tip.message}
                    onChange={(e) => updateTip('pinkThursdayTips', tip.id, { message: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'sellout' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-white rounded-2xl border border-amber-200">
              <div>
                <p className="font-bold text-gray-800">Sell-out Day (24 hours)</p>
                <p className="text-xs text-gray-500">Gold, white & pink theme · was/now pricing</p>
                {config.selloutDayActive && selloutTimeLeft(config) && (
                  <p className="text-xs text-amber-600 font-bold mt-1">{selloutTimeLeft(config)}</p>
                )}
              </div>
              <button
                onClick={() =>
                  save(
                    config.selloutDayActive
                      ? deactivateSelloutDay(config)
                      : activateSelloutDay(config)
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
                  config.selloutDayActive ? 'bg-gray-800 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {config.selloutDayActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {config.selloutDayActive ? 'End sell-out day' : 'Start sell-out day now'}
              </button>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-3">Sell-out products — set was / now price</h4>
              <PromoProductPicker listKey="selloutProducts" accent="sell-out" />
            </div>
          </div>
        )}

        {tab === 'tips' && (
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.showGlowTipPopup}
                onChange={(e) => save({ ...draft, showGlowTipPopup: e.target.checked })}
                className="w-4 h-4 accent-pink-500"
              />
              <span className="text-sm font-semibold text-gray-700">Show glow reminder popup on home page</span>
            </label>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800">Home glow reminders</h4>
                <button onClick={() => addTip('glowTips')} className="text-xs font-bold text-pink-600 flex items-center gap-1">
                  <Plus size={14} /> Add reminder
                </button>
              </div>
              {draft.glowTips.map((tip) => (
                <div key={tip.id} className="p-3 mb-2 bg-pink-50/50 border border-pink-100 rounded-xl space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      value={tip.emoji ?? ''}
                      onChange={(e) => updateTip('glowTips', tip.id, { emoji: e.target.value })}
                      className="w-12 px-2 py-1 border rounded-lg text-center"
                    />
                    <input
                      value={tip.title}
                      onChange={(e) => updateTip('glowTips', tip.id, { title: e.target.value })}
                      className="flex-1 px-3 py-1 border rounded-lg text-sm font-bold"
                    />
                    <button
                      onClick={() => save({ ...draft, activeGlowTipId: tip.id })}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        draft.activeGlowTipId === tip.id ? 'bg-pink-500 text-white' : 'bg-white border'
                      }`}
                    >
                      Pin
                    </button>
                    <button onClick={() => removeTip('glowTips', tip.id)} className="text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={tip.message}
                    onChange={(e) => updateTip('glowTips', tip.id, { message: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
