#!/usr/bin/env node
/**
 * Seed staff PIN hashes into Supabase (run once after migration).
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env (GitHub Secrets).
 * Set ADMIN_PIN, EMPLOYEE_1_PIN, EMPLOYEE_2_PIN — min 6 digits each. Never commit real PINs.
 */
import { createClient } from '@supabase/supabase-js';

const url =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://deiycrewvqvbgisrbglu.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminPin = process.env.ADMIN_PIN;
const emp1Pin = process.env.EMPLOYEE_1_PIN;
const emp2Pin = process.env.EMPLOYEE_2_PIN;

function assertPin(label, pin) {
  if (!pin || pin.length < 6 || !/^\d+$/.test(pin)) {
    console.error(`${label} must be at least 6 digits (numbers only)`);
    process.exit(1);
  }
}

assertPin('ADMIN_PIN', adminPin);
assertPin('EMPLOYEE_1_PIN', emp1Pin);
assertPin('EMPLOYEE_2_PIN', emp2Pin);

const supabase = createClient(url, serviceKey);

const accounts = [
  { login_key: 'admin', display_name: 'Administrator', role: 'admin', pin: adminPin },
  { login_key: 'employee_1', display_name: 'Employee 1', role: 'staff', pin: emp1Pin },
  { login_key: 'employee_2', display_name: 'Employee 2', role: 'staff', pin: emp2Pin },
];

for (const acc of accounts) {
  const { error } = await supabase.rpc('admin_set_staff_pin', {
    p_login_key: acc.login_key,
    p_pin: acc.pin,
    p_display_name: acc.display_name,
    p_role: acc.role,
  });
  if (error) {
    console.error(`Failed ${acc.login_key}:`, error.message);
    process.exit(1);
  }
  console.log(`Seeded ${acc.login_key} (${acc.display_name})`);
}

console.log('\nDone. PINs live only in your secrets store — not in git.');
