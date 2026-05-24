-- 00056_addie_sales_leads.sql
-- Sales-assist intake from /foundation/contact-sales. Captures community
-- bank / credit union / consulting-firm inquiries about the 10-seat
-- minimum Team SKU (see Foundation PRD §6 — FR-P1).
--
-- Service-role writes only. RLS is enabled with no policies so anon and
-- authenticated keys cannot read or write the table. The /api/addie/
-- contact-sales route uses getAddieServiceClient() which bypasses RLS.

CREATE TABLE addie.sales_leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fi_name         text NOT NULL,
  fi_type         text NOT NULL CHECK (fi_type IN ('community_bank','credit_union','consulting_firm','other')),
  asset_size      text NOT NULL CHECK (asset_size IN ('under_500m','500m_to_1b','1b_to_5b','5b_to_10b','over_10b','na')),
  seats           integer NOT NULL CHECK (seats >= 1 AND seats <= 100000),
  timeline        text NOT NULL CHECK (timeline IN ('this_quarter','next_quarter','exploring','not_yet')),
  contact_name    text NOT NULL,
  email           text NOT NULL,
  phone           text,
  notes           text,
  source_route    text NOT NULL DEFAULT '/foundation/contact-sales',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sales_leads_email_idx       ON addie.sales_leads (email);
CREATE INDEX sales_leads_created_at_idx  ON addie.sales_leads (created_at DESC);

ALTER TABLE addie.sales_leads ENABLE ROW LEVEL SECURITY;
-- No policies. Service_role bypasses RLS; no client should ever read this.

GRANT SELECT, INSERT, UPDATE, DELETE ON addie.sales_leads TO service_role;
