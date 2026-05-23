# AiBI — Database Schema & RLS Spec
*Concrete Postgres schema + row-level security for the Foundation Course. Implements Foundation PRD §8 (data model) and §6 (functional requirements). Audience: backend engineers.*

| | |
|---|---|
| **Database** | Supabase Postgres |
| **Identity** | Supabase Auth (email/password + OAuth) — learners create their own accounts |
| **Auth helper** | `(select auth.uid())` per RLS performance pattern (CLAUDE.md) |
| **Status** | Spec v1 — apply before any feature that reads/writes learner data |

---

## 1 · Purpose & role
This spec turns the PRD §8 entity list into concrete tables, columns, types, FKs, indexes, and RLS policies. Everything that touches learner state reads and writes through this schema. RLS is the security boundary inside the database: every table that contains learner data must deny by default and allow only the owning learner (or, where named, a team admin scoped to their team).

## 2 · Design principles
1. **RLS-first.** Every table with learner data has RLS **enabled** and starts from `deny all`. Add policies, never disable.
2. **`(select auth.uid())`** pattern in every policy — ~95% perf improvement (CLAUDE.md).
3. **Index policy columns.** Any column an RLS policy compares on must be indexed.
4. **UUID primary keys** (`gen_random_uuid()`), `timestamptz` for all times, `created_at` + `updated_at` on mutable tables.
5. **Soft state, hard FKs.** Use `status` enums for lifecycle (e.g., `seat_status`); use `ON DELETE` rules deliberately (mostly `RESTRICT` for audit-relevant tables, `CASCADE` only where the child is meaningless without the parent).
6. **No raw sensitive data.** PII/account/customer data is structurally impossible to enter (sandbox bounded inputs). No table accepts it; any text column that *could* receive learner free text is documented as "public/non-sensitive" by policy.
7. **Identity ladder.** Three identity states must work end-to-end: **anonymous viewer** (no row anywhere) → **email lead** (`leads` row, no `auth.users` row) → **authenticated learner** (`auth.users` + `learner_profiles` row). The schema supports all three without forcing premature account creation.
8. **Email is canonical lead key.** Until a learner authenticates, the `leads` row keyed by email is the identity. When they later sign up with the same email, a server process (§9) **binds** the lead to the auth user.

## 3 · Entity overview (PRD §8 → tables)

| PRD entity | Table(s) | Notes |
|---|---|---|
| Learner | `auth.users` (Supabase Auth) + `learner_profiles` | Auth row is Supabase-managed; `learner_profiles` holds course-specific fields |
| Profile (assessment-written) | `learner_profiles` (track, tool_exposure, comfort_level), `assessment_results` (dimension scores) | The assessment writes; the course reads |
| Entitlement | `entitlements` | Unlocks M4–M5 and unlimited Toolbox |
| Team | `teams` | ≥10 seats, single admin |
| Seat | `seats` | Invite / assign / revoke |
| Module / Lesson | `modules`, `lessons`, `lesson_track_variants` | Content engine; updatable without code deploy (§7 of PRD FR-C7) |
| KnowledgeCheck / Result | `knowledge_checks`, `knowledge_check_results` | L2 metric |
| SandboxSession | `sandbox_sessions` *(owned by Sandbox spec)* | No raw sensitive data |
| ToolboxItem (Artifact) | `toolbox_items`, `toolbox_item_versions` | `.md` exportable, versioned |
| Lead | `leads` | Email-only identity at the gate |
| AssessmentResult | `assessment_results` | 48 Q · 8 dimensions · four deliverables |
| Event | `events` | Analytics spine; PRD FR-N1 — Supabase, no third-party LMS |

**Also owned by the Sandbox spec (not redefined here, just listed):** `exercises`, `sandbox_sessions`. The sandbox spec §10 is authoritative for those two tables; cross-reference only.

---

## 4 · Enums (create first, referenced everywhere)

```sql
CREATE TYPE track AS ENUM (
  'risk_compliance', 'customer_facing', 'back_office', 'technical', 'leadership'
);
CREATE TYPE comfort_level   AS ENUM ('new', 'curious', 'comfortable', 'fluent');
CREATE TYPE tool_exposure   AS ENUM ('none', 'consumer', 'work_assistant', 'builder');
CREATE TYPE tier            AS ENUM ('free', 'paid');
CREATE TYPE entitlement_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE seat_status     AS ENUM ('invited', 'assigned', 'revoked');
CREATE TYPE artifact_type   AS ENUM (
  'data_discipline_card', 'ai_toolkit_map', 'first_conversation',
  'starter_prompt_pack', 'skill', 'skill_template',
  'agent_blueprint', 'prd', 'prototype', 'problem_backlog'
);
CREATE TYPE gate_decision   AS ENUM ('pay', 'email', 'decline');
CREATE TYPE lesson_modality AS ENUM (
  'video', 'audio', 'interactive', 'sandbox', 'worksheet', 'reading'
);
```

## 5 · Tables

### 5.1 · `learner_profiles`
Course-specific profile for an authenticated learner. One row per `auth.users` row.

```sql
CREATE TABLE learner_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            citext UNIQUE NOT NULL,                  -- canonical, lowercase
  track            track,                                    -- nullable until selected (M0.1)
  tool_exposure    tool_exposure,                            -- written by assessment
  comfort_level    comfort_level,                            -- written by assessment
  marketing_opt_in boolean NOT NULL DEFAULT false,           -- PRD NFR-PRIV1
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_learner_profiles_email ON learner_profiles(email);
```

**RLS:**
```sql
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner reads own profile"   ON learner_profiles FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "learner updates own profile" ON learner_profiles FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id);
-- INSERT happens server-side (trigger on auth.users) — no client policy.
```

### 5.2 · `leads`
Email-captured identity *before* (or instead of) an `auth.users` row. Created at the gate.

```sql
CREATE TABLE leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext UNIQUE NOT NULL,
  source          text NOT NULL CHECK (source IN ('gate','assessment','newsletter','other')),
  track           track,                          -- carried from anon session if known
  marketing_opt_in boolean NOT NULL DEFAULT false,
  bound_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- set when user signs up
  nurture_state   text,                           -- MailerLite-synced state mirror
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_bound_user ON leads(bound_user_id);
```

**RLS:** `leads` is **server-only** — never read or written by the client. Enable RLS, write **no** authenticated/anon policies. Server uses `service_role`.

### 5.3 · `entitlements`
What unlocks M4–M5 + unlimited Toolbox. One per (user, product) for individuals; one per assigned seat for teams.

```sql
CREATE TABLE entitlements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product      text NOT NULL CHECK (product IN ('foundation_individual','foundation_team_seat','assessment_in_depth')),
  seat_id      uuid REFERENCES seats(id) ON DELETE SET NULL,    -- null for individual
  status       entitlement_status NOT NULL DEFAULT 'active',
  stripe_session_id text,
  expires_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product, seat_id)
);
CREATE INDEX idx_entitlements_user ON entitlements(user_id);
CREATE INDEX idx_entitlements_user_active ON entitlements(user_id) WHERE status = 'active';
```

**RLS:**
```sql
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learner reads own entitlements" ON entitlements FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
-- INSERT/UPDATE only from server (Stripe webhook with service_role).
```

### 5.4 · `teams` and `seats`
Team purchase: admin buys ≥10 seats, invites learners by email, each invitee self-registers.

```sql
CREATE TABLE teams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  name             text NOT NULL,
  seats_purchased  integer NOT NULL CHECK (seats_purchased >= 10),
  stripe_subscription_id text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE seats (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_email citext NOT NULL,
  learner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- set on accept
  status        seat_status NOT NULL DEFAULT 'invited',
  invited_at    timestamptz NOT NULL DEFAULT now(),
  accepted_at   timestamptz,
  revoked_at    timestamptz,
  UNIQUE (team_id, invited_email)
);
CREATE INDEX idx_seats_team ON seats(team_id);
CREATE INDEX idx_seats_learner ON seats(learner_user_id);
```

**RLS:**
```sql
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Admin sees + manages own team
CREATE POLICY "admin reads own team"   ON teams FOR SELECT
  TO authenticated USING ((select auth.uid()) = admin_user_id);
CREATE POLICY "admin updates own team" ON teams FOR UPDATE
  TO authenticated USING ((select auth.uid()) = admin_user_id);

-- Admin manages all seats on own team
CREATE POLICY "admin reads team seats" ON seats FOR SELECT
  TO authenticated USING (
    team_id IN (SELECT id FROM teams WHERE admin_user_id = (select auth.uid()))
  );
CREATE POLICY "admin manages team seats" ON seats FOR ALL
  TO authenticated USING (
    team_id IN (SELECT id FROM teams WHERE admin_user_id = (select auth.uid()))
  );

-- A learner can read their own seat row
CREATE POLICY "learner reads own seat" ON seats FOR SELECT
  TO authenticated USING ((select auth.uid()) = learner_user_id);
```

### 5.5 · `modules`, `lessons`, `lesson_track_variants`
Content engine. PRD FR-C7 — authorable without code deploy. Treat as **public-read**, server-write only.

```sql
CREATE TABLE modules (
  id          text PRIMARY KEY,           -- 'm0', 'm1', ..., 'm5'
  ordinal     smallint NOT NULL UNIQUE,
  title       text NOT NULL,
  tier        tier NOT NULL,              -- free | paid
  summary     text,
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lessons (
  id           text PRIMARY KEY,           -- 'm0.1', 'm3.2', ...
  module_id    text NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
  ordinal      smallint NOT NULL,
  title        text NOT NULL,
  modality     lesson_modality NOT NULL,
  duration_min smallint NOT NULL CHECK (duration_min <= 15),  -- structural enforcement
  is_branched  boolean NOT NULL DEFAULT false,
  exercise_id  text,                       -- → sandbox exercises.id (no FK; sandbox spec owns the table)
  takeaway_artifact_type artifact_type,
  published    boolean NOT NULL DEFAULT false,
  UNIQUE (module_id, ordinal)
);
CREATE INDEX idx_lessons_module ON lessons(module_id);

CREATE TABLE lesson_track_variants (
  lesson_id    text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  track        track NOT NULL,
  body_md      text NOT NULL,              -- per-track content
  media_ref    text,                       -- storage path, if any
  PRIMARY KEY (lesson_id, track)
);
```

**RLS:**
```sql
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_track_variants ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read published free content.
-- Authenticated learners with an active entitlement can read paid content.
CREATE POLICY "public reads published free lessons" ON lessons FOR SELECT
  TO anon, authenticated USING (
    published AND module_id IN (SELECT id FROM modules WHERE tier = 'free' AND published)
  );
CREATE POLICY "paid reads published paid lessons" ON lessons FOR SELECT
  TO authenticated USING (
    published AND module_id IN (SELECT id FROM modules WHERE tier = 'paid' AND published)
    AND EXISTS (
      SELECT 1 FROM entitlements
      WHERE user_id = (select auth.uid())
        AND status = 'active'
        AND product IN ('foundation_individual','foundation_team_seat')
    )
  );

CREATE POLICY "public reads published modules" ON modules FOR SELECT
  TO anon, authenticated USING (published);

-- Track variants: same pattern (mirrored from lessons via lesson_id check).
CREATE POLICY "reads track variant of accessible lesson" ON lesson_track_variants FOR SELECT
  TO anon, authenticated USING (
    lesson_id IN (SELECT id FROM lessons WHERE published)  -- the lessons policy then filters by tier
  );
-- All writes are server-only (admin content editor).
```

### 5.6 · `knowledge_checks` and `knowledge_check_results`
PRD FR-C5 — 2–3 checks per lesson, logged for L2.

```sql
CREATE TABLE knowledge_checks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  ordinal     smallint NOT NULL,
  prompt      text NOT NULL,
  options     jsonb NOT NULL,             -- [{id,label,correct:bool}]
  UNIQUE (lesson_id, ordinal)
);

CREATE TABLE knowledge_check_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_session_id uuid,                    -- for anonymous M0–M3 learners
  check_id        uuid NOT NULL REFERENCES knowledge_checks(id) ON DELETE CASCADE,
  selected_option text NOT NULL,
  correct         boolean NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR anon_session_id IS NOT NULL)
);
CREATE INDEX idx_kcr_user ON knowledge_check_results(user_id);
CREATE INDEX idx_kcr_check ON knowledge_check_results(check_id);
```

**RLS:**
```sql
ALTER TABLE knowledge_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_check_results ENABLE ROW LEVEL SECURITY;

-- Checks: same access pattern as lessons (public read for free; entitlement-gated for paid)
CREATE POLICY "reads checks for accessible lessons" ON knowledge_checks FOR SELECT
  TO anon, authenticated USING (
    lesson_id IN (SELECT id FROM lessons WHERE published)
  );

-- Results: learner reads own; anon writes via server (anon_session_id only)
CREATE POLICY "learner reads own results" ON knowledge_check_results FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
-- INSERT goes through server endpoints (validates correctness, prevents tampering).
```

### 5.7 · `toolbox_items` and `toolbox_item_versions`
PRD FR-T1–T6. Persistence requires identity (email-lead OR paid). Versioned. `.md` exportable.

```sql
CREATE TABLE toolbox_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id       uuid REFERENCES leads(id)      ON DELETE CASCADE,
  type          artifact_type NOT NULL,
  title         text NOT NULL,
  lesson_id     text REFERENCES lessons(id) ON DELETE SET NULL,
  track         track,                          -- snapshot of the learner's track at save
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR lead_id IS NOT NULL)
);
CREATE INDEX idx_toolbox_items_user ON toolbox_items(user_id);
CREATE INDEX idx_toolbox_items_lead ON toolbox_items(lead_id);

CREATE TABLE toolbox_item_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id        uuid NOT NULL REFERENCES toolbox_items(id) ON DELETE CASCADE,
  version        smallint NOT NULL,
  body_md        text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, version)
);
CREATE INDEX idx_tiv_item ON toolbox_item_versions(item_id);
```

**RLS:**
```sql
ALTER TABLE toolbox_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolbox_item_versions ENABLE ROW LEVEL SECURITY;

-- Authenticated owner
CREATE POLICY "learner reads own items"   ON toolbox_items FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "learner writes own items"  ON toolbox_items FOR ALL
  TO authenticated USING ((select auth.uid()) = user_id);

-- Free-tier (lead-keyed) items: server-only via service_role.
-- Lead-keyed items become user-keyed when the lead binds (§9).

-- Versions: mirror the parent
CREATE POLICY "learner reads own versions"  ON toolbox_item_versions FOR SELECT
  TO authenticated USING (
    item_id IN (SELECT id FROM toolbox_items WHERE user_id = (select auth.uid()))
  );
CREATE POLICY "learner writes own versions" ON toolbox_item_versions FOR INSERT
  TO authenticated WITH CHECK (
    item_id IN (SELECT id FROM toolbox_items WHERE user_id = (select auth.uid()))
  );

-- Free-tier cap of 4 light artifacts is enforced server-side (count + reject on save).
```

### 5.8 · `assessment_results`
48 questions, 8 dimensions, four deliverables (scorecard · plan · ideas+prompts · CTAs). The assessment writes; the course reads dimension scores + track/tool_exposure/comfort onto `learner_profiles`.

```sql
CREATE TABLE assessment_results (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id          uuid REFERENCES leads(id)      ON DELETE CASCADE,
  email            citext NOT NULL,
  raw_answers      jsonb NOT NULL,                 -- [{question_id, value}]
  dimension_scores jsonb NOT NULL,                 -- {dim_id: score} (8 dims)
  plan_md          text,                           -- generated personalized plan
  ideas_prompts_md text,                           -- curated ideas + prompts
  ctas_md          text,                           -- recommended next steps
  stripe_session_id text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ar_user  ON assessment_results(user_id);
CREATE INDEX idx_ar_lead  ON assessment_results(lead_id);
CREATE INDEX idx_ar_email ON assessment_results(email);
```

**RLS:**
```sql
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learner reads own assessment" ON assessment_results FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
-- INSERT only from server (after Stripe webhook confirms purchase + assessment completion).
```

### 5.9 · `events`
Analytics spine. PRD FR-N1: lesson views/completions, knowledge-check results, sandbox runs, artifact saves/reuse, gate decisions. PRD FR-N3 — **Toolbox reuse** is the headline metric.

```sql
CREATE TABLE events (
  id              bigserial PRIMARY KEY,           -- high-volume; bigserial, not uuid
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_id         uuid REFERENCES leads(id)      ON DELETE SET NULL,
  anon_session_id uuid,
  action          text NOT NULL,                   -- 'lesson_view', 'lesson_complete', 'sandbox_run', 'artifact_save', 'artifact_reuse', 'gate_decision', etc.
  object_type     text,                            -- 'lesson', 'module', 'toolbox_item', 'gate', ...
  object_id       text,
  payload         jsonb,                           -- action-specific {tier, score, fork, provider, ...}
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_user_created ON events(user_id, created_at DESC);
CREATE INDEX idx_events_action_created ON events(action, created_at DESC);
CREATE INDEX idx_events_object ON events(object_type, object_id);
```

**RLS:**
```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- Writes are server-only (service_role).
-- Learners do not read events. Internal dashboards use service_role.
-- Team-admin rollups read aggregates through a SECURITY DEFINER view (§7).
```

> **Event taxonomy** (the exact `action` strings + payload shapes) is its own derivative spec — `AiBI_Event_Taxonomy_Spec.md` (to write). This schema defines the *table*; the taxonomy defines what the rows mean.

---

## 6 · Sandbox tables (owned by the Sandbox spec)
`exercises` and `sandbox_sessions` are defined in `AiBI_Sandbox_Service_Tech_Spec.md §10`. Summary only:
- `exercises` — server-only columns (`system_prompt`, `lever_directives`) **must** be column-level locked; never expose via PostgREST. Use a server-only view for the client-safe descriptor.
- `sandbox_sessions` — learner reads own; service_role writes; no raw sensitive data.

If the sandbox spec changes its schema, that spec wins; this doc mirrors after.

---

## 7 · Team-admin views (read-only aggregates, no artifact content)
PRD FR-D4 — the dashboard never exposes learner artifact bodies or sandbox transcripts. Implement as `SECURITY DEFINER` views the admin reads:

```sql
CREATE VIEW team_progress_v AS
SELECT s.team_id, s.id AS seat_id, lp.user_id,
       COUNT(DISTINCT e.object_id) FILTER (WHERE e.action='lesson_complete') AS lessons_completed,
       COUNT(*) FILTER (WHERE e.action='sandbox_run')   AS sandbox_runs,
       COUNT(*) FILTER (WHERE e.action='artifact_save') AS artifacts_saved,
       MAX(e.created_at) AS last_activity_at
FROM seats s
LEFT JOIN learner_profiles lp ON lp.user_id = s.learner_user_id
LEFT JOIN events e            ON e.user_id  = s.learner_user_id
WHERE s.status = 'assigned'
GROUP BY s.team_id, s.id, lp.user_id;
-- RLS on the view: admin sees rows where team is theirs.
```

Aggregate only. No `body_md`, no transcripts, ever.

---

## 8 · Storage buckets `[Supabase Storage]`

| Bucket | Purpose | Access |
|---|---|---|
| `course-media` | Video, audio, captions, transcripts | Public read (free tier) / signed URLs scoped to entitlement (paid tier) |
| `toolbox-exports` | `.md` exports of artifacts | Signed URLs scoped to `(select auth.uid()) = user_id` |
| `assessment-deliverables` | PDF/MD versions of the four deliverables | Signed URLs scoped to assessment ownership |

Bucket policies mirror the RLS posture on the corresponding tables.

---

## 9 · Identity-ladder transitions (server flows)

These transitions are server-only and run with `service_role`. They are *not* RLS policies — they are the controlled bridges between identity states.

1. **Anonymous → Lead** (gate, "Email-to-keep"):
   - Validate email · upsert `leads(email, source='gate', track=<anon track>, marketing_opt_in=<consent>)`
   - Migrate any in-session knowledge-check results / toolbox items keyed by `anon_session_id` to `lead_id`.
   - Sync to MailerLite. Emit `gate_decision`.
2. **Lead → Learner** (purchase or self-signup with same email):
   - On Stripe webhook OR Supabase `auth.users` insert, find `leads.email`. If found, set `leads.bound_user_id`.
   - Rewrite child rows: `toolbox_items.lead_id → user_id`, `assessment_results.lead_id → user_id`, etc.
   - Create `learner_profiles` row (Supabase trigger on `auth.users.insert`).
   - Write `entitlements` row from the Stripe session.
3. **Team admin invites seat → Seat → Learner**:
   - Admin creates `seats` rows (`invited_email`, `status='invited'`). MailerLite sends invitation.
   - Invitee signs up with that email · trigger detects matching `invited_email` · sets `learner_user_id` + `status='assigned'`.
   - Write `entitlements(product='foundation_team_seat', seat_id=...)`.

Each transition emits an `events` row.

---

## 10 · Triggers (the small list)

```sql
-- 1. New auth.users → create learner_profiles
CREATE OR REPLACE FUNCTION create_learner_profile() RETURNS trigger AS $$
BEGIN
  INSERT INTO learner_profiles (user_id, email)
  VALUES (NEW.id, LOWER(NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_create_learner_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_learner_profile();

-- 2. Updated_at maintenance (one function, applied per-table)
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
-- Attach to learner_profiles, leads, teams, toolbox_items, modules, lessons, ...
```

Anything more complex (lead binding, seat assignment) lives in **server endpoints**, not triggers — easier to test, observe, and roll back.

---

## 11 · Migration order (respects FKs)

1. Enums (§4).
2. `auth.users` (Supabase-provided) — no action; the rest references it.
3. `leads`.
4. `learner_profiles` + trigger.
5. `teams` → `seats`.
6. `modules` → `lessons` → `lesson_track_variants`.
7. `entitlements` (after `seats`, references it).
8. `knowledge_checks` → `knowledge_check_results`.
9. `assessment_results`.
10. `toolbox_items` → `toolbox_item_versions`.
11. `events` (referenced by nothing; built last).
12. Sandbox tables (per `AiBI_Sandbox_Service_Tech_Spec.md`).
13. Views (`team_progress_v`).

Each step ships as one migration file (`/supabase/migrations/<ts>_<name>.sql`), reviewed before apply. Use `supabase db query --linked` for one-off reads on remote (per CLAUDE.md memory note); never `supabase db push` if local + remote migration histories have diverged.

---

## 12 · Acceptance gates (must pass before any feature ships)

- [ ] Every learner-data table has `ALTER TABLE … ENABLE ROW LEVEL SECURITY` and at least one policy.
- [ ] No policy compares against `auth.uid()` without the `(select …)` wrapper.
- [ ] Every column an RLS policy filters on is indexed.
- [ ] Anonymous role can read **only** published free modules/lessons/checks; cannot read leads, results, artifacts, events.
- [ ] Authenticated learner reads only their own profile, entitlements, results, items, versions, sessions, assessments.
- [ ] Team admin reads team rollup view but **cannot** read any artifact body or sandbox transcript.
- [ ] Sandbox `exercises.system_prompt` and `.lever_directives` are unreachable from PostgREST.
- [ ] `course-media` paid assets require a signed URL bound to an active entitlement.
- [ ] `assessment_results` and `toolbox_items` correctly bind from `lead_id` → `user_id` when an email lead signs up.
- [ ] A second test learner cannot read the first learner's rows in any table.

---

## 13 · Open decisions

1. **Anonymous session identifier.** A cookie-scoped `anon_session_id` (uuid) so anonymous M0–M3 learners get progress + transient items that can be migrated to `lead_id` at the gate. Lifetime + rotation policy TBD.
2. **Storage of preset context blocks** (sandbox). Sandbox spec stores them in `exercises`; if they grow large, move to a `preset_context_blocks` table referenced by id. Keep small for now.
3. **`events` retention / partitioning.** High-volume; partition by month if needed. v1: single table + indexes; revisit at first scale check.
4. **Soft-delete strategy.** Default is hard delete via `ON DELETE CASCADE`. Add `deleted_at` where audit history matters (entitlements? events?) — open question driven by privacy/retention policy (PRD NFR-PRIV2).
5. ~~**`assessment_results` shape vs. existing `content/assessments/v2/`.**~~ **Resolved 2026-05-23:** ADDIE adopts the existing 8-dimension model from `content/assessments/v2/`. `dimension_scores` jsonb holds 8 keys; Wave 3b wires the runner to write into `addie.assessment_results`. See DECISIONS.md.
6. **Index for "active entitlement" lookup.** Partial index defined above (`WHERE status='active'`); confirm Postgres planner uses it before relying on it.

---

## 14 · Cross-references
- Foundation PRD §8 (entities), §6 (functional requirements), §7.1 (security NFRs), §9 (stack).
- Sandbox Service Tech Spec §10 (sandbox tables — authoritative).
- CLAUDE.md "RLS Performance Pattern" (the `(select auth.uid())` rule).
- Handoff Docs Checklist — this doc closes the "Database schema + RLS spec" P1.
