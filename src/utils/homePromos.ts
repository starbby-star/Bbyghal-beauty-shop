import {
  CartItem,
  GlowTip,
  HomePromoConfig,
  HomeTheme,
  PinkThursdayPackage,
  Product,
  PromoProductPrice,
} from '../types';
import { getValidPinkThursdayPackages } from './pinkThursdayPackages';

const STORAGE_KEY = 'blumera_home_promos';
const PINK_THURSDAY_MS = 24 * 60 * 60 * 1000;
const SELLOUT_DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_HOME_PROMO_CONFIG: HomePromoConfig = {
  selloutDayActive: false,
  selloutProducts: [],
  pinkThursdayActive: false,
  pinkThursdayWeeks: [1, 3],
  pinkThursdayProducts: [],
  pinkThursdayPackages: [],
  pinkThursdayTips: [
    {
      id: 'tip-1',
      title: 'Hydrate your glow',
      message: 'Drink water, moisturize morning & night, and protect your skin — glow starts from within!',
      emoji: '💧',
    },
    {
      id: 'tip-2',
      title: 'SPF is self-love',
      message: 'Wear sunscreen daily even on cloudy days. Your future skin will thank you!',
      emoji: '☀️',
    },
    {
      id: 'tip-3',
      title: 'Rest & radiance',
      message: 'Beauty sleep is real! 7–8 hours helps skin repair and keeps your glow alive.',
      emoji: '🌙',
    },
  ],
  glowTips: [
    {
      id: 'glow-1',
      title: 'Glow reminder',
      message: 'You are glowing inside and out! Take a moment today for self-care.',
      emoji: '✨',
    },
  ],
  showGlowTipPopup: true,
  updatedAt: new Date().toISOString(),
};

function isExpired(until?: string): boolean {
  if (!until) return true;
  return new Date(until).getTime() <= Date.now();
}

function getWeekOfMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7);
}

export function isThursday(date = new Date()): boolean {
  return date.getDay() === 4;
}

export function shouldAutoPinkThursday(config: HomePromoConfig, date = new Date()): boolean {
  if (!config.pinkThursdayWeeks.length) return false;
  return isThursday(date) && config.pinkThursdayWeeks.includes(getWeekOfMonth(date));
}

export function expireHomePromos(config: HomePromoConfig): HomePromoConfig {
  let next = { ...config };

  if (next.pinkThursdayActive && isExpired(next.pinkThursdayActiveUntil)) {
    next = {
      ...next,
      pinkThursdayActive: false,
      pinkThursdayActiveUntil: undefined,
    };
  }

  if (next.selloutDayActive && isExpired(next.selloutActiveUntil)) {
    next = {
      ...next,
      selloutDayActive: false,
      selloutActiveUntil: undefined,
    };
  }

  if (shouldAutoPinkThursday(next) && !next.pinkThursdayActive) {
    next = {
      ...next,
      pinkThursdayActive: true,
      pinkThursdayActiveUntil: new Date(Date.now() + PINK_THURSDAY_MS).toISOString(),
    };
  }

  return next;
}

export function loadHomePromoConfig(): HomePromoConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as HomePromoConfig) : DEFAULT_HOME_PROMO_CONFIG;
    const expired = expireHomePromos({ ...DEFAULT_HOME_PROMO_CONFIG, ...parsed });
    writeHomePromoConfig(expired);
    return expired;
  } catch {
    return DEFAULT_HOME_PROMO_CONFIG;
  }
}

export function writeHomePromoConfig(config: HomePromoConfig): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...config, updatedAt: new Date().toISOString() })
  );
}

export function saveHomePromoConfig(config: HomePromoConfig): HomePromoConfig {
  const next = expireHomePromos(config);
  writeHomePromoConfig(next);
  return next;
}

export function activatePinkThursday(config: HomePromoConfig): HomePromoConfig {
  return saveHomePromoConfig({
    ...config,
    pinkThursdayActive: true,
    pinkThursdayActiveUntil: new Date(Date.now() + PINK_THURSDAY_MS).toISOString(),
    selloutDayActive: false,
    selloutActiveUntil: undefined,
  });
}

export function deactivatePinkThursday(config: HomePromoConfig): HomePromoConfig {
  return saveHomePromoConfig({
    ...config,
    pinkThursdayActive: false,
    pinkThursdayActiveUntil: undefined,
  });
}

export function activateSelloutDay(config: HomePromoConfig): HomePromoConfig {
  return saveHomePromoConfig({
    ...config,
    selloutDayActive: true,
    selloutActiveUntil: new Date(Date.now() + SELLOUT_DAY_MS).toISOString(),
    pinkThursdayActive: false,
    pinkThursdayActiveUntil: undefined,
  });
}

export function deactivateSelloutDay(config: HomePromoConfig): HomePromoConfig {
  return saveHomePromoConfig({
    ...config,
    selloutDayActive: false,
    selloutActiveUntil: undefined,
  });
}

export function getActiveTheme(config: HomePromoConfig): HomeTheme {
  const fresh = expireHomePromos(config);
  if (fresh.pinkThursdayActive && !isExpired(fresh.pinkThursdayActiveUntil)) {
    return 'pink-thursday';
  }
  if (fresh.selloutDayActive && !isExpired(fresh.selloutActiveUntil)) {
    return 'sellout-day';
  }
  return 'default';
}

export type EffectivePrice = {
  current: number;
  was?: number;
  promoLabel?: string;
};

function findPromoPrice(
  productId: string,
  list: PromoProductPrice[]
): PromoProductPrice | undefined {
  return list.find((p) => p.productId === productId);
}

export function getEffectivePrice(product: Product, config: HomePromoConfig): EffectivePrice {
  const theme = getActiveTheme(config);

  if (theme === 'pink-thursday') {
    const promo = findPromoPrice(product.id, config.pinkThursdayProducts);
    if (promo) {
      return {
        current: promo.promoPrice,
        was: promo.originalPrice,
        promoLabel: 'Pink Thursday',
      };
    }
  }

  if (theme === 'sellout-day') {
    const promo = findPromoPrice(product.id, config.selloutProducts);
    if (promo) {
      return {
        current: promo.promoPrice,
        was: promo.originalPrice,
        promoLabel: 'Sell-out',
      };
    }
  }

  return { current: product.sellingPrice };
}

export function getPinkThursdayPackages(
  config: HomePromoConfig,
  products: Product[] = []
): PinkThursdayPackage[] {
  if (getActiveTheme(config) !== 'pink-thursday') return [];
  return getValidPinkThursdayPackages(config.pinkThursdayPackages, products);
}

export function getActiveGlowTip(config: HomePromoConfig): GlowTip | null {
  const theme = getActiveTheme(config);
  const tips =
    theme === 'pink-thursday' && config.pinkThursdayTips.length
      ? config.pinkThursdayTips
      : config.glowTips;

  if (!tips.length || !config.showGlowTipPopup) return null;

  if (config.activeGlowTipId) {
    return tips.find((t) => t.id === config.activeGlowTipId) ?? tips[0];
  }

  const dayIndex = new Date().getDate() % tips.length;
  return tips[dayIndex];
}

export function cartUsesPromoPricing(
  cart: CartItem[],
  config: HomePromoConfig
): { subtotal: number; savings: number; packageApplied?: PinkThursdayPackage } {
  let subtotal = 0;
  let savings = 0;
  const theme = getActiveTheme(config);

  cart.forEach((item) => {
    const effective = getEffectivePrice(item.product, config);
    subtotal += effective.current * item.quantity;
    if (effective.was) {
      savings += (effective.was - effective.current) * item.quantity;
    }
  });

  if (theme === 'pink-thursday') {
    for (const pkg of config.pinkThursdayPackages) {
      const cartIds = cart.map((c) => c.product.id);
      const hasAll = pkg.productIds.every((id) => cartIds.includes(id));
      if (!hasAll || pkg.productIds.length !== 3) continue;

      const regularTotal = pkg.productIds.reduce((sum, id) => {
        const item = cart.find((c) => c.product.id === id);
        if (!item) return sum;
        return sum + getEffectivePrice(item.product, config).current * item.quantity;
      }, 0);

      if (regularTotal > pkg.packagePrice) {
        subtotal -= regularTotal - pkg.packagePrice;
        savings += regularTotal - pkg.packagePrice;
        return { subtotal, savings, packageApplied: pkg };
      }
    }
  }

  return { subtotal, savings };
}

export function pinkThursdayTimeLeft(config: HomePromoConfig): string | null {
  if (!config.pinkThursdayActive || !config.pinkThursdayActiveUntil) return null;
  const ms = new Date(config.pinkThursdayActiveUntil).getTime() - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export function selloutTimeLeft(config: HomePromoConfig): string | null {
  if (!config.selloutDayActive || !config.selloutActiveUntil) return null;
  const ms = new Date(config.selloutActiveUntil).getTime() - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m left`;
}
