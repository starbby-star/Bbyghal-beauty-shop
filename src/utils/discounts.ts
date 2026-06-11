import { CartItem, Product, Category } from '../types';

/** System bundle discount: KSh 20 when 3+ eligible items (web cart). */
export const BUNDLE_DISCOUNT_THREE_PLUS = 20;

/** Web storefront: KSh 10 when 2 eligible items (braids excluded). */
export const BUNDLE_DISCOUNT_TWO = 10;

const BRAIDS: Category = 'Braids';

export function isBraidsProduct(product: Product): boolean {
  return product.category === BRAIDS;
}

/** Count cart items eligible for bundle discount (excludes braids). */
export function eligibleBundleItemCount(cart: CartItem[]): number {
  return cart
    .filter((item) => !isBraidsProduct(item.product))
    .reduce((sum, item) => sum + item.quantity, 0);
}

/** Web / online cart bundle discount. Braids do not count toward the bundle. */
export function calcWebCartDiscount(cart: CartItem[]): number {
  const count = eligibleBundleItemCount(cart);
  if (count >= 3) return BUNDLE_DISCOUNT_THREE_PLUS;
  if (count >= 2) return BUNDLE_DISCOUNT_TWO;
  return 0;
}

/**
 * POS employee sales: no manual discounts.
 * System discount is 0 for single-item POS (bundle applies on web multi-item cart only).
 * Braids never receive bundle discount.
 */
export function calcPosEmployeeDiscount(_product: Product, _quantity: number): number {
  return 0;
}

/** Admin may apply manual discount on POS (optional override). */
export function calcPosAdminDiscount(manualDiscount: number, product: Product): number {
  if (isBraidsProduct(product)) return 0;
  return Math.max(0, manualDiscount);
}
