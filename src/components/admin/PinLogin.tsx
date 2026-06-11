import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Users, ChevronLeft } from 'lucide-react';
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
  employee_1: <Users size={20} />,
  employee_2: <Users size={20} />,
  admin: <Lock size={20} />,
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const targetMeta = LOGIN_TARGETS.find((t) => t.key === target);

  const submitPin = async (value: string) => {
    if (!target || value.length < PIN_MIN) return;
    setLoading(true);
    try {
      const result = await verifyStaffPin(target, value);
      if (result.ok === false) {
        onError(result.error);
        setPin('');
        inputRef.current?.focus();
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

  const canSubmit = pin.length >= PIN_MIN && pin.length <= PIN_MAX;

  React.useEffect(() => {
    if (mode === 'pin') inputRef.current?.focus();
  }, [mode]);

  if (!authConfigured()) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900 text-left">
        <p className="font-bold mb-1">Staff sign-in unavailable</p>
        <p className="text-amber-800 text-xs">
          Supabase is not configured. Rebuild with valid API credentials.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {mode === 'select' ? (
        <motion.div
          key="select"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid gap-2"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-pink-50 text-pink-700 font-bold hover:bg-pink-100 active:scale-[0.98] transition-all"
            >
              <span className="text-pink-500">{TARGET_ICONS[item.key]}</span>
              {item.label}
            </button>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="pin"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-4"
        >
          <button
            type="button"
            onClick={() => {
              setMode('select');
              setPin('');
            }}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors mx-auto"
          >
            <ChevronLeft size={16} />
            {targetMeta?.label}
          </button>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={PIN_MAX}
            value={pin}
            placeholder="PIN"
            disabled={loading}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_MAX))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit && !loading) void submitPin(pin);
            }}
            className="w-full text-center text-2xl tracking-[0.35em] py-4 px-4 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 font-bold text-gray-800 placeholder:tracking-normal placeholder:text-base placeholder:font-medium placeholder:text-gray-300"
          />

          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={() => void submitPin(pin)}
            className="w-full py-3.5 rounded-2xl bg-pink-500 text-white font-bold hover:bg-pink-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
