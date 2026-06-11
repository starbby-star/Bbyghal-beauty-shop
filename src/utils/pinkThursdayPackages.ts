import { PinkThursdayPackage, Product } from '../types';
import { getEffectivePrice } from './homePromos';
import { HomePromoConfig } from '../types';

export const PINK_THURSDAY_PACKAGE_SIZE = 3;

export function getPackageProducts(
  pkg: PinkThursdayPackage,
  products: Product[]
): Product[] {
  return pkg.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export function isCompletePinkThursdayPackage(
  pkg: PinkThursdayPackage,
  products: Product[]
): boolean {
  if (pkg.productIds.length !== PINK_THURSDAY_PACKAGE_SIZE || !pkg.packagePrice) {
    return false;
  }
  const prods = getPackageProducts(pkg, products);
  if (prods.length !== PINK_THURSDAY_PACKAGE_SIZE) return false;
  const categories = new Set(prods.map((p) => p.category));
  return categories.size === PINK_THURSDAY_PACKAGE_SIZE;
}

export function getPackageRegularTotal(
  pkg: PinkThursdayPackage,
  products: Product[],
  getPrice: (product: Product) => number
): number {
  return getPackageProducts(pkg, products).reduce(
    (sum, p) => sum + getPrice(p),
    0
  );
}

export function getPackageSavings(
  pkg: PinkThursdayPackage,
  products: Product[],
  getPrice: (product: Product) => number
): number {
  const regular = getPackageRegularTotal(pkg, products, getPrice);
  return Math.max(0, regular - pkg.packagePrice);
}

export function getValidPinkThursdayPackages(
  packages: PinkThursdayPackage[],
  products: Product[]
): PinkThursdayPackage[] {
  return packages.filter((pkg) => isCompletePinkThursdayPackage(pkg, products));
}

export function categoriesUsedInPackage(
  pkg: PinkThursdayPackage,
  products: Product[],
  excludeSlot?: number
): Set<string> {
  const used = new Set<string>();
  pkg.productIds.forEach((id, index) => {
    if (excludeSlot === index || !id) return;
    const p = products.find((x) => x.id === id);
    if (p) used.add(p.category);
  });
  return used;
}

export function productsAvailableForPackageSlot(
  pkg: PinkThursdayPackage,
  products: Product[],
  slotIndex: number,
  inStockOnly = true
): Product[] {
  const usedCategories = categoriesUsedInPackage(pkg, products, slotIndex);
  const usedIds = new Set(pkg.productIds.filter((_, i) => i !== slotIndex));

  return products.filter((p) => {
    if (inStockOnly && p.stockQuantity <= 0) return false;
    if (usedCategories.has(p.category)) return false;
    if (usedIds.has(p.id)) return false;
    return true;
  });
}

export function packagePriceLine(
  pkg: PinkThursdayPackage,
  products: Product[],
  config: HomePromoConfig
): { regular: number; packagePrice: number; savings: number } {
  const getPrice = (p: Product) => getEffectivePrice(p, config).current;
  const regular = getPackageRegularTotal(pkg, products, getPrice);
  const savings = Math.max(0, regular - pkg.packagePrice);
  return { regular, packagePrice: pkg.packagePrice, savings };
}
