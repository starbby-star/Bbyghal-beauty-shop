/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'staff';
export type PaymentMethod = 'Cash' | 'Mpesa';
export type PaymentStatus = 'Paid' | 'Deposit' | 'Debt';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  displayName: string;
}

export interface Seller {
  id: string;
  name: string;
  productName: string;
  amount: number;
  contact?: string;
  whatsappNumber?: string;
  address?: string;
  dateAdded?: string;
}

export type Category = 'All' | 'Soaps' | 'Facial' | 'Hair' | 'Braids' | 'Makeup' | 'Skincare' | 'Perfumes' | 'Nails' | 'Body' | 'Accessories' | 'Other';

/** A single stock intake batch — oldest batch sells first (FIFO). */
export interface StockBatch {
  date: string;
  quantity: number;
  addedBy: string;
  buyingPrice: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string; // e.g., Dr Rashel
  category: Category;
  sellerId: string;
  firstPrice: number; // Original buying price
  lastPrice: number;  // Most recent buying price
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
  // New fields for product notes
  bestUsedBy?: string; // Solution it solves
  bestUsedWhen?: string; // At night or in day
  bestUsedWith?: string; // What you can use together with
  resultsAfter?: string; // Timeframe for results (e.g., a month, a week)
  // Braid-specific fields
  braidStyle?: string; // Box Braid, Knotless, Locs, etc.
  braidLength?: string; // Short, Medium, Long, Extra Long
  /** @deprecated Use braidStyle — kept for older products */
  braidType?: string;
  colorNumber?: string; // e.g., 1, 33, 27, 1/900
  stockUpdates?: StockBatch[];
}

export interface RequestedProduct {
  id: string;
  name: string;
  requestedBy: string;
  dateRequested: string;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  sellingPrice: number;
  buyingPrice: number;
  profit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  debtAmount: number;
  staffId: string;
  staffName: string;
  sellerName: string; // The agent/seller name (e.g., Risper, Milka)
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  createdAt: string;
  clearedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
