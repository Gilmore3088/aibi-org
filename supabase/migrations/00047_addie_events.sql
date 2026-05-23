-- 00047_addie_events.sql
-- Analytics spine. Spec §5.9. High-volume; bigserial PK.
-- All writes are server-only. Learners do not read events. Team admins read
-- aggregates via SECURITY DEFINER views (00049).

CREATE TABLE addie.events (
  id              bigserial PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id)  ON DELETE SET NULL,
  lead_id         uuid REFERENCES addie.leads(id) ON DELETE SET NULL,
  anon_session_id uuid,
  action          text NOT NULL,        -- 'lesson_view', 'lesson_complete', 'sandbox_run',
                                        -- 'artifact_save', 'artifact_reuse', 'gate_decision', ...
  object_type     text,                 -- 'lesson', 'module', 'toolbox_item', 'gate', ...
  object_id       text,
  payload         jsonb,                -- action-specific {tier, score, fork, provider, ...}
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addie_events_user_created   ON addie.events(user_id, created_at DESC);
CREATE INDEX idx_addie_events_action_created ON addie.events(action, created_at DESC);
CREATE INDEX idx_addie_events_object         ON addie.events(object_type, object_id);
CREATE INDEX idx_addie_events_lead_created   ON addie.events(lead_id, created_at DESC);

ALTER TABLE addie.events ENABLE ROW LEVEL SECURITY;
-- Writes are server-only (service_role bypasses RLS). No client policies.
-- Internal dashboards use service_role.
