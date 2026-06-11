import { Product, StockBatch } from '../types';

export const LOW_STOCK_THRESHOLD = 5;
export const HIGH_STOCK_THRESHOLD = 20;

export function formatBatchDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return dateStr.split('T')[0];
}

/** Normalize legacy batches that lack buyingPrice. */
export function normalizeBatches(product: Product): StockBatch[] {
  return (product.stockUpdates || []).map((batch) => ({
    ...batch,
    buyingPrice: batch.buyingPrice ?? product.lastPrice,
  }));
}

export interface FIFOResult {
  stockUpdates: StockBatch[];
  stockQuantity: number;
  /** Weighted average buying price of units consumed. */
  consumedBuyingPrice: number;
}

/**
 * Deduct quantity using FIFO — oldest batch is consumed first.
 * Returns updated batches, new stock total, and the cost basis for profit.
 */
export function deductStockFIFO(product: Product, quantity: number): FIFOResult {
  const batches = normalizeBatches(product).map((b) => ({ ...b }));
  let remaining = quantity;
  let totalCost = 0;
  let consumed = 0;

  while (remaining > 0 && batches.length > 0) {
    const oldest = batches[0];
    const take = Math.min(oldest.quantity, remaining);
    totalCost += take * oldest.buyingPrice;
    consumed += take;
    remaining -= take;

    if (take >= oldest.quantity) {
      batches.shift();
    } else {
      batches[0] = { ...oldest, quantity: oldest.quantity - take };
    }
  }

  const consumedBuyingPrice = consumed > 0 ? totalCost / consumed : product.lastPrice;

  return {
    stockUpdates: batches,
    stockQuantity: Math.max(0, product.stockQuantity - quantity),
    consumedBuyingPrice,
  };
}

export function applyStockAddition(
  product: Product,
  quantity: number,
  buyingPrice: number,
  addedBy: string,
  dateAdded: string
): Product {
  const isoDate = dateAdded.includes('T') ? dateAdded : `${dateAdded}T12:00:00.000Z`;
  const newBatch: StockBatch = {
    date: isoDate,
    quantity,
    addedBy,
    buyingPrice,
  };

  return {
    ...product,
    stockQuantity: product.stockQuantity + quantity,
    lastPrice: buyingPrice,
    stockUpdates: [...normalizeBatches(product), newBatch],
  };
}

export function createProductWithBatch(
  product: Omit<Product, 'stockUpdates' | 'stockQuantity'>,
  quantity: number,
  buyingPrice: number,
  addedBy: string,
  dateAdded: string
): Product {
  const isoDate = dateAdded.includes('T') ? dateAdded : `${dateAdded}T12:00:00.000Z`;
  return {
    ...product,
    stockQuantity: quantity,
    stockUpdates: [{ date: isoDate, quantity, addedBy, buyingPrice }],
  };
}
