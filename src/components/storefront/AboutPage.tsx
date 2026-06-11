import { MapPin, Truck, Sparkles } from 'lucide-react';
import { BRAND } from '../../constants/brand';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-0">
      <div className="text-center mb-12">
        <p className="text-pink-500 font-bold text-sm mb-2">{BRAND.tagline}</p>
        <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">About {BRAND.systemName} ✨</h2>
        <p className="text-xl text-gray-600 font-medium">Glow. Grow. Become.</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <p>
          At <strong className="text-gray-900">{BRAND.systemName}</strong>, beauty is more than a look—it's confidence,
          self-expression, and self-care. We are passionate about helping every woman embrace her unique beauty through
          carefully selected premium wigs, effective skincare solutions, and everyday beauty essentials designed to
          elevate your glow.
        </p>
        <p>
          Founded with the vision of making quality beauty products accessible and affordable, {BRAND.systemName} combines
          style, elegance, and authenticity in every product we offer. Whether you're transforming your look with a
          stunning wig, building a skincare routine that works, or searching for beauty essentials that fit your
          lifestyle, we're here to support your journey.
        </p>
        <p>
          Based in Mururui, Kenya, we proudly serve customers across the country through reliable nationwide delivery.
          Our commitment goes beyond selling products—we aim to build a community where beauty meets confidence, growth,
          and empowerment.
        </p>
      </div>

      <div className="mt-12 bg-black text-white rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-pink-500" size={22} /> Why Choose {BRAND.systemName}?
        </h3>
        <ul className="space-y-3 text-sm text-gray-300">
          {[
            'Premium-quality wigs and beauty products',
            'Trusted skincare solutions for every glow journey',
            'Affordable luxury without compromising quality',
            'Fast and reliable countrywide delivery',
            'Customer-focused service with a personal touch',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-pink-500">✨</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-gray-500 mt-10 italic">
        {BRAND.systemName} is where beauty blossoms, confidence shines, and every glow tells a story.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
        <span className="flex items-center gap-2"><MapPin className="text-pink-500" size={16} /> {BRAND.location}</span>
        <span className="flex items-center gap-2"><Truck className="text-pink-500" size={16} /> Countrywide Delivery</span>
      </div>

      <p className="text-center mt-10 text-pink-500 font-display font-bold text-lg">
        &ldquo;{BRAND.motto}&rdquo; ✨
      </p>
    </div>
  );
}
