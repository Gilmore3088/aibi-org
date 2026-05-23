-- 00052_addie_sandbox_spend.sql
-- Per-day, per-provider LLM spend ledger backing the daily-budget circuit
-- breaker in sandbox-service (Sandbox Spec §11). Server-only — written from
-- service_role inside the sandbox handlers; never exposed to the client.

CREATE TABLE addie.sandbox_spend (
  spend_date  date    NOT NULL,
  provider    text    NOT NULL CHECK (provider IN ('anthropic','openai','google')),
  spend_usd   numeric(12,6) NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (spend_date, provider)
);

ALTER TABLE addie.sandbox_spend ENABLE ROW LEVEL SECURITY;
-- No policies. Service_role bypasses RLS; no client should ever read this.
