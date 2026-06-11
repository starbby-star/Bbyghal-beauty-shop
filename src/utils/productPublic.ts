import { Product } from '../types';

/** Storefront-safe product — no wholesale / FIFO cost data. */
export interface PublicProduct {
  id: string;
  name: string;
  brand: string;
  category: Product['category'];
  sellerId: string;
  sellingPrice: number;
  stockQuantity: number;
  isFixedPrice: boolean;
  imageUrl?: string;
  createdAt: string;
  shortDescription?: string;
  fullDescription?: string;
  ingredients?: string;
  howToUse?: string;
  rating?: number;
  reviewsCount?: number;
  bestUsedBy?: string;
  bestUsedWhen?: string;
  bestUsedWith?: string;
  resultsAfter?: string;
  braidStyle?: string;
  braidLength?: string;
  braidType?: string;
  colorNumber?: string;
}

export function toPublicProduct(product: Product): PublicProduct {
  const {
    firstPrice: _fp,
    lastPrice: _lp,
    stockUpdates: _su,
    ...rest
  } = product;
  return rest;
}

export function toPublicProducts(products: Product[]): PublicProduct[] {
  return products.map(toPublicProduct);
}

/** Admin/inventory: resolve full product from internal list by id. */
export function findProductById(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
