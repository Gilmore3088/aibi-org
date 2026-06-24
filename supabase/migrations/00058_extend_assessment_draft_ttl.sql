-- 00058 — Extend free-assessment resume draft links to 30 days.
--
-- Persona remediation for cross-device returners: a two-week window was too
-- narrow for buyers who start on mobile and return from desktop weeks later.

BEGIN;

ALTER TABLE public.assessment_drafts
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 days');

UPDATE public.assessment_drafts
SET expires_at = GREATEST(expires_at, created_at + interval '30 days')
WHERE source = 'free_assessment'
  AND expires_at > now()
  AND expires_at < created_at + interval '30 days';

COMMENT ON TABLE public.assessment_drafts IS
  'Service-role-only 30-day resume drafts for free assessment abandon/recovery links.';

COMMIT;
