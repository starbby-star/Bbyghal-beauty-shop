import { jsPDF } from 'jspdf';
import { CartItem, PaymentMethod } from '../types';
import { BRAND } from '../constants/brand';
import { getBraidStyle } from './braidFilters';

export interface ReceiptInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  location: string;
  deliveryDate: string;
  paymentMethod: PaymentMethod;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export function generateReceiptPdf(input: ReceiptInput): Blob {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const line = (text: string, size = 10, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, margin, y);
    y += size * 0.5 + 4;
  };

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 20, 147);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(BRAND.systemName, margin, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(BRAND.tagline, margin, 28);
  doc.text(BRAND.shopName, margin, 35);

  y = 52;
  doc.setTextColor(0, 0, 0);
  line('ORDER RECEIPT', 14, true);
  line(`Order: ${input.orderNumber}`, 11, true);
  line(`Date: ${new Date().toLocaleString('en-KE')}`, 9);
  y += 4;

  line('CUSTOMER', 11, true);
  line(`Name: ${input.customerName}`);
  line(`Phone: ${input.customerPhone}`);
  line(`Location: ${input.location}`);
  line(`Delivery: ${input.deliveryDate}`);
  y += 4;

  line('ITEMS', 11, true);
  input.cart.forEach((item) => {
    const total = item.product.sellingPrice * item.quantity;
    let desc = `${item.quantity}x ${item.product.name}`;
    const style = getBraidStyle(item.product);
    if (style) desc += ` (${style})`;
    line(desc, 9);
    line(`   KSh ${total.toLocaleString()}`, 9);
  });
  y += 4;

  line(`Subtotal: KSh ${input.subtotal.toLocaleString()}`, 10);
  if (input.discount > 0) line(`Discount: -KSh ${input.discount.toLocaleString()}`, 10);
  line(`TOTAL: KSh ${input.total.toLocaleString()}`, 12, true);
  line(`Payment: ${input.paymentMethod}`, 9);
  y += 8;

  doc.setTextColor(100, 100, 100);
  line(`${BRAND.systemName} · ${BRAND.motto}`, 8);
  line(`${BRAND.location} · ${BRAND.whatsappDisplay}`, 8);
  line('Thank you for shopping with us!', 9);

  return doc.output('blob');
}

export async function shareReceiptPdf(blob: Blob, orderNumber: string): Promise<'shared' | 'downloaded'> {
  const fileName = `BLUMERA-Receipt-${orderNumber}.pdf`;
  const file = new File([blob], fileName, { type: 'application/pdf' });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        text: `${BRAND.systemName} receipt for order ${orderNumber}. Please share to ${BRAND.whatsappDisplay}.`,
        title: `Receipt ${orderNumber}`,
      });
      return 'shared';
    } catch {
      /* download fallback */
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
