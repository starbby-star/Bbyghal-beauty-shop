-- BLUMERA security hardening: RLS on staff tables, admin RPCs, promos, audit, consent

-- ─── Lock down staff tables (access via security definer functions only) ───
alter table staff_accounts enable row level security;
alter table staff_sessions enable row level security;

drop policy if exists staff_accounts_deny_all on staff_accounts;
create policy staff_accounts_deny_all on staff_accounts for all using (false);

drop policy if exists staff_sessions_deny_all on staff_sessions;
create policy staff_sessions_deny_all on staff_sessions for all using (false);

-- ─── Audit log ───
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff_accounts(id) on delete set null,
  display_name text,
  role text,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table audit_log enable row level security;
drop policy if exists audit_log_deny_all on audit_log;
create policy audit_log_deny_all on audit_log for all using (false);

-- ─── Member consent ───
alter table members add column if not exists consent_at timestamptz;

-- ─── Seed promo config row ───
insert into home_promo_config (id, config, updated_at)
values (1, '{}'::jsonb, now())
on conflict (id) do nothing;

-- ─── Validate admin session ───
create or replace function validate_admin_session(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  v_result := validate_staff_session(p_token);
  if coalesce((v_result->>'valid')::boolean, false) = false then
    return jsonb_build_object('valid', false, 'error', 'Invalid session');
  end if;
  if v_result->>'role' <> 'admin' then
    return jsonb_build_object('valid', false, 'error', 'Admin access required');
  end if;
  return v_result;
end;
$$;

-- ─── Log staff action (admin or staff) ───
create or replace function log_staff_action(
  p_token text,
  p_action text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session staff_sessions%rowtype;
begin
  select * into v_session
  from staff_sessions
  where session_token = p_token and expires_at > now();

  if not found then
    return;
  end if;

  insert into audit_log (staff_id, display_name, role, action, details)
  values (
    v_session.staff_id,
    v_session.display_name,
    v_session.role,
    left(p_action, 120),
    coalesce(p_details, '{}'::jsonb)
  );
end;
$$;

-- ─── Admin: list members ───
create or replace function admin_list_members(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin jsonb;
begin
  v_admin := validate_admin_session(p_token);
  if coalesce((v_admin->>'valid')::boolean, false) = false then
    return jsonb_build_object('success', false, 'error', v_admin->>'error');
  end if;

  return jsonb_build_object(
    'success', true,
    'members', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'phone', m.phone,
            'location', m.location,
            'orderCount', m.order_count,
            'lastOrderAt', m.last_order_at,
            'lastOrderNumber', m.last_order_number,
            'joinedAt', m.joined_at,
            'consentAt', m.consent_at
          )
          order by m.last_order_at desc nulls last
        )
        from members m
      ),
      '[]'::jsonb
    )
  );
end;
$$;

-- ─── Public: get home promo config ───
create or replace function get_home_promo_config()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config jsonb;
begin
  select config into v_config from home_promo_config where id = 1;
  return coalesce(v_config, '{}'::jsonb);
end;
$$;

-- ─── Admin: save home promo config ───
create or replace function admin_save_home_promo_config(
  p_token text,
  p_config jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin jsonb;
begin
  v_admin := validate_admin_session(p_token);
  if coalesce((v_admin->>'valid')::boolean, false) = false then
    return jsonb_build_object('success', false, 'error', v_admin->>'error');
  end if;

  if p_config is null or jsonb_typeof(p_config) <> 'object' then
    return jsonb_build_object('success', false, 'error', 'Invalid config');
  end if;

  insert into home_promo_config (id, config, updated_at)
  values (1, p_config || jsonb_build_object('updatedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')), now())
  on conflict (id) do update set
    config = excluded.config,
    updated_at = now();

  perform log_staff_action(p_token, 'save_home_promo_config', jsonb_build_object('saved', true));

  return jsonb_build_object('success', true);
end;
$$;

-- ─── Harden upsert_member with validation + consent ───
drop function if exists upsert_member(text, text, text, text);

create or replace function upsert_member(
  p_phone text,
  p_name text,
  p_location text default null,
  p_order_number text default null,
  p_consent boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_member members%rowtype;
  v_phone text;
  v_name text;
  v_digits text;
begin
  v_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(v_digits) < 9 or length(v_digits) > 12 then
    return jsonb_build_object('success', false, 'error', 'Invalid phone');
  end if;

  v_phone := v_digits;
  if v_phone like '0%' then
    v_phone := '254' || substring(v_phone from 2);
  elsif v_phone not like '254%' then
    v_phone := '254' || v_phone;
  end if;

  v_name := left(trim(regexp_replace(coalesce(p_name, ''), '[\r\n\t]+', ' ', 'g')), 80);
  if length(v_name) < 2 then
    return jsonb_build_object('success', false, 'error', 'Invalid name');
  end if;

  if not coalesce(p_consent, false) then
    return jsonb_build_object('success', false, 'error', 'Consent required');
  end if;

  insert into members (id, phone, name, location, order_count, last_order_at, last_order_number, joined_at, updated_at, consent_at)
  values (
    v_phone,
    v_phone,
    v_name,
    nullif(left(trim(coalesce(p_location, '')), 60), ''),
    1,
    v_now,
    nullif(left(trim(coalesce(p_order_number, '')), 32), ''),
    v_now,
    v_now,
    v_now
  )
  on conflict (phone) do update set
    name = excluded.name,
    location = coalesce(excluded.location, members.location),
    order_count = members.order_count + 1,
    last_order_at = v_now,
    last_order_number = excluded.last_order_number,
    updated_at = v_now,
    consent_at = coalesce(members.consent_at, v_now)
  returning * into v_member;

  return jsonb_build_object(
    'success', true,
    'id', v_member.id,
    'name', v_member.name,
    'phone', v_member.phone,
    'location', v_member.location,
    'orderCount', v_member.order_count,
    'lastOrderAt', v_member.last_order_at,
    'lastOrderNumber', v_member.last_order_number,
    'joinedAt', v_member.joined_at,
    'consentAt', v_member.consent_at
  );
end;
$$;

grant execute on function validate_admin_session(text) to anon, authenticated;
grant execute on function log_staff_action(text, text, jsonb) to anon, authenticated;
grant execute on function admin_list_members(text) to anon, authenticated;
grant execute on function get_home_promo_config() to anon, authenticated;
grant execute on function admin_save_home_promo_config(text, jsonb) to anon, authenticated;
grant execute on function upsert_member(text, text, text, text, boolean) to anon, authenticated;
