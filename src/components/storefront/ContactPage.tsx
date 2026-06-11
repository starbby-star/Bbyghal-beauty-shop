import { Phone, Mail, MapPin, Clock, Truck, Instagram } from 'lucide-react';
import { BRAND } from '../../constants/brand';
import ConnectButton from './ConnectButton';
import SocialScanCard from './SocialScanCard';

const TikTokIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-0 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">Contact Us</h2>
        <p className="text-gray-500">{BRAND.systemName} · {BRAND.shopName}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <a href={`tel:${BRAND.whatsappDisplay}`} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-pink-300 transition-all">
          <Phone className="sf-icon-accent mb-3" size={24} />
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Call / Text</p>
          <p className="font-bold text-gray-900 text-lg">{BRAND.whatsappDisplay}</p>
        </a>
        <a href={`mailto:${BRAND.email}`} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-pink-300 transition-all">
          <Mail className="sf-icon-accent mb-3" size={24} />
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Email</p>
          <p className="font-bold text-gray-900 text-sm break-all">{BRAND.email}</p>
        </a>
      </div>

      <div className="flex justify-center">
        <ConnectButton className="shadow-lg" size="lg" />
      </div>

      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="sf-icon-accent" size={20} /> Business Hours
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>🕒 {BRAND.businessHours.weekdays}</li>
          <li>🕒 {BRAND.businessHours.saturday}</li>
          <li>🕒 {BRAND.businessHours.sunday}</li>
        </ul>
      </div>

      <div className="bg-black text-white rounded-3xl p-8">
        <h3 className="font-bold mb-2 text-center">Follow Us</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Tap the link or scan to follow</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <SocialScanCard
            platform="Instagram"
            handle={BRAND.instagram.handle}
            url={BRAND.instagram.url}
            scanImage={BRAND.instagram.scanImage}
            icon={<Instagram size={18} />}
            accentClass="text-pink-400"
          />
          <SocialScanCard
            platform="TikTok"
            handle={BRAND.tiktok.handle}
            url={BRAND.tiktok.url}
            scanImage={BRAND.tiktok.scanImage}
            icon={<TikTokIcon />}
            accentClass="text-white"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Truck className="sf-icon-accent" size={20} /> Delivery Information
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          🚚 Countrywide delivery available across Kenya.<br />
          📦 Orders are processed promptly and customers receive updates throughout the delivery process.
        </p>
      </div>

      <div className="sf-callout-box border rounded-3xl p-8">
        <h3 className="font-bold text-gray-900 mb-3">Customer Support</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Need help choosing a wig, skincare product, or tracking an order? Our support team is ready to assist you
          with personalized recommendations and quick responses.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} className="sf-icon-accent" /> {BRAND.location}
        </div>
      </div>
    </div>
  );
}
