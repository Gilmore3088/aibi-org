-- 00049_addie_team_progress_view.sql
-- Team-admin rollup view. Spec §7.
-- Aggregate only — NEVER exposes artifact body_md or sandbox session text.
-- SECURITY DEFINER so the view can read addie.events (service-only RLS)
-- while still being callable by the team admin.

CREATE OR REPLACE VIEW addie.team_progress_v
WITH (security_invoker = false) AS  -- runs with view-owner privileges
SELECT
  s.team_id,
  s.id                                                                 AS seat_id,
  s.invited_email,
  s.status                                                             AS seat_status,
  lp.user_id,
  lp.track,
  COUNT(DISTINCT e.object_id) FILTER (WHERE e.action='lesson_complete') AS lessons_completed,
  COUNT(*)                    FILTER (WHERE e.action='sandbox_run')     AS sandbox_runs,
  COUNT(*)                    FILTER (WHERE e.action='artifact_save')   AS artifacts_saved,
  COUNT(*)                    FILTER (WHERE e.action='artifact_reuse')  AS artifacts_reused,
  MAX(e.created_at)                                                     AS last_activity_at
FROM addie.seats s
LEFT JOIN addie.learner_profiles lp ON lp.user_id = s.learner_user_id
LEFT JOIN addie.events           e  ON e.user_id  = s.learner_user_id
WHERE s.status IN ('assigned','revoked')   -- show revoked for audit
GROUP BY s.team_id, s.id, s.invited_email, s.status, lp.user_id, lp.track;

-- Admin access: only rows for teams they admin.
-- Because views can't have RLS directly, callers query a SECURITY DEFINER
-- wrapper function or, more simply, the API layer enforces team scoping
-- before the view is queried. For now we GRANT to authenticated and rely
-- on the API layer. Tighten later if direct PostgREST exposure is enabled.
GRANT SELECT ON addie.team_progress_v TO authenticated;

COMMENT ON VIEW addie.team_progress_v IS
  'Team admin rollup. Aggregate only — no body_md, no transcripts. API layer '
  'must filter by team_id of an admin the caller actually owns. PRD FR-D4.';
