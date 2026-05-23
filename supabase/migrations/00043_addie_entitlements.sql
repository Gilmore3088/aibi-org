-- 00043_addie_entitlements.sql
-- Unlocks M4–M5 + unlimited Toolbox. Spec §5.3.
-- One row per (user, product) for individuals; one per assigned seat for teams.

CREATE TABLE addie.entitlements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product           text NOT NULL CHECK (product IN (
                      'foundation_individual',
                      'foundation_team_seat',
                      'assessment_in_depth'
                    )),
  seat_id           uuid REFERENCES addie.seats(id) ON DELETE SET NULL,
  status            addie.entitlement_status NOT NULL DEFAULT 'active',
  stripe_session_id text,
  expires_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product, seat_id)
);

CREATE INDEX idx_addie_entitlements_user        ON addie.entitlements(user_id);
CREATE INDEX idx_addie_entitlements_user_active ON addie.entitlements(user_id) WHERE status = 'active';

ALTER TABLE addie.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner reads own addie entitlements"
  ON addie.entitlements FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
-- INSERT/UPDATE only from server (Stripe webhook with service_role).

-- Tighten the addie.lessons paid-content policy now that the table exists.
CREATE POLICY "paid reads published paid addie lessons"
  ON addie.lessons FOR SELECT
  TO authenticated
  USING (
    published
    AND module_id IN (SELECT id FROM addie.modules WHERE tier = 'paid' AND published)
    AND EXISTS (
      SELECT 1 FROM addie.entitlements
      WHERE user_id = (select auth.uid())
        AND status  = 'active'
        AND product IN ('foundation_individual','foundation_team_seat')
    )
  );
