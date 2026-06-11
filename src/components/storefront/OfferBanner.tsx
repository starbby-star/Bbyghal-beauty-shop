import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { HOME_OFFERS } from '../../constants/home';
import { StorePage } from '../../constants/brand';

const DISMISS_KEY = 'blumera_offer_banner_dismissed';

interface OfferBannerProps {
  onNavigate: (page: StorePage) => void;
}

export default function OfferBanner({ onNavigate }: OfferBannerProps) {
  const [dismissed, setDismissed] = React.useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % HOME_OFFERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  const offer = HOME_OFFERS[index];

  return (
    <div className="relative z-40 bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBIMzBWMzBIMFY0MFoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-40" />
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
