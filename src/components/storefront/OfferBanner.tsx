import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { HOME_OFFERS } from '../../constants/home';
import { StorePage } from '../../constants/brand';
import { HomePromoConfig } from '../../types';
import { getActiveTheme, pinkThursdayTimeLeft, selloutTimeLeft } from '../../utils/homePromos';

const DISMISS_KEY = 'blumera_offer_banner_dismissed';

interface OfferBannerProps {
  onNavigate: (page: StorePage) => void;
  homePromoConfig: HomePromoConfig;
}

export default function OfferBanner({ onNavigate, homePromoConfig }: OfferBannerProps) {
  const [dismissed, setDismissed] = React.useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [index, setIndex] = React.useState(0);

  const theme = getActiveTheme(homePromoConfig);

  const liveOffers = React.useMemo(() => {
    const extra = [...HOME_OFFERS];
    if (theme === 'pink-thursday') {
      extra.unshift({
        id: 'live-pink',
        emoji: '✨',
        text: `Pink Thursday is LIVE! ${pinkThursdayTimeLeft(homePromoConfig) ?? '24hr deals'} — packages & pink prices`,
        highlight: 'Pink Thursday',
        cta: 'Shop deals',
        page: 'home' as StorePage,
      });
    }
    if (theme === 'sellout-day') {
      extra.unshift({
        id: 'live-sellout',
        emoji: '🔥',
        text: `Sell-out day! ${homePromoConfig.selloutProducts.length} products at reduced was/now prices · ${selloutTimeLeft(homePromoConfig) ?? 'today only'}`,
        highlight: 'Sell-out',
        cta: 'Shop sell-outs',
        page: 'home' as StorePage,
      });
    }
    return extra;
  }, [theme, homePromoConfig]);

  React.useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % liveOffers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dismissed, liveOffers.length]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  const offer = liveOffers[index];

  return (
    <div className="sf-offer-banner relative z-40 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0"
          >
            <span className="text-lg shrink-0">{offer.emoji}</span>
            {offer.highlight && (
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                {offer.highlight}
              </span>
            )}
            <p className="text-xs sm:text-sm font-semibold truncate">{offer.text}</p>
          </motion.div>
        </AnimatePresence>

        {offer.page && (
          <button
            onClick={() => onNavigate(offer.page!)}
            className="shrink-0 flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
          >
            {offer.cta ?? 'View'} <ChevronRight size={14} />
          </button>
        )}

        <button
          onClick={dismiss}
          className="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss offers"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
