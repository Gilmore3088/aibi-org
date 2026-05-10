# AiBI-Foundation v2 Migration Punch List

Staged migration of the current AiBI-Practitioner course (12 modules, $295)
to AiBI-Foundation v2 (four-track family). Canonical bundle:
`Plans/foundation-v2/`. Decision context: CLAUDE.md → Decisions Log →
2026-05-09 entry.

This is multi-week work. Order matters — earlier phases unblock later ones.
Each phase ends with a deployable, testable artifact. Pricing and rename
gates are explicit so we don't ship half a relabel.

---

## Phase 0 — Decisions captured (2026-05-09)

- [x] v2 bundle landed at `Plans/foundation-v2/`
- [x] Voice-clone / deepfake elements marked deferred (banner on M5, L2, L4
  + 3 voice artifacts)
- [x] Real-world capture (Activity Type 8) marked deferred — Final Lab
  reverts to synthetic-only inputs at launch
- [x] CLAUDE.md Decisions Log entry written
- [x] CLAUDE.md "Reference Plans" table updated to reference
  `Plans/foundation-v2/`

## Phase 1 — Authoring (DONE 2026-05-10)

- [x] Hard cut: new folder `content/courses/aibi-foundation/` parallel to
  `aibi-p/`. v1 untouched.
- [x] Foundation Lite (4 modules: L1–L4) authored at production depth.
- [x] Manager Track (3 modules: M1–M3) authored at production depth.
- [x] Board Briefing (2 modules: BB1–BB2) authored at production depth.
- [x] Foundation Full (20 modules) authored at production depth in
  `content/courses/aibi-foundation/full/module-01.ts` through `-20.ts`.
  Pillar order strictly linear (Awareness 1–4 · Understanding 5–10 ·
  Creation 11–15 · Application 16–20).
- [x] Type-clean (`npx tsc --noEmit` passes).
- [x] Editorial decisions baked in: M5 / L2 / L4 ship text-only (voice
  clone / deepfake elements deferred); M9 / M16 / M17 / M20 use
  build-test or adaptive-scenario instead of Activity Type 8 (real-world
  capture deferred at v2 launch).

Authoring artifacts referenced from `Plans/foundation-v2/.../artifacts/`
(33 markdown templates) — wiring those templates into the runtime artifact
store is part of Phase 5 (platform build), not Phase 1. The TypeScript
module objects already reference the templates by `templatePath`.

The `content/courses/aibi-foundation/full/module-NN.ts` files are
production-depth: typed sections, typed activities, learning objectives,
daily-use outcomes, dependencies, forwardLinks, artifacts, and a `specRef`
pointer back to the canonical markdown spec under `Plans/foundation-v2/`.
The canonical markdown remains the rich source-of-truth for facilitator
notes and the deeper "why this exists" framing; the TS file is the
runtime contract for the platform.

## Phase 2 — Rename in user-facing copy (DONE 2026-05-10)

- [x] Replaced "AiBI-Practitioner" → "AiBI-Foundation" across 66 files in
  `src/`, `content/`, `public/`. Includes: certificate PDF designation,
  transformation report, skill template library, onboarding, assessment
  recommendations, Resend wrapper subject lines, course pages, navigation,
  homepage description.
- [x] Internal identifiers preserved: route `/courses/aibi-p`, DB
  `product='aibi-p'`, file path `public/AiBI-P/`, env var names, Stripe
  metadata keys, Resend template aliases, certificate ID format
  (`AIBI-P-…`), UTM codes, sandbox-data path slugs. Comments documenting
  the historical "AiBI-P" name kept for context.
- [x] tsc --noEmit clean.

### Operator-side follow-ups (cannot be done from the codebase)

- [ ] **Resend dashboard** — update template *bodies* for the 5 published
  templates: `assessment-results-breakdown`, `course-purchase-individual`,
  `course-purchase-institution`, `certificate-issued`, `inquiry-ack`.
  Subject lines are sent by the wrapper helpers and already say
  "AiBI-Foundation"; bodies in the dashboard still say "AiBI-Practitioner"
  until manually updated.
- [ ] **MailerLite Automations** — copy in the 5 live Automations
  (Newsletter welcome + 4 tier sequences) references the credential by
  name; review each email and update where "AiBI-Practitioner" appears.
  Source-of-truth copy in `src/lib/mailerlite/email-content.ts` is
  already updated by this rename; the dashboard versions need a re-sync
  per the 2026-05-08 decision pattern (delete and recreate, or edit in
  place).
- [ ] **Stripe product names** — Stripe metadata keys preserved, but the
  customer-facing product *name* in Stripe checkout still says
  "AiBI-Practitioner". Update in Stripe dashboard.
- [ ] **Supabase Auth email templates** — if any reference the
  credential name in signup/reset/magic-link emails, update there.

## Phase 3 — Stripe pricing changes

Pricing change from $295 → $495 is a hard product gate. Existing AiBI-P
buyers must keep their entitlement at the v1 price — do not retroactively
charge anyone the delta.

- [ ] Create new Stripe products + prices: `aibi-foundation-full` ($495,
  $349 institution), `aibi-foundation-lite` ($99 + volume tiers),
  `aibi-foundation-manager` ($195), `aibi-foundation-board` ($295/dir or
  $1,495 flat).
- [ ] Add new env vars: `STRIPE_FOUNDATION_FULL_PRICE_ID`,
  `STRIPE_FOUNDATION_FULL_INSTITUTION_PRICE_ID`,
  `STRIPE_FOUNDATION_LITE_PRICE_ID`,
  `STRIPE_FOUNDATION_MANAGER_PRICE_ID`,
  `STRIPE_FOUNDATION_BOARD_DIRECTOR_PRICE_ID`,
  `STRIPE_FOUNDATION_BOARD_FLAT_PRICE_ID`.
- [ ] Decide volume-pricing implementation for Lite (Stripe doesn't have
  built-in volume tiers on Checkout — likely needs a quantity-based
  Checkout Session with a per-seat price, or a custom enrollment flow).
- [ ] Keep existing `STRIPE_AIBIP_PRICE_ID` and
  `STRIPE_AIBIP_INSTITUTION_PRICE_ID` active so anyone with an old payment
  link still works; old Stripe products **deactivate**, do not delete (per
  CLAUDE.md never-delete rule).
- [ ] Test: full $495 Foundation Full Checkout → webhook → enrollment row
  → course purchase email. Use Stripe test mode on staging first.

## Phase 4 — Course shells + routing (PARTIAL DONE 2026-05-10)

- [x] Top-level overview at `/courses/foundation` rendering all four tracks
  with metadata, pricing, audience.
- [x] Track detail at `/courses/foundation/[track]` rendering module list
  with pillar tags, time estimates, key outputs.
- [x] Module detail at `/courses/foundation/[track]/[module]` rendering
  whyThisExists, learning objectives, daily-use outcomes, sections (with
  light-markdown rendering for prose + tables), activities (form fields
  via the activity dispatcher), and prev/next navigation.
- [x] Component scaffold under
  `src/app/courses/foundation/_components/`: `LightMarkdown`,
  `SectionRenderer`, `ActivityRenderer`. ActivityRenderer dispatches on
  the 8 activity types with engine-pending callouts.

Operator-side or follow-up work for Phase 4:
- [ ] Add prerequisite check for Manager Track (requires Foundation Full
  completion or Lite + 6 mo supervisory experience). Stubbed in the data
  layer (`Track.prerequisite`) but not yet enforced in the route.
- [ ] DB: add `product` enum values for the four new SKUs in
  `course_enrollments` — keep `aibi-p` as legacy. Migration goes through
  `mcp__supabase__apply_migration` and needs explicit user approval per
  CLAUDE.md.
- [ ] Browser-test the routes (CLAUDE.md requires this for UI changes;
  not done in the code-only commit).
- [ ] Decide on enrollment gating: do these routes require sign-in,
  or are they previewable like `/courses/aibi-p` is today?

## Phase 5 — Platform build (SCAFFOLDING DONE 2026-05-10; ENGINES PENDING)

The dispatcher pattern is live: every activity type renders through
`ActivityRenderer` (`src/app/courses/foundation/_components/`). Each of
the 8 types currently shows:
1. The activity title, time estimate, and description.
2. A clearly-marked "engine pending" callout describing what the
   interactive engine will do.
3. The activity's typed form fields rendered as a real HTML form
   (text/textarea/radio/select/file) so the platform can capture
   learner work as a fallback even before the engine is built.

The engines themselves still need to be built. Each is a real engineering
product:

The v2 spec calls for a custom learning platform beyond standard course
mechanics. This is the work most likely to slip. Sequenced by leverage:

- [ ] **Multi-model orchestrator** — parallel inference (3+ models, same
  prompt, side-by-side streaming UI). `src/lib/ai-harness/` already has
  multi-provider scaffolding; the streaming + 3-column UI is new.
- [ ] **Drag-and-drop classifier with adaptive feedback** (Activity Type 3)
  — used in M4 (data-tier sort, 20 items rotated quarterly).
- [ ] **Branching scenario engine** (Activity Type 4) — used in M3, M6,
  M7, L4. Twine-compatible authoring per the spec.
- [ ] **Build-and-test environment** with adversarial inputs (Activity
  Type 5) — used in M5, M10, M17.
- [ ] **Annotation overlay** for find-the-flaw (Activity Type 6) — used
  in M2, M8, M11, M15.
- [ ] **Tabletop simulation engine** (Activity Type 7) — linear with
  decision points; used in M5 (phishing) and M18 (incident response).
- [ ] **Schema-validated artifact store** — Personal Prompt Library
  enforces the 18-field schema; rejects non-conformant saves; supports
  manager-review link generation; export-all to ZIP.
- [ ] **Cost telemetry per learner** — track API spend; budget is $2–4 per
  Full learner across ~200–300 model calls. Course-owned keys (BYOK not
  required).

Activity Type 8 (real-world capture with NPI regex guard) is **DEFERRED**
per Phase 0 decision — Final Lab uses synthetic inputs only at launch.

## Phase 6 — Quarterly refresh mechanics (ARCHITECTURE DONE 2026-05-10)

- [x] Slot architecture defined in
  `content/courses/aibi-foundation/refresh-slots.ts`. Seven slots
  declared (M2 hallucinations, M4 sort bank, M11 extraction flaw,
  M12 anomaly false positive, M15 vendor pitches, M19 examiner
  scenarios, M20 final-lab errors). Lifecycle is `current` /
  `onDeck` / `archive`. Engines call `getCurrentVariation(key)`.
- [x] Type-safe content shapes (SortItem, PlantedFabrication,
  VendorPitch, ExaminerScenario, FinalLabError) for the variations.

Authoring follow-ups:
- [ ] Author the first set of variations (2026-Q2 release) under
  `content/courses/aibi-foundation/refresh/2026-Q2-*.ts` and wire
  into `CURRENT_VARIATIONS` in `refresh-slots.ts`.
- [ ] Author the on-deck set for 2026-Q3 release.
- [ ] Document the operator handoff for quarter rollover (promote
  onDeck -> current, archive prior current).

## Phase 7 — Sales / GTM

- [ ] Foundation positioning doc (`Plans/foundation-v2/aibi-foundation-v2/
  positioning/foundation-positioning.md`) feeds homepage copy + email
  sequences.
- [ ] Pricing page rebuild — four tracks instead of one Practitioner row.
- [ ] Volume pricing calculator for Lite (bank-wide enrollment).
- [ ] Communication kit: executive announcement email, 5-min kickoff
  video script, intranet banner, manager FAQ, weekly tracker template.
- [ ] Update assessment tier email sequences to point at Foundation tracks
  (current sequences in `src/lib/mailerlite/email-content.ts` reference
  AiBI-Practitioner as the next step — needs reword).

---

## Open questions

- Does the current `aibi-foundation-v3.html` Plan need updating, or is
  v2 a separate canonical addition? (Currently Plans table lists both.)
- Stripe volume-pricing approach for Lite — quantity-based Checkout
  Session, or custom institutional enrollment flow with a single
  invoice?
- Lite mandatory-bank-wide implies institutional licenses; is the
  institutional flow on `/for-institutions/inquiry` enough, or does Lite
  need its own self-serve bank-onboarding flow?
- Cohort vs. self-paced for Foundation Full — the Plans say
  self-paced (per AiBI-S format memory note); v2 doc recommends "cohort
  kickoff with self-pace" as the deployment shape. These are compatible
  but the marketing copy needs to choose a default.
- Manager Track prerequisite verification — automated check (DB read of
  enrollments) or honor-system gate?

---

## What changes for v1 buyers

Anyone who already paid $295 for AiBI-Practitioner keeps that
entitlement. Their `course_enrollments` row stays `product='aibi-p'`;
they continue to access `/courses/aibi-p/*`. Old route, old content,
old certificate. v2 is additive — no forced migration of existing
buyers. Once v1 is no longer sold (Stripe product deactivated), the
v1 course routes can be archived but enrollment access stays intact.
