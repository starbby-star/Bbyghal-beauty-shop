import { Role } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const SESSION_KEY = 'blumera_staff_session';
const IDLE_MS = 30 * 60 * 1000;

export type StaffLoginKey = 'admin' | 'employee_1' | 'employee_2';

export const LOGIN_TARGETS: { key: StaffLoginKey; label: string; description: string }[] = [
  { key: 'employee_1', label: 'Employee 1', description: 'Record sales · check stock' },
  { key: 'employee_2', label: 'Employee 2', description: 'Record sales · check stock' },
  { key: 'admin', label: 'Administrator', description: 'Full system access' },
];

export interface StaffSession {
  token: string;
  role: Role;
  displayName: string;
  expiresAt: string;
  loginKey: StaffLoginKey;
  lastActivityAt: number;
}

interface StoredSession {
  token: string;
  role: Role;
  displayName: string;
  expiresAt: string;
  loginKey: StaffLoginKey;
  lastActivityAt: number;
}

function readStored(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeStored(session: StoredSession | null): void {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function touchSession(): void {
  const s = readStored();
  if (s) {
    s.lastActivityAt = Date.now();
    writeStored(s);
  }
}

export function isSessionIdleExpired(session: StoredSession): boolean {
  return Date.now() - session.lastActivityAt > IDLE_MS;
}

export async function verifyStaffPin(
  loginKey: StaffLoginKey,
  pin: string
): Promise<{ ok: true; session: StaffSession } | { ok: false; error: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }
  if (pin.length < 6) {
    return { ok: false, error: 'PIN must be at least 6 digits' };
  }

  const { data, error } = await supabase.rpc('verify_staff_pin', {
    p_login_key: loginKey,
    p_pin: pin,
  });

  if (error) {
    return { ok: false, error: 'Authentication unavailable. Try again later.' };
  }

  const result = data as {
    success?: boolean;
    error?: string;
    session_token?: string;
    role?: Role;
    display_name?: string;
    expires_at?: string;
  };

  if (!result?.success || !result.session_token) {
    return { ok: false, error: result?.error ?? 'Invalid credentials' };
  }

  const session: StaffSession = {
    token: result.session_token,
    role: result.role ?? 'staff',
    displayName: result.display_name ?? loginKey,
    expiresAt: result.expires_at ?? new Date(Date.now() + 8 * 3600000).toISOString(),
    loginKey,
    lastActivityAt: Date.now(),
  };

  writeStored({
    token: session.token,
    role: session.role,
    displayName: session.displayName,
    expiresAt: session.expiresAt,
    loginKey: session.loginKey,
    lastActivityAt: session.lastActivityAt,
  });

  return { ok: true, session };
}

export async function validateStoredSession(): Promise<StaffSession | null> {
  const stored = readStored();
  if (!stored) return null;

  if (new Date(stored.expiresAt).getTime() < Date.now()) {
    writeStored(null);
    return null;
  }
  if (isSessionIdleExpired(stored)) {
    await revokeSession(stored.token);
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) {
    writeStored(null);
    return null;
  }

  const { data, error } = await supabase.rpc('validate_staff_session', {
    p_token: stored.token,
  });

  if (error) {
    writeStored(null);
    return null;
  }

  const result = data as { valid?: boolean; role?: Role; display_name?: string; expires_at?: string };
  if (!result?.valid) {
    writeStored(null);
    return null;
  }

  stored.lastActivityAt = Date.now();
  stored.role = result.role ?? stored.role;
  stored.displayName = result.display_name ?? stored.displayName;
  stored.expiresAt = result.expires_at ?? stored.expiresAt;
  writeStored(stored);

  return {
    token: stored.token,
    role: stored.role,
    displayName: stored.displayName,
    expiresAt: stored.expiresAt,
    loginKey: stored.loginKey,
    lastActivityAt: stored.lastActivityAt,
  };
}

export async function revokeSession(token?: string): Promise<void> {
  const stored = readStored();
  const t = token ?? stored?.token;
  writeStored(null);
  const supabase = getSupabase();
  if (supabase && t) {
    await supabase.rpc('revoke_staff_session', { p_token: t });
  }
}

export function requireAdmin(role: Role | null, action: string): boolean {
  if (role !== 'admin') {
    console.warn(`Blocked: ${action} requires admin`);
    return false;
  }
  return true;
}

export function authConfigured(): boolean {
  return isSupabaseConfigured;
}
