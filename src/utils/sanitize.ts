const MAX_NAME = 80;
const MAX_COUNTY = 60;
const MAX_PHONE = 20;
const MAX_ORDER_REF = 32;

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
