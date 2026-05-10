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

## Phase 1 — Authoring (no code changes yet)

Author the actual TypeScript module content for the 8 net-new modules and
revise pillar order on the existing 12. Today the bundle has spec
descriptions in `Plans/foundation-v2/aibi-foundation-v2/modules/`; those
need to become typed module objects matching `content/courses/aibi-p/types.ts`.

- [ ] Decide whether to create `content/courses/aibi-foundation/v2/` (new
  folder, hard cut) or evolve `content/courses/aibi-p/` in place. Recommend
  hard cut — keeps v1 in repo for rollback and parallel review.
- [ ] Author module content for the 8 net-new Full-track modules (M3, M5,
  M6, M12, M15, M18, M19, plus the renumbered M20). Each requires sections,
  activities, key outputs, daily-use outcomes per the spec in
  `Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/`.
- [ ] Revise pillar tags + ordering on the existing 12 modules to match the
  strictly-linear v2 order (Awareness 1–4 · Understanding 5–10 · Creation
  11–15 · Application 16–20). The current course has Module 9 (Safe AI Use)
  in Understanding after the Creation block — v2 fixes this.
- [ ] Author Foundation Lite track (4 modules: L1–L4). Lite is a strict
  subset of Full — coordinate so Lite graduates can upgrade by completing
  the missing modules without re-doing Lite content.
- [ ] Author Manager Track (3 modules: M1–M3) — coaching, library review,
  escalation.
- [ ] Author Board Briefing (2 modules: BB1–BB2) — director vocabulary,
  governance questions.
- [ ] Author 33 artifact templates per `Plans/foundation-v2/.../artifacts/`.

## Phase 2 — Rename in user-facing copy

Per 2026-05-06 rename pattern: change copy, keep internal identifiers.

- [ ] Search for "AiBI-Practitioner" in `src/`, `content/`, `public/` —
  replace with "AiBI-Foundation" or "AiBI-Foundation Full" depending on
  context (Foundation Full is the current Practitioner equivalent).
- [ ] Update certificate PDF designation (`src/lib/certificates/`) and
  filename pattern.
- [ ] Update transformation report copy.
- [ ] Update skill template library + onboarding copy.
- [ ] Update transactional email template copy in Resend dashboard
  (assessment-results-breakdown, course-purchase-individual,
  course-purchase-institution, certificate-issued, inquiry-ack) and the
  wrapper helpers in `src/lib/resend/index.ts`.
- [ ] DO NOT change route `/courses/aibi-p`, DB `product='aibi-p'`, file
  path `public/AiBI-P/`, env var names, Stripe metadata keys, Resend
  template aliases — kept short to avoid churn (per 2026-05-06).

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

## Phase 4 — Course shells + routing

- [ ] Build new track shells: `/courses/foundation-lite`,
  `/courses/foundation` (Full), `/courses/foundation-manager`,
  `/courses/foundation-board`. The existing `/courses/aibi-p` shell can be
  reskinned for Foundation Full or kept as a redirect to
  `/courses/foundation`.
- [ ] Module-level routes: `/courses/foundation/[module]` already exists
  pattern in `src/app/courses/aibi-p/[module]/`.
- [ ] Add prerequisite check for Manager Track (requires Foundation Full
  completion or Lite + 6 mo supervisory experience).
- [ ] DB: add `product` enum values for the four new SKUs in
  `course_enrollments` — keep `aibi-p` as legacy. Migration goes through
  `mcp__supabase__apply_migration`.

## Phase 5 — Platform build (the big one)

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

## Phase 6 — Quarterly refresh mechanics

The v2 doc bakes a 90-day refresh cycle into the curriculum. Build the
authoring side now so we don't paint ourselves into a corner.

- [ ] Rotation slots for planted-error content (M2, M11, M12, M15, M18,
  M20) — author bible with current + on-deck variations.
- [ ] Sort-bank rotation for M4 (20 items × 4 quarterly sets).
- [ ] Examiner Q&A rotation for M19 (5 scenarios, rotate 2 per quarter).
- [ ] Vendor pitch rotation for M15 (3 decks, refresh annually).

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
