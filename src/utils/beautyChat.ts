import { HomePromoConfig } from '../types';
import { PublicProduct } from './productPublic';
import { getActiveTheme, getEffectivePrice, pinkThursdayTimeLeft, selloutTimeLeft } from './homePromos';
import { BRAND } from '../constants/brand';

const CATEGORY_ADVICE: Record<string, string> = {
  Skincare:
    'For skincare, cleanse gently, moisturize daily, and use SPF. Vitamin C serums brighten; retinol helps at night. Patch-test new products first!',
  Facial:
    'Facial products target specific concerns — serums for brightening, masks for deep care. Use consistently for 2–4 weeks to see results.',
  Hair:
    'Wigs and hair pieces need gentle brushing, satin storage, and occasional conditioning. Match cap size and style to your face shape for the best look.',
  Braids:
    'Choose braid length and style for your lifestyle — knotless for comfort, box braids for volume. Moisturize your scalp while wearing braids.',
  Makeup:
    'Start with primer and matching foundation undertone. Blend well, set with powder or spray, and remove makeup fully before bed.',
  Perfumes:
    'Apply perfume on pulse points — wrists, neck, behind ears. Layer with unscented lotion for longer wear. Store away from heat and sunlight.',
  Soaps:
    'Use gentle soaps for daily cleansing. Avoid over-washing dry skin; follow with moisturizer to lock in hydration.',
  Nails:
    'Keep nails clean and moisturized. Use a base coat, two thin color layers, and top coat for lasting manicures.',
  Body:
    'Body care loves consistency — exfoliate 1–2× weekly, moisturize after showering, and stay hydrated for soft, glowing skin.',
};

const GLOW_TIPS = [
  'Drink plenty of water — hydrated skin glows naturally!',
  'Never skip sunscreen, even indoors near windows.',
  'Remove makeup before bed so your skin can breathe and repair.',
  'Sleep 7–8 hours — rest is part of your beauty routine.',
  'Eat colourful fruits and veggies for vitamins that support healthy skin and hair.',
  'Be kind to yourself — confidence is your best beauty product!',
];

export function getBeautyResponse(
  query: string,
  products: PublicProduct[],
  promoConfig: HomePromoConfig
): string | null {
  const lower = query.toLowerCase();
  const inStock = products.filter((p) => p.stockQuantity > 0);
  const theme = getActiveTheme(promoConfig);

  if (lower.includes('pink thursday')) {
    if (theme === 'pink-thursday') {
      const left = pinkThursdayTimeLeft(promoConfig);
      const pkgCount = promoConfig.pinkThursdayPackages.length;
      return `It's Pink Thursday at ${BRAND.systemName}! ✨ Pink & gold deals are live${left ? ` (${left})` : ''}. ${pkgCount > 0 ? `We have ${pkgCount} special 3-in-1 package${pkgCount > 1 ? 's' : ''} — 3 products from different categories at one combined price!` : 'Check the home page for special prices!'}`;
    }
    return `Pink Thursday is our special weekly glow day with pink & gold deals and package bundles! Follow us to catch the next one — it runs for 24 hours when active.`;
  }

  if (lower.includes('sellout') || lower.includes('sell out') || lower.includes('sell-out')) {
    if (theme === 'sellout-day') {
      const left = selloutTimeLeft(promoConfig);
      const count = promoConfig.selloutProducts.length;
      return `Sell-out day is ON! 🔥 ${count} product${count !== 1 ? 's' : ''} at reduced prices${left ? ` — ${left}` : ''}. Look for "was / now" prices on the home page!`;
    }
    return 'Sell-out days feature limited-time price drops on selected products. Watch the top banner on our home page for when the next sell-out goes live!';
  }

  if (lower.includes('glow') || lower.includes('healthy') || lower.includes('self care') || lower.includes('self-care')) {
    const tip = GLOW_TIPS[Math.floor(Math.random() * GLOW_TIPS.length)];
    return `✨ Glow tip: ${tip}`;
  }

  if (lower.includes('wig') || lower.includes('hair')) {
    const wigs = inStock.filter((p) => p.category === 'Hair').slice(0, 3);
    const advice = CATEGORY_ADVICE.Hair;
    if (wigs.length) {
      const list = wigs.map((p) => `• ${p.name} (${p.brand}) — KSh ${getEffectivePrice(p, promoConfig).current.toLocaleString()}`).join('\n');
      return `${advice}\n\nWe have:\n${list}\n\nVisit Shop → Hair to see more!`;
    }
    return advice;
  }

  if (lower.includes('skincare') || lower.includes('serum') || lower.includes('skin')) {
    const items = inStock.filter((p) => ['Skincare', 'Facial'].includes(p.category)).slice(0, 3);
    const advice = CATEGORY_ADVICE.Skincare;
    if (items.length) {
      const list = items.map((p) => `• ${p.name} — KSh ${getEffectivePrice(p, promoConfig).current.toLocaleString()}`).join('\n');
      return `${advice}\n\nTry these:\n${list}`;
    }
    return advice;
  }

  if (lower.includes('braid')) {
    const braids = inStock.filter((p) => p.category === 'Braids').slice(0, 3);
    const advice = CATEGORY_ADVICE.Braids;
    if (braids.length) {
      const list = braids.map((p) => `• ${p.name} (${p.brand}) — KSh ${getEffectivePrice(p, promoConfig).current.toLocaleString()}`).join('\n');
      return `${advice}\n\nIn stock:\n${list}\n\nBrowse Braids to filter by brand, style & length!`;
    }
    return advice;
  }

  if (lower.includes('makeup') || lower.includes('foundation') || lower.includes('lipstick')) {
    return CATEGORY_ADVICE.Makeup;
  }

  if (lower.includes('perfume') || lower.includes('fragrance') || lower.includes('scent')) {
    const perfumes = inStock.filter((p) => p.category === 'Perfumes').slice(0, 3);
    if (perfumes.length) {
      const list = perfumes.map((p) => `• ${p.name} — KSh ${getEffectivePrice(p, promoConfig).current.toLocaleString()}`).join('\n');
      return `${CATEGORY_ADVICE.Perfumes}\n\nAvailable:\n${list}`;
    }
    return CATEGORY_ADVICE.Perfumes;
  }

  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should')) {
    const picks = [...inStock].sort(() => Math.random() - 0.5).slice(0, 3);
    if (!picks.length) return 'Browse our Shop for wigs, skincare, makeup, and more!';
    const list = picks.map((p) => `• ${p.name} (${p.category}) — KSh ${getEffectivePrice(p, promoConfig).current.toLocaleString()}`).join('\n');
    return `Here are some picks I love for you:\n${list}\n\nWant something specific? Ask about skincare, wigs, braids, or makeup!`;
  }

  const matched = inStock.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.brand.toLowerCase()) ||
      p.name.toLowerCase().split(' ').some((w) => w.length > 3 && lower.includes(w))
  );

  if (matched) {
    const price = getEffectivePrice(matched, promoConfig);
    let reply = `**${matched.name}** by ${matched.brand}\n`;
    reply += `Category: ${matched.category}\n`;
    if (price.was) {
      reply += `Price: was KSh ${price.was.toLocaleString()}, now **KSh ${price.current.toLocaleString()}** (${price.promoLabel}!)\n`;
    } else {
      reply += `Price: KSh ${price.current.toLocaleString()}\n`;
    }
    if (matched.shortDescription) reply += `\n${matched.shortDescription}`;
    else if (matched.bestUsedBy) reply += `\nGreat for: ${matched.bestUsedBy}`;
    if (matched.howToUse) reply += `\nHow to use: ${matched.howToUse}`;
    if (matched.resultsAfter) reply += `\nResults: ${matched.resultsAfter}`;
    reply += `\n\n${matched.stockQuantity} in stock — add to cart or ask me about similar products!`;
    return reply;
  }

  for (const [cat, advice] of Object.entries(CATEGORY_ADVICE)) {
    if (lower.includes(cat.toLowerCase())) {
      const catProducts = inStock.filter((p) => p.category === cat).slice(0, 2);
      if (catProducts.length) {
        const list = catProducts.map((p) => `• ${p.name} — KSh ${getEffectivePrice(p, promoConfig).current.toLocaleString()}`).join('\n');
        return `${advice}\n\nFrom our ${cat} range:\n${list}`;
      }
      return advice;
    }
  }

  return null;
}
