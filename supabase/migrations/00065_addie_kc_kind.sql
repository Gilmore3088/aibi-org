-- Audit A13 (2026-05-24): six of 55 KCs test course UI / policy (track
-- selection, navigation, payment gating) rather than the lesson's
-- learning construct. Pair 3 (Lena · Assessment) flagged this as a
-- validity issue — mixing orientation and construct items in one
-- scored bank inflates apparent mastery for the lesson's named
-- objective.
--
-- The fix: add a `kind` discriminator so orientation items can be
-- rendered in their own group, excluded from per-lesson mastery
-- scoring, or surfaced as the optional housekeeping section of the
-- lesson close. The 00066 migration tags the 11 flagged rows as
-- 'orientation'; default is 'construct' (the normal Bloom-Apply
-- KC the assessment design intends).

ALTER TABLE addie.knowledge_checks
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'construct';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'addie_knowledge_checks_kind_chk'
  ) THEN
    ALTER TABLE addie.knowledge_checks
      ADD CONSTRAINT addie_knowledge_checks_kind_chk
      CHECK (kind IN ('construct', 'orientation'));
  END IF;
END $$;

COMMENT ON COLUMN addie.knowledge_checks.kind IS
  'construct = scored learning-objective check (default). orientation = UI / policy / housekeeping check, surfaced separately and excluded from mastery scoring. A13 audit fix 2026-05-24.';
