-- Rate-limit storage for public API endpoints.
--
-- Fixed-window counter (simpler than sliding window, plenty for the use
-- case of preventing spam on email-capture / inquiry / waitlist routes).
-- At the window boundary, a caller can theoretically burst 2x the limit
-- once, which is acceptable for the workloads we're protecting.
--
-- Key shape: '<route>:<scope>:<identifier>', e.g.
--   'capture-email:ip:1.2.3.4'
--   'sandbox-chat:user:550e8400-e29b-41d4-a716-446655440000'
--
-- RLS: locked down. Only the service role touches this table.
-- The check_rate_limit() function runs as SECURITY DEFINER so route
-- handlers using the service-role client can call it without any
-- direct INSERT/UPDATE grants on the underlying table.

CREATE TABLE IF NOT EXISTS rate_limits (
  key text NOT NULL,
  bucket_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket_start)
);

-- Cleanup index — DELETE WHERE bucket_start < now() - interval is
-- the periodic cron query.
CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket_start ON rate_limits (bucket_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny everything to non-service-role clients. The service role bypasses
-- RLS by design, so this policy effectively makes the table service-only.
DROP POLICY IF EXISTS "rate_limits_deny_all" ON rate_limits;
CREATE POLICY "rate_limits_deny_all" ON rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Atomic check + increment. Returns whether the call is allowed AND
-- what the current count is. The bucket_start is rounded down to the
-- nearest p_window_seconds boundary so all calls in the same window
-- aggregate to the same row.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
RETURNS TABLE(allowed boolean, current_count integer, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_bucket_start timestamptz;
  v_count integer;
BEGIN
  -- Round now() down to the window boundary.
  v_bucket_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  -- Atomic upsert + increment.
  INSERT INTO rate_limits (key, bucket_start, count)
  VALUES (p_key, v_bucket_start, 1)
  ON CONFLICT (key, bucket_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING rate_limits.count INTO v_count;

  RETURN QUERY SELECT
    v_count <= p_max,
    v_count,
    v_bucket_start + (p_window_seconds || ' seconds')::interval;
END;
$$;

-- Cleanup function. Call from a cron job to keep the table small.
-- Default 24h retention is plenty for windows that are at most a few hours.
CREATE OR REPLACE FUNCTION cleanup_rate_limits(p_older_than_hours integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM rate_limits
  WHERE bucket_start < now() - (p_older_than_hours || ' hours')::interval;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMENT ON TABLE rate_limits IS 'Fixed-window rate limit counters. service-role only. See src/lib/api/rate-limit.ts.';
COMMENT ON FUNCTION check_rate_limit IS 'Atomic increment + threshold check. Returns (allowed, count, reset_at).';
COMMENT ON FUNCTION cleanup_rate_limits IS 'Delete rate-limit rows older than N hours. Default 24. Called from /api/cron/cleanup-rate-limits.';
