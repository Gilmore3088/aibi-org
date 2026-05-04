-- Rate limit event log for application-layer rate limiting.
-- Stores one row per request that passes through a rate-limited surface
-- (e.g. /api/capture-email). The helper in src/lib/rate-limit/sliding-window.ts
-- counts events within a window and decides whether to allow the next one.
--
-- Why a Postgres table and not Upstash / Redis?
--   The 2026-04-15 decisions log defers Upstash until the week before launch.
--   This table closes the spam vector on /api/capture-email today using
--   infrastructure we already operate. The rate-limit helper exposes a swap
--   point for Upstash later — set UPSTASH_REDIS_REST_URL and the helper can
--   delegate without changes to the call sites.
--
-- Cleanup: rows older than 7 days are pruned by a Postgres function (below)
-- which can be called from a Supabase scheduled function or pg_cron job.
-- Without pruning the table grows ~1 row per request; not catastrophic at
-- low traffic but worth tidying.

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id          bigserial   PRIMARY KEY,
  scope       text        NOT NULL,
  key         text        NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_lookup
  ON rate_limit_events (scope, key, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_occurred_at
  ON rate_limit_events (occurred_at);

-- RLS: service-role only. No user (authenticated or anon) should ever
-- read or write directly. All access goes through the helper, which uses
-- the service role client.
ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'rate_limit_events_deny_all'
      AND polrelid = 'public.rate_limit_events'::regclass
  ) THEN
    CREATE POLICY rate_limit_events_deny_all ON rate_limit_events
      FOR ALL TO authenticated, anon
      USING (false) WITH CHECK (false);
  END IF;
END $$;

-- Cleanup function. Call from a scheduled Supabase function or pg_cron.
-- Keeps the last 7 days; tune as needed.
CREATE OR REPLACE FUNCTION prune_rate_limit_events()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM rate_limit_events
    WHERE occurred_at < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) FROM deleted;
$$;

REVOKE ALL ON FUNCTION prune_rate_limit_events() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION prune_rate_limit_events() TO service_role;
