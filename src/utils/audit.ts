import { getSupabase } from '../lib/supabase';
import { getStaffSessionToken } from './auth';

export async function logStaffAction(
  action: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const token = getStaffSessionToken();
  const supabase = getSupabase();
  if (!token || !supabase) return;

  await supabase.rpc('log_staff_action', {
    p_token: token,
    p_action: action,
    p_details: details,
  });
}
