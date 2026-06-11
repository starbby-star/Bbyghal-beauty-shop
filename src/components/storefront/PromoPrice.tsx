import type { EffectivePrice } from '../../utils/homePromos';

interface PromoPriceProps {
  price: EffectivePrice;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PromoPrice({ price, size = 'md', className = '' }: PromoPriceProps) {
  const sizes = {
    sm: { main: 'text-sm', was: 'text-[10px]', badge: 'text-[8px]' },
    md: { main: 'text-base', was: 'text-xs', badge: 'text-[9px]' },
    lg: { main: 'text-3xl', was: 'text-sm', badge: 'text-[10px]' },
  };
  const s = sizes[size];

  if (!price.was) {
    return <p className={`font-black ${s.main} ${className}`}>KSh {price.current.toLocaleString()}</p>;
  }

  return (
    <div className={className}>
      {price.promoLabel && (
        <span className={`sf-price-badge inline-block font-black uppercase tracking-wider ${s.badge} mb-0.5`}>
          {price.promoLabel}
        </span>
      )}
      <p className={`text-gray-400 line-through ${s.was}`}>Was KSh {price.was.toLocaleString()}</p>
      <p className={`sf-price-now font-black ${s.main}`}>Now KSh {price.current.toLocaleString()}</p>
    </div>
  );
}
