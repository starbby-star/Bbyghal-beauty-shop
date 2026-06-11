# BLUMERA Security Setup

## Overview

Staff login uses **Supabase RPC** with bcrypt-hashed PINs (never stored in the frontend bundle). The storefront only receives **public product data** (no wholesale costs). Web orders reserve stock until an **admin confirms** the WhatsApp order.

## 1. Supabase migration

In the [Supabase SQL editor](https://supabase.com/dashboard), run:

`supabase/migrations/001_security.sql`

This creates `staff_accounts`, `staff_sessions`, `members`, PIN verify/lockout functions, and member upsert.

## 2. Set GitHub / deployment secrets

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Public Supabase URL (Vite build) |
| `VITE_SUPABASE_ANON_KEY` | Anon key (Vite build) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server/CI only** — PIN seeding |
| `ADMIN_PIN` | 6–8 digit admin PIN (seed only) |
| `EMPLOYEE_1_PIN` | Employee 1 PIN |
| `EMPLOYEE_2_PIN` | Employee 2 PIN |

Never commit real PINs to git. Use strong random 6–8 digit PINs (not `5063` / `1111`).

## 3. Seed PIN hashes (one time)

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export ADMIN_PIN="your-strong-admin-pin"
export EMPLOYEE_1_PIN="your-strong-emp1-pin"
export EMPLOYEE_2_PIN="your-strong-emp2-pin"
npm run seed:pins
```

## 4. Employee discount rules

- **Staff POS:** No manual discounts. Cash or M-Pesa at full price.
- **Online shop:** System bundle only — KSh 10 off (2+ items), KSh 20 off (3+ items). **Braids excluded** from bundle count.
- **Admin POS:** May apply manual discount (braids still excluded from admin discount helper).

## 5. Session behaviour

- 8-hour server session + 30-minute idle timeout
- 5 failed PIN attempts → 15-minute lockout
- Logout revokes session token on Supabase

## 6. Rotate PINs

Re-run `npm run seed:pins` with new env PIN values (uses `admin_set_staff_pin` upsert).
