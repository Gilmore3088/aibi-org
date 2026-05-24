-- Audit A14 (2026-05-24): zero Analyze-level items in the KC bank;
-- only m5.3 Q2 approaches. Pair 3 (Lena · Assessment) flagged the
-- absence as a ceiling problem — the bank cannot distinguish a
-- learner who applies a rule from one who can break a scenario into
-- its constituent rules and rule-conflicts. Add a Bloom-level tag
-- so we can target coverage and surface the ceiling on the
-- assessment-quality dashboard.
--
-- Default 'apply' is the natural ceiling for the existing bank (most
-- items ask the learner to apply a rule to a case). The 00068
-- backfill tags eight new and two existing items as 'analyze'.

ALTER TABLE addie.knowledge_checks
  ADD COLUMN IF NOT EXISTS bloom_level text NOT NULL DEFAULT 'apply';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'addie_knowledge_checks_bloom_chk'
  ) THEN
    ALTER TABLE addie.knowledge_checks
      ADD CONSTRAINT addie_knowledge_checks_bloom_chk
      CHECK (bloom_level IN (
        'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
      ));
  END IF;
END $$;

COMMENT ON COLUMN addie.knowledge_checks.bloom_level IS
  'Bloom''s revised taxonomy level for this check. Default apply. analyze items break a scenario into constituent rules; evaluate items pick the best of equally-plausible options; create items synthesize. A14 audit fix 2026-05-24.';
