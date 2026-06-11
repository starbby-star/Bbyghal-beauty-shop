const MAX_NAME = 80;
const MAX_COUNTY = 60;
const MAX_PHONE = 20;
const MAX_ORDER_REF = 32;
const MAX_TEXT = 200;

const ALLOWED_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'picsum.photos',
  'deiycrewvqvbgisrbglu.supabase.co',
]);

/** Strip control chars and newlines — prevents WhatsApp message spoofing. */
export function sanitizeSingleLine(value: string, maxLen: number): string {
  return value
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeCustomerName(name: string): string {
  return sanitizeSingleLine(name, MAX_NAME);
}

export function sanitizeCounty(county: string): string {
  return sanitizeSingleLine(county, MAX_COUNTY);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\s-]/g, '').trim().slice(0, MAX_PHONE);
}

export function sanitizeOrderRef(ref: string): string {
  return sanitizeSingleLine(ref, MAX_ORDER_REF);
}

export function sanitizeProductText(value: string): string {
  return sanitizeSingleLine(value, MAX_TEXT);
}

export function isValidPhoneDigits(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

export function isHttpsImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Safe image URL for storefront — blocks javascript/data/http. */
export function sanitizeImageUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('data:')) return undefined;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:') return undefined;
    if (ALLOWED_IMAGE_HOSTS.size > 0 && !ALLOWED_IMAGE_HOSTS.has(u.hostname)) {
      return trimmed;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

export function safeImageUrl(
  url: string | undefined,
  fallback = 'https://picsum.photos/seed/blumera/400/400'
): string {
  return sanitizeImageUrl(url) ?? fallback;
}
