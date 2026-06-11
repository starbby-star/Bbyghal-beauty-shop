import React from 'react';
import { motion } from 'motion/react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { WhatsAppOrderInput, buildBuyerReceiptMessage, openBuyerReceiptWhatsApp } from '../../utils/whatsapp';
import WhatsAppIcon from './WhatsAppIcon';
import { BRAND } from '../../constants/brand';

interface OrderReceiptModalProps {
  order: WhatsAppOrderInput;
  onClose: () => void;
}

export default function OrderReceiptModal({ order, onClose }: OrderReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);
  const receiptText = buildBuyerReceiptMessage(order);

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-emerald-500 text-white p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={22} />
              <div>
                <p className="font-bold">Order sent to {BRAND.systemName}!</p>
                <p className="text-emerald-100 text-xs mt-0.5">Ref: {order.orderNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {receiptText}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center">
              Step 1: Tap Send in the chat that opened to {BRAND.systemName}.<br />
              Step 2: Save this receipt to your WhatsApp after you pay.
            </p>
            <button
              onClick={() => openBuyerReceiptWhatsApp(order.customerPhone, order)}
              className="w-full py-3.5 bg-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-400"
            >
              <WhatsAppIcon size={18} /> Save receipt to my WhatsApp
            </button>
            <button
              onClick={copyReceipt}
              className="w-full py-3 border border-gray-200 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <Copy size={16} /> {copied ? 'Copied!' : 'Copy receipt text'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
