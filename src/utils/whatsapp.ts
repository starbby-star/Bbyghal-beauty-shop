import { CartItem, OrderServiceType, PaymentMethod } from '../types';
import { BRAND } from '../constants/brand';
import { DeliveryEstimate } from './delivery';
import {
  sanitizeCustomerName,
  sanitizeCounty,
  sanitizeOrderRef,
  sanitizePhone,
} from './sanitize';

/** Shop WhatsApp: 0752520441 */
export const SHOP_WHATSAPP_INTL = '254752520441';
export const SHOP_WHATSAPP_DISPLAY = '0752520441';

export function generateOrderNumber(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `BLU-${suffix}`;
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
  deliveryFee?: number;
  deliveryEstimate?: DeliveryEstimate;
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

function safeOrderInput(input: WhatsAppOrderInput): WhatsAppOrderInput {
  return {
    ...input,
    orderNumber: sanitizeOrderRef(input.orderNumber),
    customerName: sanitizeCustomerName(input.customerName),
    customerPhone: sanitizePhone(input.customerPhone),
    county: sanitizeCounty(input.county),
  };
}

/** Message from buyer to admin — conversational order text */
export function buildWhatsAppOrderMessage(input: WhatsAppOrderInput): string {
  const safe = safeOrderInput(input);
  const firstName = safe.customerName.split(/\s+/)[0];
  const dateLabel = new Date(safe.deliveryDate).toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let msg = `Hey! My name is ${safe.customerName}.\n\n`;
  msg += `I selected:\n`;
  msg += `${formatItemsList(safe.lineItems)}\n\n`;
  msg += `Required on: ${dateLabel}\n`;
  msg += `I am in: ${safe.county}\n`;
  msg += `Service: ${serviceTypeLabel(safe.serviceType)}\n`;
  msg += `Payment: ${safe.paymentMethod}\n\n`;
  msg += `My WhatsApp: ${safe.customerPhone}\n`;
  msg += `Order ref: ${safe.orderNumber}\n\n`;
  if (safe.discount > 0) {
    msg += `Subtotal: KSh ${safe.subtotal.toLocaleString()}\n`;
    msg += `Discount: -KSh ${safe.discount.toLocaleString()}\n`;
  }
  if (safe.serviceType === 'payment_delivery' && safe.deliveryEstimate) {
    const d = safe.deliveryEstimate;
    msg += `Delivery (${d.rangeLabel}): est. KSh ${d.amount.toLocaleString()} — *negotiable*\n`;
    msg += `_${d.note}_\n`;
  }
  msg += `*Total (incl. est. delivery): KSh ${safe.total.toLocaleString()}*\n\n`;
  msg += `Please confirm my order and delivery fee, ${firstName} — ready to pay and receive. Thank you! ✨`;

  return msg;
}

/** Receipt text for the buyer (save to their WhatsApp after payment / confirmation) */
export function buildBuyerReceiptMessage(input: WhatsAppOrderInput): string {
  const safe = safeOrderInput(input);
  const dateLabel = new Date(safe.deliveryDate).toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let msg = `${BRAND.systemName} — Order Receipt ✨\n`;
  msg += `Order: ${safe.orderNumber}\n`;
  msg += `Date: ${new Date().toLocaleString('en-KE')}\n\n`;
  msg += `Hi ${safe.customerName},\n\n`;
  msg += `Your order summary:\n\n`;
  msg += `${formatItemsList(safe.lineItems)}\n\n`;
  if (safe.discount > 0) {
    msg += `Subtotal: KSh ${safe.subtotal.toLocaleString()}\n`;
    msg += `Discount: -KSh ${safe.discount.toLocaleString()}\n`;
  }
  if (safe.serviceType === 'payment_delivery' && safe.deliveryEstimate) {
    const d = safe.deliveryEstimate;
    msg += `Delivery (${d.rangeLabel}): est. KSh ${d.amount.toLocaleString()} (negotiable)\n`;
  }
  msg += `*Total: KSh ${safe.total.toLocaleString()}*\n\n`;
  msg += `Required on: ${dateLabel}\n`;
  msg += `County: ${safe.county}\n`;
  msg += `Service: ${serviceTypeLabel(safe.serviceType)}\n`;
  msg += `Payment: ${safe.paymentMethod}\n`;
  if (safe.serviceType === 'payment_delivery' && safe.deliveryEstimate) {
    msg += `\n${safe.deliveryEstimate.note}\n`;
  }
  msg += `\nPay and share your M-Pesa confirmation with ${BRAND.systemName} on ${BRAND.whatsappDisplay}.\n`;
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
