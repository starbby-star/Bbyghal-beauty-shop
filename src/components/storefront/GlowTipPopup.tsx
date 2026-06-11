import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { GlowTip } from '../../types';
import { HomeTheme } from '../../types';

const DISMISS_KEY = 'blumera_glow_tip_dismissed';

interface GlowTipPopupProps {
  tip: GlowTip | null;
  theme?: HomeTheme;
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

  const accentEmoji = theme === 'pink-thursday' ? '✨' : theme === 'sellout-day' ? '🔥' : '💫';

  return (
    <AnimatePresence>
      {tip && visible && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="fixed top-[4.75rem] sm:top-[5.25rem] left-1/2 -translate-x-1/2 z-[45] w-[min(100%-2rem,340px)]"
        >
          <div className="glow-popup-card text-white rounded-2xl p-4 pr-10 relative overflow-hidden">
            {/* decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-2xl pointer-events-none" />

            <button
              onClick={dismiss}
              className="absolute top-2.5 right-2.5 p-1 hover:bg-white/15 rounded-full transition-colors z-10"
              aria-label="Dismiss glow reminder"
            >
              <X size={15} />
            </button>

            <div className="text-center mb-2">
              <span className="text-2xl">{tip.emoji ?? accentEmoji}</span>
              <p className="glow-popup-title text-amber-200/90 text-sm tracking-wide mt-1">
                Glow · Reminder
              </p>
            </div>

            <p className="glow-popup-title text-lg text-white text-center leading-snug mb-2">
              {tip.title}
            </p>
            <p className="glow-popup-message text-center text-white/85 italic">
              &ldquo;{tip.message}&rdquo;
            </p>

            <p className="text-[9px] text-center text-white/40 uppercase tracking-[0.2em] mt-3 font-sans">
              BLUMERA
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
