import { CartItem, PaymentMethod } from '../types';
import { BRAND } from '../constants/brand';
import { getBraidStyle } from './braidFilters';

/** Shop WhatsApp: 0752520441 */
export const SHOP_WHATSAPP_INTL = '254752520441';
export const SHOP_WHATSAPP_DISPLAY = '0752520441';

export function generateOrderNumber(): string {
  return `BLU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function whatsappUrl(message: string, phone = SHOP_WHATSAPP_INTL): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppOrderInput {
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

function formatItemLine(item: CartItem): string {
  const lineTotal = item.product.sellingPrice * item.quantity;
  let line = `• ${item.quantity}x ${item.product.name} — KSh ${lineTotal.toLocaleString()}`;
  const style = getBraidStyle(item.product);
  const extras: string[] = [];
  if (item.product.brand) extras.push(item.product.brand);
  if (style) extras.push(style);
  if (item.product.colorNumber) extras.push(`#${item.product.colorNumber}`);
  if (extras.length) line += ` _(${extras.join(' · ')})_`;
  return line;
}

export function buildWhatsAppOrderMessage(input: WhatsAppOrderInput): string {
  const placedAt = new Date().toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  let msg = `${BRAND.whatsappGreeting} 💖\n`;
  msg += `*New web order — please confirm & negotiate:*\n\n`;
  msg += `📋 *Order:* ${input.orderNumber}\n`;
  msg += `📅 *Placed:* ${placedAt}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `👤 *Customer Details*\n`;
  msg += `Name: ${input.customerName}\n`;
  msg += `Phone: ${input.customerPhone}\n`;
  msg += `Location: ${input.location}\n`;
  msg += `Delivery date: ${input.deliveryDate}\n\n`;
  msg += `🛍️ *Order Items*\n`;
  input.cart.forEach((item) => {
    msg += `${formatItemLine(item)}\n`;
  });
  msg += `\n💰 *Summary*\n`;
  msg += `Subtotal: KSh ${input.subtotal.toLocaleString()}\n`;
  if (input.discount > 0) {
    msg += `Discount: -KSh ${input.discount.toLocaleString()}\n`;
  }
  msg += `*Total: KSh ${input.total.toLocaleString()}*\n`;
  msg += `Payment: ${input.paymentMethod}\n\n`;
  msg += `📎 *PDF receipt* has been generated — please attach it to this chat.\n\n`;
  msg += `💬 _Sent from ${BRAND.systemName} web shop. Ready to confirm, negotiate price/delivery, and arrange M-Pesa payment._`;

  return msg;
}

export function openWhatsAppOrder(input: WhatsAppOrderInput): void {
  const message = buildWhatsAppOrderMessage(input);
  window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
}

/** Open chat with customer (admin follow-up). */
export function openCustomerWhatsApp(phone: string, message?: string): void {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('254') ? digits : digits.startsWith('0') ? `254${digits.slice(1)}` : `254${digits}`;
  const url = message ? whatsappUrl(message, intl) : `https://wa.me/${intl}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
