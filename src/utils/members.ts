import { Member } from '../types';

const MEMBERS_KEY = 'blumera_members';
const SESSION_KEY = 'blumera_current_member';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return `254${digits}`;
}

function readMembers(): Member[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getReturningMember(): Member | null {
  try {
    const phone = localStorage.getItem(SESSION_KEY);
    if (!phone) return null;
    return readMembers().find((m) => m.phone === phone) ?? null;
  } catch {
    return null;
  }
}

export function saveMember(data: {
  name: string;
  phone: string;
  location?: string;
  orderNumber?: string;
}): Member {
  const phone = normalizePhone(data.phone);
  const members = readMembers();
  const existing = members.find((m) => m.phone === phone);
  const now = new Date().toISOString();

  const member: Member = {
    id: phone,
    name: data.name.trim(),
    phone,
    location: data.location?.trim() || existing?.location,
    orderCount: (existing?.orderCount ?? 0) + 1,
    lastOrderAt: now,
    lastOrderNumber: data.orderNumber,
    joinedAt: existing?.joinedAt ?? now,
  };

  const updated = existing
    ? members.map((m) => (m.phone === phone ? member : m))
    : [...members, member];

  writeMembers(updated);
  localStorage.setItem(SESSION_KEY, phone);
  return member;
}

export function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function getAllMembers(): Member[] {
  return readMembers();
}
