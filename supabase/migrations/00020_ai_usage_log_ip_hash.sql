-- supabase/migrations/00020_ai_usage_log_ip_hash.sql

-- Add an ip_hash column to ai_usage_log so per-IP rate limits can be
-- computed against the same table the per-user rate limit already uses.
-- The hash is SHA-256 of the IP plus a server-side salt (see
-- TOOLBOX_IP_HASH_SALT env). We never store the raw IP.

alter table ai_usage_log
  add column if not exists ip_hash text;

-- Partial index for the per-minute IP lookup. Only rows from the last
-- minute matter for rate limiting; the partial predicate keeps the
-- index small.
create index if not exists idx_ai_usage_log_ip_recent
  on ai_usage_log (ip_hash, created_at)
  where ip_hash is not null;

create index if not exists idx_ai_usage_log_user_recent
  on ai_usage_log (user_id, created_at);
