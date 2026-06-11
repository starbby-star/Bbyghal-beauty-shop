import React from 'react';

interface SocialScanCardProps {
  platform: string;
  handle: string;
  url: string;
  scanImage: string;
  icon: React.ReactNode;
  accentClass?: string;
}

function qrFallback(url: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(url)}`;
}

export default function SocialScanCard({
  platform,
  handle,
  url,
  scanImage,
  icon,
  accentClass = 'text-pink-400',
}: SocialScanCardProps) {
  const [qrSrc, setQrSrc] = React.useState(scanImage);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
      <div className={`flex items-center gap-2 mb-3 ${accentClass}`}>
        {icon}
        <span className="font-bold text-white">{platform}</span>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-pink-300 hover:text-pink-200 transition-colors mb-4 break-all"
      >
        {handle}
      </a>

      <div className="bg-white rounded-2xl p-3 mb-3 shadow-lg">
        <img
          src={qrSrc}
          alt={`${platform} scan code for ${handle}`}
          className="w-40 h-40 object-contain"
          onError={() => setQrSrc(qrFallback(url))}
        />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Scan me</p>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 text-[10px] text-gray-500 hover:text-pink-300 transition-colors break-all line-clamp-2"
      >
        {url.replace(/^https?:\/\//, '')}
      </a>
    </div>
  );
}
