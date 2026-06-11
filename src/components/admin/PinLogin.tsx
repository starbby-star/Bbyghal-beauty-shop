import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  LOGIN_TARGETS,
  StaffLoginKey,
  verifyStaffPin,
  authConfigured,
} from '../../utils/auth';
import { Role } from '../../types';

const PIN_MIN = 6;
const PIN_MAX = 8;

const TARGET_ICONS: Record<StaffLoginKey, React.ReactNode> = {
  employee_1: <Users size={24} />,
  employee_2: <Users size={24} />,
  admin: <Lock size={24} />,
};

interface PinLoginProps {
  onSuccess: (result: { role: Role; displayName: string; loginKey: StaffLoginKey }) => void;
  onError: (message: string) => void;
}

export default function PinLogin({ onSuccess, onError }: PinLoginProps) {
  const [mode, setMode] = React.useState<'select' | 'pin'>('select');
  const [target, setTarget] = React.useState<StaffLoginKey | null>(null);
  const [pin, setPin] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const targetMeta = LOGIN_TARGETS.find((t) => t.key === target);

  const submitPin = async (value: string) => {
    if (!target || value.length < PIN_MIN) return;
    setLoading(true);
    try {
      const result = await verifyStaffPin(target, value);
      if (result.ok === false) {
        onError(result.error);
        setPin('');
        return;
      }
      onSuccess({
        role: result.session.role,
        displayName: result.session.displayName,
        loginKey: target,
      });
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const appendDigit = (digit: number) => {
    if (loading || pin.length >= PIN_MAX) return;
    setPin((p) => p + String(digit));
  };

  const canSubmit = pin.length >= PIN_MIN && pin.length <= PIN_MAX;

  if (!authConfigured()) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
        <p className="font-bold mb-2">Staff sign-in unavailable</p>
        <p className="text-amber-800">
          Supabase is not configured. Set <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>, then rebuild the app.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {mode === 'select' ? (
        <motion.div
          key="select"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          {LOGIN_TARGETS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTarget(item.key);
                setMode('pin');
                setPin('');
              }}
              className="w-full flex items-center justify-between p-6 bg-pink-50 rounded-3xl hover:bg-pink-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                  {TARGET_ICONS[item.key]}
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="text-pink-300 group-hover:text-pink-500 transition-colors" />
            </button>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="pin"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('select');
                setPin('');
              }}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="text-gray-500 font-medium">
              Enter PIN for {targetMeta?.label ?? 'staff'} ({PIN_MIN}–{PIN_MAX} digits)
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap max-w-xs mx-auto">
            {Array.from({ length: PIN_MAX }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                  pin.length > i ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-100 text-gray-200'
                }`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={PIN_MAX}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_MAX))}
            autoFocus
            className="absolute opacity-0 pointer-events-none"
            aria-hidden
          />

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((num, i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={() => {
                  if (num === 'C') setPin('');
                  else if (num === '←') setPin((p) => p.slice(0, -1));
                  else if (typeof num === 'number') appendDigit(num);
                }}
                className="h-14 rounded-2xl bg-pink-50 text-lg font-black text-pink-600 hover:bg-pink-100 active:scale-95 transition-all disabled:opacity-50"
              >
                {num}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={() => void submitPin(pin)}
            className="w-full py-3 rounded-2xl bg-pink-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying…' : 'Unlock'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
