# BLUMERA Security Setup

## Overview

Staff login uses **Supabase RPC** with bcrypt-hashed PINs (never in the frontend bundle). Promos and members are stored server-side. The storefront only receives **public product data** (no wholesale costs).

## Cursor MCP (optional)

`.cursor/mcp.json` connects Cursor to your Supabase project:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=deiycrewvqvbgisrbglu"
    }
  }
}
```

## BLUMERA Supabase project

- **Dashboard:** https://supabase.com/dashboard/project/deiycrewvqvbgisrbglu
- **API URL:** `https://deiycrewvqvbgisrbglu.supabase.co`
- **API keys:** https://supabase.com/dashboard/project/deiycrewvqvbgisrbglu/settings/api

The app ships with the BLUMERA project URL and anon key as defaults. Override with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in `.env` or deploy settings if needed.

## Migrations (run in order)

| File | Purpose |
|------|---------|
| `001_security.sql` | Staff auth, sessions, members, promo table |
| `002_seed_staff_pins.sql` | Seed admin/employee PIN hashes |
| `003_fix_pgcrypto_schema.sql` | Fix bcrypt on Supabase hosted DB |
| `004_security_hardening.sql` | RLS, admin RPCs, audit log, consent |

PINs are set via migration 002 or `npm run seed:pins` — **never commit real PINs to git**.

## Security features

### Authentication
- Server-verified PINs (bcrypt), 5-attempt lockout, 8h session, 30min idle timeout
- `staff_accounts` / `staff_sessions` blocked by RLS (RPC access only)
- Admin actions re-validated via `validate_admin_session` RPC

### Data
- Storefront: public products only (no cost/FIFO data)
- Promos: `get_home_promo_config` / `admin_save_home_promo_config` (server source of truth)
- Members: `admin_list_members` for admin panel; checkout requires **opt-in consent**
- Audit log: privileged admin actions logged via `log_staff_action`

### Input & headers
- Checkout/POS/WhatsApp field sanitization
- Image URLs stripped of `data:` / non-HTTPS on storefront
- `public/_headers` — CSP, X-Frame-Options, Referrer-Policy (Netlify/Cloudflare)

### Employee rules
- Staff POS: no manual discounts (Cash/M-Pesa at full price)
- Online cart: system bundle only (KSh 10 @ 2+, KSh 20 @ 3+); braids excluded
- Admin POS: optional manual discount (braids excluded)

## Deploy env vars

| Variable | Required |
|----------|----------|
| `VITE_SUPABASE_URL` | Optional (default: BLUMERA project) |
| `VITE_SUPABASE_ANON_KEY` | Optional (default: BLUMERA anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | PIN rotation only |

## Rotate PINs

Re-run `002_seed_staff_pins.sql` or `npm run seed:pins` with new env values.
