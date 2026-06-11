import { Role } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { logStaffAction } from './audit';

const SESSION_KEY = 'blumera_staff_session';
const IDLE_MS = 30 * 60 * 1000;

export type StaffLoginKey = 'admin' | 'employee_1' | 'employee_2';

export const LOGIN_TARGETS: { key: StaffLoginKey; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'employee_1', label: 'Staff 1' },
  { key: 'employee_2', label: 'Staff 2' },
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

export function getStaffSessionToken(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export async function assertAdminSession(): Promise<
  { ok: true; session: StaffSession } | { ok: false; error: string }
> {
  const session = await validateStoredSession();
  if (!session) {
    return { ok: false, error: 'Session expired — please sign in again' };
  }
  if (session.role !== 'admin') {
    return { ok: false, error: 'Admin access required' };
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.rpc('validate_admin_session', {
      p_token: session.token,
    });
    if (error || !(data as { valid?: boolean })?.valid) {
      await revokeSession(session.token);
      return { ok: false, error: 'Admin session invalid — please sign in again' };
    }
  }

  return { ok: true, session };
}

export async function guardAdminAction(
  action: string,
  onDenied?: (msg: string) => void
): Promise<StaffSession | null> {
  const result = await assertAdminSession();
  if (result.ok === false) {
    onDenied?.(result.error);
    return null;
  }
  void logStaffAction(action);
  return result.session;
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
