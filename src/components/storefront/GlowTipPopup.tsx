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

  const styles =
    theme === 'pink-thursday'
      ? 'bg-gradient-to-r from-pink-600 via-pink-500 to-amber-500 border-amber-300/40'
      : theme === 'sellout-day'
      ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-pink-500 border-white/30'
      : 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-300/40';

  return (
    <AnimatePresence>
      {tip && visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`relative z-30 text-white border-b ${styles}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
            <span className="text-xl shrink-0">{tip.emoji ?? '✨'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/80 flex items-center gap-1">
                <Sparkles size={10} /> Glow reminder
              </p>
              <p className="font-bold text-sm">{tip.title}</p>
              <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{tip.message}</p>
            </div>
            <button
              onClick={dismiss}
              className="shrink-0 p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss tip"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
