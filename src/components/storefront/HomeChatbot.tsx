import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';
import { Member, HomePromoConfig, Category } from '../../types';
import { PublicProduct } from '../../utils/productPublic';
import { getFirstName } from '../../utils/members';
import { BRAND, INTEREST_OPTIONS, StorePage } from '../../constants/brand';
import { CHATBOT_FAQ, CHATBOT_GREETINGS } from '../../constants/home';
import { getBeautyResponse } from '../../utils/beautyChat';

interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
}

interface HomeChatbotProps {
  member: Member | null;
  products: PublicProduct[];
  homePromoConfig: HomePromoConfig;
  onNavigate: (page: StorePage, category?: Category) => void;
  onOpenCart?: () => void;
  visible?: boolean;
}

export default function HomeChatbot({ member, products, homePromoConfig, onNavigate, onOpenCart, visible = true }: HomeChatbotProps) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const greeting = member
    ? CHATBOT_GREETINGS.returning(getFirstName(member.name))
    : CHATBOT_GREETINGS.newVisitor;

  React.useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: 'greet', from: 'bot', text: greeting },
        { id: 'help', from: 'bot', text: 'Ask me about skincare, wigs, braids, makeup, glow tips, Pink Thursday, or sell-out deals!' },
      ]);
    }
  }, [open, greeting, messages.length]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const addBot = (text: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-bot`, from: 'bot', text }]);
  };

  const addUser = (text: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-user`, from: 'user', text }]);
  };

  const handleFaq = (id: string) => {
    const faq = CHATBOT_FAQ.find((f) => f.id === id);
    if (!faq) return;
    addUser(faq.question);
    setTimeout(() => addBot(faq.answer), 400);
  };

  const handleInterest = (page: StorePage, category?: Category, label?: string) => {
    if (label) addUser(label);
    setTimeout(() => {
      addBot(`Great choice! Taking you to ${label ?? page}...`);
      onNavigate(page, category);
      setOpen(false);
    }, 500);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addUser(text);
    setInput('');

    const lower = text.toLowerCase();
    setTimeout(() => {
      const beautyReply = getBeautyResponse(text, products, homePromoConfig);
      if (beautyReply) {
        addBot(beautyReply);
        if (lower.includes('order') || lower.includes('cart') || lower.includes('buy')) {
          if (onOpenCart) onOpenCart();
        }
        return;
      }
      if (lower.includes('offer') || lower.includes('discount') || lower.includes('deal')) {
        addBot(CHATBOT_FAQ.find((f) => f.id === 'offers')!.answer);
      } else if (lower.includes('deliver')) {
        addBot(CHATBOT_FAQ.find((f) => f.id === 'delivery')!.answer);
      } else if (lower.includes('order') || lower.includes('buy') || lower.includes('cart')) {
        addBot(CHATBOT_FAQ.find((f) => f.id === 'order')!.answer);
        if (onOpenCart) onOpenCart();
      } else if (lower.includes('braid')) {
        addBot(CHATBOT_FAQ.find((f) => f.id === 'braids')!.answer);
      } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('call')) {
        addBot(CHATBOT_FAQ.find((f) => f.id === 'contact')!.answer);
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        addBot(greeting);
      } else {
        addBot(`Thanks for reaching out! Ask me about beauty products, skincare routines, wigs, or our current deals. Or Connect with us at ${BRAND.whatsappDisplay}.`);
      }
    }, 500);
  };

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 max-h-[min(70vh,520px)] z-[55] flex flex-col bg-black text-white rounded-3xl shadow-2xl border border-pink-500/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pink-500/30 to-transparent px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-pink-400 text-[10px] font-bold uppercase tracking-wider">{BRAND.systemName} Assistant</p>
                  <p className="text-sm font-bold">Beauty chatbot</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-pink-500 text-white rounded-br-md'
                        : 'bg-white/10 text-gray-200 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {INTEREST_OPTIONS.slice(0, 4).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    handleInterest(opt.page, 'category' in opt ? opt.category : undefined, `${opt.emoji} ${opt.label}`)
                  }
                  className="px-2.5 py-1 bg-white/10 hover:bg-pink-500/30 border border-white/10 rounded-lg text-[10px] font-semibold"
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>

            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {CHATBOT_FAQ.slice(0, 3).map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleFaq(faq.id)}
                  className="px-2.5 py-1 text-[10px] text-pink-300 hover:text-pink-200 underline"
                >
                  {faq.question}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about skincare, wigs, deals..."
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500/50 placeholder:text-gray-500"
              />
              <button
                onClick={handleSend}
                className="sf-btn-primary p-2.5 rounded-xl transition-colors"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-4 sm:right-6 z-[54] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
          open ? 'bg-gray-800 text-white' : 'sf-cart-btn blumera-pink-glow'
        }`}
        aria-label="Open chatbot"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </motion.button>
    </>
  );
}
