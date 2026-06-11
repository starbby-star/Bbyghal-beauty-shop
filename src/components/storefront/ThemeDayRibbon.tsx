import { HomeTheme } from '../../types';
import { pinkThursdayTimeLeft, selloutTimeLeft } from '../../utils/homePromos';
import { HomePromoConfig } from '../../types';

interface ThemeDayRibbonProps {
  theme: HomeTheme;
  config: HomePromoConfig;
}

export default function ThemeDayRibbon({ theme, config }: ThemeDayRibbonProps) {
  if (theme === 'default') return null;

  const label =
    theme === 'pink-thursday'
      ? `✨ Pink Thursday${pinkThursdayTimeLeft(config) ? ` · ${pinkThursdayTimeLeft(config)}` : ''}`
      : `🔥 Sell-out Day${selloutTimeLeft(config) ? ` · ${selloutTimeLeft(config)}` : ''}`;

  return (
    <div className="sf-day-ribbon text-center py-1.5 text-[11px] font-black uppercase tracking-widest z-40 relative">
      {label}
    </div>
  );
}
