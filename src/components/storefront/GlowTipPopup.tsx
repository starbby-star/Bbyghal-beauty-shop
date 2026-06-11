import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { GlowTip } from '../../types';

const DISMISS_KEY = 'blumera_glow_tip_dismissed';

interface GlowTipPopupProps {
  tip: GlowTip | null;
  theme?: 'default' | 'pink-thursday' | 'sellout-day';
}

export default function GlowTipPopup({ tip, theme = 'default' }: GlowTipPopupProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!tip) return;
    try {
      const dismissed = sessionStorage.getItem(`${DISMISS_KEY}-${tip.id}`);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, [tip?.id]);

  const dismiss = () => {
    setVisible(false);
    if (tip) {
      try {
        sessionStorage.setItem(`${DISMISS_KEY}-${tip.id}`, '1');
      } catch {
        /* ignore */
      }
    }
  };

  const cardClass =
    theme === 'pink-thursday'
      ? 'bg-gradient-to-br from-pink-600 to-amber-500 border-amber-300/50'
      : theme === 'sellout-day'
      ? 'bg-gradient-to-br from-amber-500 to-pink-500 border-white/40'
      : 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-300/50';

  return (
    <AnimatePresence>
      {tip && visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-[300px] z-[45]"
        >
          <div
            className={`${cardClass} text-white rounded-2xl shadow-xl border p-3.5 pr-9 relative`}
          >
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss glow reminder"
            >
              <X size={14} />
            </button>

            <div className="flex gap-2.5 items-start">
              <span className="text-lg shrink-0 leading-none mt-0.5">{tip.emoji ?? '✨'}</span>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-white/75 flex items-center gap-1 mb-0.5">
                  <Sparkles size={9} /> Glow reminder
                </p>
                <p className="font-bold text-xs leading-snug">{tip.title}</p>
                <p className="text-[11px] text-white/90 mt-1 leading-relaxed line-clamp-3">
                  {tip.message}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
