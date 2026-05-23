-- 00041_addie_teams_seats.sql
-- Team SKU: admin buys ≥10 seats, invites by email. Spec §5.4.

CREATE TABLE addie.teams (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  name                   text NOT NULL,
  seats_purchased        integer NOT NULL CHECK (seats_purchased >= 10),
  stripe_subscription_id text,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addie_teams_admin ON addie.teams(admin_user_id);

CREATE TABLE addie.seats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES addie.teams(id) ON DELETE CASCADE,
  invited_email   citext NOT NULL,
  learner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status          addie.seat_status NOT NULL DEFAULT 'invited',
  invited_at      timestamptz NOT NULL DEFAULT now(),
  accepted_at     timestamptz,
  revoked_at      timestamptz,
  UNIQUE (team_id, invited_email)
);

CREATE INDEX idx_addie_seats_team    ON addie.seats(team_id);
CREATE INDEX idx_addie_seats_learner ON addie.seats(learner_user_id);
CREATE INDEX idx_addie_seats_email   ON addie.seats(invited_email);

ALTER TABLE addie.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE addie.seats ENABLE ROW LEVEL SECURITY;

-- Admin sees + manages own team
CREATE POLICY "admin reads own addie team"
  ON addie.teams FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = admin_user_id);

CREATE POLICY "admin updates own addie team"
  ON addie.teams FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = admin_user_id);

-- Admin manages all seats on own team
CREATE POLICY "admin reads addie team seats"
  ON addie.seats FOR SELECT
  TO authenticated
  USING (
    team_id IN (SELECT id FROM addie.teams WHERE admin_user_id = (select auth.uid()))
  );

CREATE POLICY "admin manages addie team seats"
  ON addie.seats FOR ALL
  TO authenticated
  USING (
    team_id IN (SELECT id FROM addie.teams WHERE admin_user_id = (select auth.uid()))
  )
  WITH CHECK (
    team_id IN (SELECT id FROM addie.teams WHERE admin_user_id = (select auth.uid()))
  );

-- Learner can read their own seat row
CREATE POLICY "learner reads own addie seat"
  ON addie.seats FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = learner_user_id);
