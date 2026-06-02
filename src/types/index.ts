export type BraidStyle = 'Box Braid' | 'Knotless Braid' | 'Senegalese Twist' | 'Cornrows' | 'Faux Locs' | 'Goddess Braid';
export type BraidLength = 'Short' | 'Medium' | 'Long' | 'Extra Long';

export interface BraidVariant {
  id: string;
  colorNumber: string;
  colorName?: string;
  pieces?: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sellerId: string;
  firstPrice: number;
  lastPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isFixedPrice: boolean;
  imageUrl?: string;
  createdAt: string;
  braidStyle?: BraidStyle;
  braidType?: BraidStyle;
  braidLength?: BraidLength;
  shortDescription?: string;
  braidVariants?: BraidVariant[];
}
