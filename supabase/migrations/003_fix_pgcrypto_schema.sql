-- Supabase hosts pgcrypto in the extensions schema
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
