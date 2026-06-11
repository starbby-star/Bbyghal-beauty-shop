# BLUMERA Security Setup

## Overview

Staff login uses **Supabase RPC** with bcrypt-hashed PINs (never stored in the frontend bundle). The storefront only receives **public product data** (no wholesale costs). Web orders reserve stock until an **admin confirms** the WhatsApp order.

## 1. Supabase migration

In the [Supabase SQL editor](https://supabase.com/dashboard), run:

`supabase/migrations/001_security.sql`

This creates `staff_accounts`, `staff_sessions`, `members`, PIN verify/lockout functions, and member upsert.

## 2. Seed staff PINs in Supabase

After `001_security.sql`, run in the Supabase SQL editor:

`supabase/migrations/002_seed_staff_pins.sql`

This registers:

| Role | Login key | PIN |
|------|-----------|-----|
| Administrator | `admin` | `20473405` |
| Employee 1 | `employee_1` | `506316` |
| Employee 2 | `employee_2` | `200316` |

PINs are stored as bcrypt hashes only — not in the frontend bundle.

**Alternative (CI / rotate):** `npm run seed:pins` with `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PIN` / `EMPLOYEE_1_PIN` / `EMPLOYEE_2_PIN` env vars.

## 3. Set GitHub / deployment secrets

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Public Supabase URL (Vite build) |
| `VITE_SUPABASE_ANON_KEY` | Anon key (Vite build) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional — PIN rotation via `seed:pins` |

## 4. Employee discount rules

- **Staff POS:** No manual discounts. Cash or M-Pesa at full price.
- **Online shop:** System bundle only — KSh 10 off (2+ items), KSh 20 off (3+ items). **Braids excluded** from bundle count.
- **Admin POS:** May apply manual discount (braids still excluded from admin discount helper).

## 5. Session behaviour

- 8-hour server session + 30-minute idle timeout
- 5 failed PIN attempts → 15-minute lockout
- Logout revokes session token on Supabase

## 6. Rotate PINs

Edit and re-run `002_seed_staff_pins.sql`, or re-run `npm run seed:pins` with new env PIN values.
