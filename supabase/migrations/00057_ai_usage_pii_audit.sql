-- Add non-content PII guardrail audit fields to AI usage logging.
-- These fields intentionally do not store prompt text or matched values.

ALTER TABLE ai_usage_log
  ADD COLUMN IF NOT EXISTS pii_flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pii_override boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pii_kind text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_pii_audit
  ON ai_usage_log (pii_flagged, pii_override, pii_kind, created_at DESC);
