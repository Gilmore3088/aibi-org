-- 00039_device_trust.sql
--
-- New-device sign-in confirmation per #187 (B2B auth refactor, PR 2 of 2).
--
-- After a successful email + password sign-in, the client posts to
-- /api/auth/check-device with the current aibi-trusted-device cookie (if
-- any). The server looks up the cookie token in trusted_devices and:
--
--   - if the row exists, belongs to this user, and is not expired, the
--     device is trusted — the client routes to the original redirectTo
--
--   - if not, the server inserts a device_confirmations row, emails the
--     user a one-time link, and the client routes to
--     /auth/confirm-device-pending (a holding state). When the user
--     clicks the email link, /auth/confirm-device validates the token,
--     inserts a trusted_devices row, sets the HttpOnly cookie (90 days),
--     and redirects to the original destination.
--
-- Both tables are service-role-only (RLS enabled, no policies). The
-- check-device + confirm-device routes use the service-role client to
-- read and write — the visitor never touches these rows directly.

BEGIN;

-- ── trusted_devices ────────────────────────────────────────────────────
--
-- One row per (user, confirmed browser/device). The cookie stores the
-- plaintext token; we store only its SHA-256 hash so a DB read does not
-- give an attacker session cookies.

CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cookie_token_hash text NOT NULL,
  label             text,                         -- "Chrome on macOS" etc.; optional
  ip_hash_first     text,                         -- TOOLBOX_IP_HASH_SALT
  confirmed_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at      timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz NOT NULL,
  user_agent        text,
  CONSTRAINT trusted_devices_cookie_unique UNIQUE (cookie_token_hash)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_active
  ON public.trusted_devices(user_id, expires_at);

ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
-- service-role only; no policies. The /api routes do the lookups.

-- ── device_confirmations ───────────────────────────────────────────────
--
-- Short-lived (10 min) single-use tokens that confirm a new-device sign-in.
-- Same hash-not-plaintext pattern: the email link carries the plaintext
-- token, the DB stores only its SHA-256.

CREATE TABLE IF NOT EXISTS public.device_confirmations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash    text NOT NULL,
  redirect_to   text NOT NULL DEFAULT '/dashboard',
  ip_hash       text,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  consumed_at   timestamptz,
  CONSTRAINT device_confirmations_token_unique UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_device_confirmations_lookup
  ON public.device_confirmations(token_hash, expires_at, consumed_at);

ALTER TABLE public.device_confirmations ENABLE ROW LEVEL SECURITY;
-- service-role only; no policies.

COMMIT;
