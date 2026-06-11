import { CartItem, OrderServiceType, PaymentMethod } from '../types';
import { BRAND } from '../constants/brand';
import { getBraidStyle } from './braidFilters';

/** Shop WhatsApp: 0752520441 */
export const SHOP_WHATSAPP_INTL = '254752520441';
export const SHOP_WHATSAPP_DISPLAY = '0752520441';

export function generateOrderNumber(): string {
  return `BLU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function normalizePhoneIntl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return `254${digits}`;
}

export function whatsappUrl(message: string, phone = SHOP_WHATSAPP_INTL): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface OrderLineItem {
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
}

export interface WhatsAppOrderInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  county: string;
  deliveryDate: string;
  paymentMethod: PaymentMethod;
  serviceType: OrderServiceType;
  lineItems: OrderLineItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export function serviceTypeLabel(type: OrderServiceType): string {
  return type === 'payment_delivery' ? 'Payment + Delivery' : 'Payment only';
}

function formatItemLine(item: OrderLineItem): string {
  const lineTotal = item.unitPrice * item.quantity;
  return `• ${item.name} (${item.brand}) — qty ${item.quantity} × KSh ${item.unitPrice.toLocaleString()} = KSh ${lineTotal.toLocaleString()}`;
}

function formatItemsList(items: OrderLineItem[]): string {
  return items.map(formatItemLine).join('\n');
}

/** Message from buyer to admin — conversational order text */
export function buildWhatsAppOrderMessage(input: WhatsAppOrderInput): string {
  const firstName = input.customerName.trim().split(/\s+/)[0];
  const dateLabel = new Date(input.deliveryDate).toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let msg = `Hey! My name is ${input.customerName}.\n\n`;
  msg += `I selected:\n`;
  msg += `${formatItemsList(input.lineItems)}\n\n`;
  msg += `Required on: ${dateLabel}\n`;
  msg += `I am in: ${input.county}\n`;
  msg += `Service: ${serviceTypeLabel(input.serviceType)}\n`;
  msg += `Payment: ${input.paymentMethod}\n\n`;
  msg += `My WhatsApp: ${input.customerPhone}\n`;
  msg += `Order ref: ${input.orderNumber}\n\n`;
  if (input.discount > 0) {
    msg += `Subtotal: KSh ${input.subtotal.toLocaleString()}\n`;
    msg += `Discount: -KSh ${input.discount.toLocaleString()}\n`;
  }
  msg += `*Total: KSh ${input.total.toLocaleString()}*\n\n`;
  msg += `Please confirm my order, ${firstName} — ready to pay and receive. Thank you! ✨`;

  return msg;
}

/** Receipt text for the buyer (save to their WhatsApp after payment / confirmation) */
export function buildBuyerReceiptMessage(input: WhatsAppOrderInput): string {
  const dateLabel = new Date(input.deliveryDate).toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let msg = `${BRAND.systemName} — Order Receipt ✨\n`;
  msg += `Order: ${input.orderNumber}\n`;
  msg += `Date: ${new Date().toLocaleString('en-KE')}\n\n`;
  msg += `Hi ${input.customerName},\n\n`;
  msg += `Your order summary:\n\n`;
  msg += `${formatItemsList(input.lineItems)}\n\n`;
  if (input.discount > 0) {
    msg += `Subtotal: KSh ${input.subtotal.toLocaleString()}\n`;
    msg += `Discount: -KSh ${input.discount.toLocaleString()}\n`;
  }
  msg += `*Total: KSh ${input.total.toLocaleString()}*\n\n`;
  msg += `Required on: ${dateLabel}\n`;
  msg += `County: ${input.county}\n`;
  msg += `Service: ${serviceTypeLabel(input.serviceType)}\n`;
  msg += `Payment: ${input.paymentMethod}\n\n`;
  msg += `Pay and share your M-Pesa confirmation with ${BRAND.systemName} on ${BRAND.whatsappDisplay}.\n`;
  msg += `Your receipt will be confirmed after payment.\n\n`;
  msg += `${BRAND.motto} — ${BRAND.shopName}`;

  return msg;
}

export function cartToLineItems(
  cart: CartItem[],
  getUnitPrice: (productId: string) => number
): OrderLineItem[] {
  return cart.map((item) => ({
    name: item.product.name,
    brand: item.product.brand,
    quantity: item.quantity,
    unitPrice: getUnitPrice(item.product.id),
  }));
}

/** Opens WhatsApp to admin with the buyer's order message */
export function openWhatsAppOrderToAdmin(input: WhatsAppOrderInput): void {
  const message = buildWhatsAppOrderMessage(input);
  window.open(whatsappUrl(message, SHOP_WHATSAPP_INTL), '_blank', 'noopener,noreferrer');
}

/** Opens WhatsApp on the buyer's number with their receipt text (message yourself / save receipt) */
export function openBuyerReceiptWhatsApp(customerPhone: string, input: WhatsAppOrderInput): void {
  const message = buildBuyerReceiptMessage(input);
  const intl = normalizePhoneIntl(customerPhone);
  window.open(whatsappUrl(message, intl), '_blank', 'noopener,noreferrer');
}

/** Open chat with customer (admin follow-up). */
export function openCustomerWhatsApp(phone: string, message?: string): void {
  const intl = normalizePhoneIntl(phone);
  const url = message ? whatsappUrl(message, intl) : `https://wa.me/${intl}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
