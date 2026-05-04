-- supabase/migrations/00023_email_capture_log.sql
--
-- Per-IP rate limiting for the public /api/capture-email endpoint.
-- Mirrors the pattern from 00020 (ai_usage_log + ip_hash) but isolated so
-- email-gate traffic doesn't pollute AI usage analytics.
--
-- We never store the raw IP. The hash is SHA-256(salt + ip) computed server
-- side. Salt comes from the same TOOLBOX_IP_HASH_SALT env used by the
-- toolbox rate limiter so a single rotation invalidates both surfaces.

create table if not exists email_capture_log (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

-- Partial index optimized for the per-hour lookup. Older rows are not
-- relevant to rate-limit decisions.
create index if not exists idx_email_capture_log_ip_recent
  on email_capture_log (ip_hash, created_at);

-- RLS: service role only. The endpoint uses the service-role client.
alter table email_capture_log enable row level security;

create policy "service role only — email_capture_log"
  on email_capture_log
  for all
  to service_role
  using (true)
  with check (true);

comment on table email_capture_log is
  'Per-IP submission log for /api/capture-email rate limiting. Stores hashed IP only (never raw). Rows older than ~1 hour can be pruned.';
