import { BRAND } from '../../constants/brand';
import WhatsAppIcon from './WhatsAppIcon';

interface ConnectButtonProps {
  className?: string;
  href?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function ConnectButton({ className = '', href, onClick, size = 'md' }: ConnectButtonProps) {
  const base = `sf-connect-btn inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all ${sizes[size]} ${className}`;
  const content = (
    <>
      <WhatsAppIcon size={size === 'sm' ? 16 : 20} />
      Connect
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {content}
      </button>
    );
  }

  return (
    <a
      href={href ?? `https://wa.me/${BRAND.whatsappIntl}`}
      target="_blank"
      rel="noreferrer"
      className={base}
    >
      {content}
    </a>
  );
}
