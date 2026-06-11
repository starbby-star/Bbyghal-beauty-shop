import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicProduct } from '../../utils/productPublic';

interface ProductSlideshowProps {
  products: PublicProduct[];
  intervalMs?: number;
}

export default function ProductSlideshow({ products, intervalMs = 4500 }: ProductSlideshowProps) {
  const slides = React.useMemo(
    () => products.filter((p) => p.stockQuantity > 0 && p.imageUrl).slice(0, 8),
    [products]
  );
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
    );
  }

  const current = slides[index];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={current.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-1.5 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === index ? 'w-8 bg-pink-500' : 'w-3 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
