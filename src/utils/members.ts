import { Member } from '../types';
import { getSupabase } from '../lib/supabase';
import { normalizePhoneIntl } from './whatsapp';
import { sanitizeCustomerName, sanitizeSingleLine } from './sanitize';

const MEMBERS_KEY = 'blumera_members';
const SESSION_KEY = 'blumera_current_member';

function normalizePhone(phone: string): string {
  return normalizePhoneIntl(phone);
}

function readMembersLocal(): Member[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeMembersLocal(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getReturningMember(): Member | null {
  try {
    const phone = localStorage.getItem(SESSION_KEY);
    if (!phone) return null;
    return readMembersLocal().find((m) => m.phone === phone) ?? null;
  } catch {
    return null;
  }
}

function mapRpcMember(data: Record<string, unknown>): Member {
  return {
    id: String(data.id),
    name: String(data.name),
    phone: String(data.phone),
    location: data.location ? String(data.location) : undefined,
    orderCount: Number(data.orderCount ?? 0),
    lastOrderAt: String(data.lastOrderAt ?? new Date().toISOString()),
    lastOrderNumber: data.lastOrderNumber ? String(data.lastOrderNumber) : undefined,
    joinedAt: String(data.joinedAt ?? new Date().toISOString()),
    consentAt: data.consentAt ? String(data.consentAt) : undefined,
  };
}

export async function saveMember(data: {
  name: string;
  phone: string;
  location?: string;
  orderNumber?: string;
  consent: boolean;
}): Promise<Member | null> {
  if (!data.consent) return null;

  const phone = normalizePhone(data.phone);
  const name = sanitizeCustomerName(data.name);
  const location = data.location ? sanitizeSingleLine(data.location, 60) : undefined;

  const supabase = getSupabase();
  if (supabase) {
    const { data: row, error } = await supabase.rpc('upsert_member', {
      p_phone: phone,
      p_name: name,
      p_location: location ?? null,
      p_order_number: data.orderNumber ?? null,
      p_consent: true,
    });
    const result = row as Record<string, unknown> | null;
    if (!error && result && result.success !== false) {
      const member = mapRpcMember(result);
      localStorage.setItem(SESSION_KEY, phone);
      const local = readMembersLocal().filter((m) => m.phone !== phone);
      writeMembersLocal([...local, member]);
      return member;
    }
  }

  const members = readMembersLocal();
  const existing = members.find((m) => m.phone === phone);
  const now = new Date().toISOString();

  const member: Member = {
    id: phone,
    name,
    phone,
    location: location || existing?.location,
    orderCount: (existing?.orderCount ?? 0) + 1,
    lastOrderAt: now,
    lastOrderNumber: data.orderNumber,
    joinedAt: existing?.joinedAt ?? now,
    consentAt: existing?.consentAt ?? now,
  };

  const updated = existing
    ? members.map((m) => (m.phone === phone ? member : m))
    : [...members, member];

  writeMembersLocal(updated);
  localStorage.setItem(SESSION_KEY, phone);
  return member;
}

export async function fetchMembersForAdmin(adminToken: string): Promise<Member[]> {
  const supabase = getSupabase();
  if (!supabase) return getAllMembers();

  const { data, error } = await supabase.rpc('admin_list_members', { p_token: adminToken });
  if (error) return getAllMembers();

  const result = data as { success?: boolean; members?: Record<string, unknown>[] };
  if (!result?.success || !Array.isArray(result.members)) return getAllMembers();

  return result.members.map((m) => mapRpcMember(m));
}

export function getAllMembers(): Member[] {
  return readMembersLocal();
}

export function clearMemberSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
