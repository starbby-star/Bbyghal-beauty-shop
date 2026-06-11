import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { Member } from '../../types';
import { getFirstName } from '../../utils/members';
import { INTEREST_OPTIONS, StorePage } from '../../constants/brand';
import { Category } from '../../types';

interface WelcomeChatProps {
  member: Member;
  onClose: () => void;
  onNavigate: (page: StorePage, category?: Category) => void;
}

export default function WelcomeChat({ member, onClose, onNavigate }: WelcomeChatProps) {
  const firstName = getFirstName(member.name);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[60]"
      >
        <div className="bg-black text-white rounded-3xl shadow-2xl border border-pink-500/30 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500/20 to-transparent px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-pink-400 text-[10px] font-bold uppercase tracking-wider">BLUMERA Assistant</p>
                <p className="font-bold text-sm">Welcome back!</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400">
              <X size={16} />
            </button>
          </div>

          <div className="px-5 pb-5">
            <p className="text-sm leading-relaxed text-gray-200 mb-1">
              How are you, <span className="text-pink-400 font-bold">{firstName}</span>? 👋
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Welcome back to BLUMERA! What are you interested in today?
            </p>
            {member.orderCount > 0 && (
              <p className="text-[10px] text-gray-500 mb-3">
                Member since {new Date(member.joinedAt).toLocaleDateString()} · {member.orderCount} order{member.orderCount === 1 ? '' : 's'}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onNavigate(opt.page, 'category' in opt ? opt.category : undefined);
                    onClose();
                  }}
                  className="px-3 py-2 bg-white/10 hover:bg-pink-500/30 border border-white/10 hover:border-pink-500/50 rounded-xl text-xs font-semibold transition-all"
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
