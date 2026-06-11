import { PublicProduct } from './productPublic';

export interface BraidFilterState {
  search: string;
  brand: string;
  customBrand: string;
  style: string;
  customStyle: string;
  length: string;
  colorNumber: string;
}

export const emptyBraidFilters = (): BraidFilterState => ({
  search: '',
  brand: '',
  customBrand: '',
  style: '',
  customStyle: '',
  length: '',
  colorNumber: '',
});

export function getBraidStyle(product: PublicProduct): string {
  return product.braidStyle || product.braidType || '';
}

export function isBraidProduct(product: PublicProduct): boolean {
  return product.category === 'Braids';
}

export function filterBraidProducts<T extends PublicProduct>(
  products: T[],
  filters: BraidFilterState,
  options?: { inStockOnly?: boolean }
): T[] {
  const inStockOnly = options?.inStockOnly ?? false;
  const search = filters.search.trim().toLowerCase();
  const brandFilter = filters.brand === '__custom__' ? filters.customBrand.trim() : filters.brand;
  const styleFilter = filters.style === '__custom__' ? filters.customStyle.trim() : filters.style;
  const colorFilter = filters.colorNumber.trim().toLowerCase();

  return products
    .filter((p) => {
      if (!isBraidProduct(p)) return false;
      if (inStockOnly && p.stockQuantity <= 0) return false;

      if (search) {
        const haystack = [p.name, p.brand, p.colorNumber || '', getBraidStyle(p)]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (brandFilter && !p.brand.toLowerCase().includes(brandFilter.toLowerCase())) {
        return false;
      }

      if (styleFilter) {
        const style = getBraidStyle(p).toLowerCase();
        if (!style.includes(styleFilter.toLowerCase())) return false;
      }

      if (filters.length && p.braidLength !== filters.length) return false;

      if (colorFilter && !(p.colorNumber || '').toLowerCase().includes(colorFilter)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = a.createdAt.split('T')[0];
      const dateB = b.createdAt.split('T')[0];
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return a.name.localeCompare(b.name);
    });
}

export function hasActiveBraidFilters(filters: BraidFilterState): boolean {
  return Boolean(
    filters.search ||
      filters.brand ||
      filters.customBrand ||
      filters.style ||
      filters.customStyle ||
      filters.length ||
      filters.colorNumber
  );
}
