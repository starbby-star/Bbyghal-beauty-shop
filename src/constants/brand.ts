/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BRAND = {
  systemName: 'BLUMERA',
  tagline: '#Glow and Grow',
  shopName: 'Bbyghal beauty shop',
  motto: 'Glow in and out.',
  whatsappGreeting: 'Hello Bbyghal!',
  whatsappDisplay: '0752520441',
  whatsappIntl: '254752520441',
  email: 'blumeraglowandgrow@gmail.com',
  location: 'Mururui, Kenya',
  instagram: '@blumera',
  tiktok: '@blumera',
  businessHours: {
    weekdays: 'Monday – Friday: 8:00 AM – 6:00 PM',
    saturday: 'Saturday: 9:00 AM – 5:00 PM',
    sunday: 'Sunday & Public Holidays: Closed',
  },
} as const;

export const INTEREST_OPTIONS = [
  { id: 'hair', label: 'Wigs & Hair', emoji: '💇', page: 'shop' as const, category: 'Hair' as const },
  { id: 'skincare', label: 'Skincare', emoji: '🧴', page: 'shop' as const, category: 'Skincare' as const },
  { id: 'braids', label: 'Braids', emoji: '🎀', page: 'braids' as const },
  { id: 'makeup', label: 'Makeup', emoji: '💄', page: 'shop' as const, category: 'Makeup' as const },
  { id: 'perfumes', label: 'Perfumes', emoji: '🌺', page: 'shop' as const, category: 'Perfumes' as const },
];

export type StorePage = 'home' | 'shop' | 'braids' | 'about' | 'contact';
