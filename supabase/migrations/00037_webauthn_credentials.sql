-- WebAuthn / passkey credentials for the passwordless sign-in flow.
--
-- The site is moving from password-based auth to passkey-only (decision
-- 2026-05-23 — see docs/2fa-migration-plan-2026-05-23.md). Each row is
-- one registered authenticator (Touch ID/Face ID on a Mac, Windows
-- Hello on a PC, a YubiKey, etc.) bound to one Supabase auth user.
--
-- Credentials are validated server-side via @simplewebauthn/server. The
-- `credential_id` is the WebAuthn credential ID (base64url-encoded);
-- `public_key` is the COSE-encoded public key (also base64url). `counter`
-- enforces the authenticator's anti-replay counter — it MUST increase
-- on every assertion or the session is rejected.

create table if not exists public.webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- WebAuthn credential ID — base64url, max ~1KB per WebAuthn spec.
  credential_id text not null unique,
  -- COSE-encoded public key — base64url. ~200 bytes typical.
  public_key text not null,
  -- Anti-replay counter. Authenticators that implement counters must
  -- return a strictly increasing value on every assertion. Some
  -- platform authenticators (iCloud passkeys, Windows Hello) always
  -- return 0 — that's allowed but means no counter-based replay
  -- protection on those platforms. simplewebauthn handles the check.
  counter bigint not null default 0,
  -- Friendly label the user gave the credential ("MacBook Pro", "iPhone").
  device_label text,
  -- Authenticator-attached transports (usb, ble, nfc, internal, hybrid).
  -- Stored as a json array so allowCredentials hints work on subsequent
  -- assertions, speeding up the device picker.
  transports jsonb not null default '[]'::jsonb,
  -- Backup eligibility flag from the authenticator. true = credential
  -- can be synced across the user's iCloud / Google account devices.
  backup_eligible boolean not null default false,
  -- Set when the credential has been synced to another device (e.g.
  -- user signed into iCloud Keychain on a second Mac). Helps support
  -- understand "I never registered on this device but it works".
  backup_state boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists idx_webauthn_credentials_user_id
  on public.webauthn_credentials(user_id);

-- Short-lived registration / authentication challenges. The WebAuthn
-- protocol requires the server to issue a random challenge that the
-- authenticator signs; verifying the signed challenge proves the
-- assertion is fresh. We persist the issued challenge for the few
-- seconds between issue and verification so a stateless server can
-- still verify across requests.
create table if not exists public.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  -- For registration: the user_id we're enrolling for.
  -- For authentication: null until we recognise the credential.
  user_id uuid references auth.users(id) on delete cascade,
  -- Email used for the discoverable-credential sign-in flow when no
  -- user_id is known yet. Lets the verify step look up the user by
  -- the credential the authenticator picked.
  email text,
  challenge text not null,
  challenge_type text not null check (challenge_type in ('registration', 'authentication')),
  -- Expires 5 minutes after issue. Server checks before consuming.
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_webauthn_challenges_challenge
  on public.webauthn_challenges(challenge);
create index if not exists idx_webauthn_challenges_expires_at
  on public.webauthn_challenges(expires_at);

-- Backup recovery codes — single-use, hashed at rest. User generates
-- ~8 codes at enrollment, prints/saves them, can use any one to sign
-- in when no passkey is available. Each code is consumed on use.
create table if not exists public.webauthn_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- bcrypt-style hash of the code. Never store the plaintext.
  code_hash text not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_webauthn_recovery_codes_user_id
  on public.webauthn_recovery_codes(user_id);

-- RLS — service role only. The WebAuthn server-side library does all
-- reads + writes via the service-role client; there's no legitimate
-- direct-from-browser access path for any of these tables.
alter table public.webauthn_credentials enable row level security;
alter table public.webauthn_challenges enable row level security;
alter table public.webauthn_recovery_codes enable row level security;

-- No policies = no access for anon/authenticated roles. Service role
-- bypasses RLS automatically.
