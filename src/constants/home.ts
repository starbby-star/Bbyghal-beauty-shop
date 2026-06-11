import { StorePage } from './brand';

export interface HomeOffer {
  id: string;
  emoji: string;
  text: string;
  highlight?: string;
  cta?: string;
  page?: StorePage;
}

export const HOME_OFFERS: HomeOffer[] = [
  {
    id: 'sellout',
    emoji: '🔥',
    text: 'Selling fast — grab sell-outs before they\'re gone!',
    highlight: 'Limited stock',
    cta: 'Shop sell-outs',
    page: 'shop',
  },
  {
    id: 'bundle',
    emoji: '💝',
    text: 'Buy 2 items save KSh 10 · Buy 3+ save KSh 20',
    highlight: 'Bundle deal',
    page: 'shop',
  },
  {
    id: 'delivery',
    emoji: '🚚',
    text: 'Countrywide delivery across Kenya — Mururui to everywhere',
    highlight: 'Free updates',
    page: 'contact',
  },
  {
    id: 'braids',
    emoji: '🎀',
    text: 'New braids in — Jibambe, Havana, X-Pression & more',
    highlight: 'Braids drop',
    cta: 'Browse braids',
    page: 'braids',
  },
  {
    id: 'connect',
    emoji: '✨',
    text: 'Order via Connect — PDF receipt & personal negotiation',
    highlight: 'Easy checkout',
    page: 'shop',
  },
];

export const HOME_TRUST_BADGES = [
  { emoji: '✨', label: 'Premium quality' },
  { emoji: '🚚', label: 'Countrywide delivery' },
  { emoji: '💬', label: 'Connect checkout' },
  { emoji: '💖', label: 'Glow & grow' },
] as const;

export const CHATBOT_GREETINGS = {
  newVisitor: 'Hi there! I\'m your BLUMERA beauty assistant. What can I help you find today?',
  returning: (name: string) =>
    `How are you, ${name}? Welcome back to BLUMERA! What are you interested in today?`,
};

export const CHATBOT_FAQ = [
  {
    id: 'offers',
    question: 'Any current offers?',
    answer: 'Buy 2 items and save KSh 10, or buy 3+ and save KSh 20! Check our sell-outs section for limited-stock deals.',
  },
  {
    id: 'delivery',
    question: 'Do you deliver?',
    answer: 'Yes! Payment + Delivery adds a fee from KSh 150–200 around Nairobi, or KSh 200–500 outside Nairobi depending on county and distance. The exact amount can be negotiated on Connect.',
  },
  {
    id: 'order',
    question: 'How do I order?',
    answer: 'Add items to your bag, enter your name and WhatsApp number, pick your county and date, then tap Send order to BLUMERA. Your order goes straight to us — save your receipt to your WhatsApp after you pay.',
  },
  {
    id: 'braids',
    question: 'Do you sell braids?',
    answer: 'Yes! Visit our Braids page to filter by brand, style, length, and color number.',
  },
  {
    id: 'contact',
    question: 'How can I reach you?',
    answer: 'Call or text 0752520441, email us, or use Connect on the Contact page. We\'re happy to help!',
  },
] as const;
