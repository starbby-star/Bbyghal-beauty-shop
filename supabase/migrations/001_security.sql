-- BLUMERA security: staff PIN auth (hashed), sessions, members, promo config
-- Run via Supabase CLI or SQL editor. Seed PINs with: npm run seed:pins

create extension if not exists pgcrypto;

-- ─── Staff accounts (PIN verified server-side only) ───
create table if not exists staff_accounts (
  id uuid primary key default gen_random_uuid(),
  login_key text unique not null,
  display_name text not null,
  role text not null check (role in ('admin', 'staff')),
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Staff sessions (opaque tokens) ───
create table if not exists staff_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_accounts(id) on delete cascade,
  session_token text unique not null,
  role text not null,
  display_name text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_sessions_token on staff_sessions(session_token);
create index if not exists idx_staff_sessions_expires on staff_sessions(expires_at);

-- ─── Members (PII — admin read only) ───
create table if not exists members (
  id text primary key,
  name text not null,
  phone text unique not null,
  location text,
  order_count int not null default 0,
  last_order_at timestamptz,
  last_order_number text,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table members enable row level security;

-- ─── Home promo config (single row) ───
create table if not exists home_promo_config (
  id int primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table home_promo_config enable row level security;

-- ─── Verify PIN (rate-limited, returns session token) ───
create or replace function verify_staff_pin(p_login_key text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_account staff_accounts%rowtype;
  v_token text;
  v_max_attempts constant int := 5;
  v_lock_minutes constant int := 15;
begin
  if p_login_key is null or p_pin is null or length(trim(p_pin)) < 6 then
    return jsonb_build_object('success', false, 'error', 'Invalid credentials');
  end if;

  select * into v_account from staff_accounts where login_key = p_login_key;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid credentials');
  end if;

  if v_account.locked_until is not null and v_account.locked_until > now() then
    return jsonb_build_object(
      'success', false,
      'error', 'Account locked. Try again later.',
      'locked_until', v_account.locked_until
    );
  end if;

  if v_account.pin_hash = crypt(p_pin, v_account.pin_hash) then
    update staff_accounts
    set failed_attempts = 0, locked_until = null, updated_at = now()
    where id = v_account.id;

    v_token := encode(gen_random_bytes(32), 'hex');

    insert into staff_sessions (staff_id, session_token, role, display_name, expires_at)
    values (v_account.id, v_token, v_account.role, v_account.display_name, now() + interval '8 hours');

    delete from staff_sessions where expires_at < now();

    return jsonb_build_object(
      'success', true,
      'session_token', v_token,
      'role', v_account.role,
      'display_name', v_account.display_name,
      'expires_at', (now() + interval '8 hours')
    );
  end if;

  update staff_accounts
  set
    failed_attempts = failed_attempts + 1,
    locked_until = case
      when failed_attempts + 1 >= v_max_attempts then now() + (v_lock_minutes || ' minutes')::interval
      else locked_until
    end,
    updated_at = now()
  where id = v_account.id;

  return jsonb_build_object('success', false, 'error', 'Invalid credentials');
end;
$$;

-- ─── Validate session ───
create or replace function validate_staff_session(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session staff_sessions%rowtype;
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return jsonb_build_object('valid', false);
  end if;

  select * into v_session
  from staff_sessions
  where session_token = p_token and expires_at > now();

  if not found then
    return jsonb_build_object('valid', false);
  end if;

  return jsonb_build_object(
    'valid', true,
    'role', v_session.role,
    'display_name', v_session.display_name,
    'expires_at', v_session.expires_at
  );
end;
$$;

-- ─── Revoke session (logout) ───
create or replace function revoke_staff_session(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from staff_sessions where session_token = p_token;
  return true;
end;
$$;

-- ─── Upsert member (storefront checkout) ───
create or replace function upsert_member(
  p_phone text,
  p_name text,
  p_location text default null,
  p_order_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_member members%rowtype;
begin
  insert into members (id, phone, name, location, order_count, last_order_at, last_order_number, joined_at, updated_at)
  values (p_phone, p_phone, trim(p_name), nullif(trim(p_location), ''), 1, v_now, p_order_number, v_now, v_now)
  on conflict (phone) do update set
    name = excluded.name,
    location = coalesce(excluded.location, members.location),
    order_count = members.order_count + 1,
    last_order_at = v_now,
    last_order_number = p_order_number,
    updated_at = v_now
  returning * into v_member;

  return jsonb_build_object(
    'id', v_member.id,
    'name', v_member.name,
    'phone', v_member.phone,
    'location', v_member.location,
    'orderCount', v_member.order_count,
    'lastOrderAt', v_member.last_order_at,
    'lastOrderNumber', v_member.last_order_number,
    'joinedAt', v_member.joined_at
  );
end;
$$;

-- RLS: members readable only via service role / admin functions (no anon direct read)
create policy "members_no_anon_select" on members for select using (false);
create policy "members_no_anon_insert" on members for insert with check (false);
create policy "members_no_anon_update" on members for update using (false);

-- Promo config: public read for storefront, write via service role only
create policy "promo_public_read" on home_promo_config for select using (true);
create policy "promo_no_anon_write" on home_promo_config for insert with check (false);
create policy "promo_no_anon_update" on home_promo_config for update using (false);

-- Grant execute on auth functions to anon (PIN verify is the gate)
grant execute on function verify_staff_pin(text, text) to anon, authenticated;
grant execute on function validate_staff_session(text) to anon, authenticated;
grant execute on function revoke_staff_session(text) to anon, authenticated;
grant execute on function upsert_member(text, text, text, text) to anon, authenticated;

-- ─── Seed / rotate PINs (service role only — used by npm run seed:pins) ───
create or replace function admin_set_staff_pin(
  p_login_key text,
  p_pin text,
  p_display_name text,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_pin is null or length(trim(p_pin)) < 6 then
    raise exception 'PIN must be at least 6 digits';
  end if;
  if p_role not in ('admin', 'staff') then
    raise exception 'Invalid role';
  end if;

  insert into staff_accounts (login_key, display_name, role, pin_hash, failed_attempts, locked_until, updated_at)
  values (p_login_key, p_display_name, p_role, crypt(p_pin, gen_salt('bf')), 0, null, now())
  on conflict (login_key) do update set
    pin_hash = crypt(p_pin, gen_salt('bf')),
    display_name = excluded.display_name,
    role = excluded.role,
    failed_attempts = 0,
    locked_until = null,
    updated_at = now();
end;
$$;

grant execute on function admin_set_staff_pin(text, text, text, text) to service_role;
