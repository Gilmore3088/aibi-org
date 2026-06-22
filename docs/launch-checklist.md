# Launch checklist — production readiness

Last updated: 2026-06-22.

## Status snapshot — 2026-06-22

Where the launch actually stands after this session. The detailed gate is §0–§12 below.

### ✅ Done
- **Supabase #1 blocker cleared.** Migrations `00044–00048` applied to production via MCP;
  `/api/health/supabase` → `ok:true` (was `ok:false` / results pages degraded).
- **Launch docs hardened + consolidated.** Stripe doc, this checklist, and the GTM plan
  corrected (phantom staging, dead `NEXT_PUBLIC_STRIPE_KEY`, HubSpot, brand naming, webhook
  events, refund/comp, tax trigger, Appendix A; one canonical go/no-go list).
- **Copy drift fixed (shipped).** `12 → 18` modules across `/faq`, `/for-institutions`,
  post-assessment `NextStepCards`, `/design-system`; banned "AiBI Foundations" plural in the
  playbook modal + a MailerLite subject. `lint` + `331 tests` + `build` green locally.
- **GTM revenue model** internal math contradiction fixed + reality-check added.
- **Reviews produced:** 10-persona E2E + adversarial red-team (`docs/reviews/`).
- **Repo hygiene:** 776M of stale worktree dirs removed; branches clean (`main` only).
- **MailerLite inspected via MCP**; one banned-plural subject fixed.

### ❌ Not done (cannot be done from here / by the agent)
- **Enable MailerLite nurture** — dashboard-only (API has no activate); **and content is
  unbuilt** (3 of 4 automations have empty emails) — see §11.
- **Verify/create LIVE Stripe products** — the MCP/CLI is paired to the **sandbox** account.
- **Rotate the exposed `sk_live_…` key** — Stripe dashboard (owner). `npm run audit:secrets`
  currently fails because ignored local `.env.local` still contains live-looking secrets.
- **Vercel env vars** — owner-managed; not touched.
- **Live E2E purchase/refund smoke tests** — require real cards on the live domain.

### 🔜 Needs doing before paid promotion (owner)
1. **Rotate `STRIPE_SECRET_KEY`** (exposed in a transcript this session), remove any old live key
   from local `.env.local`, then rerun `npm run audit:secrets`.
2. **Build + design the 4 MailerLite nurture flows**, then enable (dashboard).
3. **Secure one named top-of-funnel channel** — the revenue model's binding constraint.
4. **Configure ops alerts** (`OPS_ALERT_WEBHOOK_URL` or `OPS_ALERT_EMAIL`) and verify one
   test alert reaches the operator using `POST /api/ops/alert-test`. `npm run audit:env:production`
   now fails until at least one alert destination is configured.
5. **Verify live Stripe products**; run the §6 live smoke tests (free / In-Depth / Foundation / refund).
6. **Add named people when approved** (populate `AdvisorsStrip` / founder bio). A factual trust anchor exists, but named people still require owner-provided attribution.

> Full detail + evidence: §0–§12 below, `docs/reviews/persona-e2e-review-2026-06-22.md`,
> and `docs/reviews/red-team-review-2026-06-22.md`.

---

Green code is necessary but not sufficient. `main` builds, type-checks, passes
326 unit tests, and deploys to Vercel — but production readiness depends on
operational state that lives in Vercel / Supabase / Stripe / Resend and cannot
be verified from the repo. Work this list top to bottom; **the database
migrations are the #1 launch blocker** (an unapplied migration took down every
assessment result on 2026-06-18 — see §1).

Verify config fast with the health endpoints (no secrets exposed):

- `GET /api/health/supabase` — env presence + DB connectivity + recent-migration columns
- `GET /api/health/stripe` — `{ mode: "live" | "test", configured }`
- `GET /api/health/email` — Resend key presence + `skipResend` + from-address
- `POST /api/ops/alert-test` — sends a synthetic alert; requires `Authorization: Bearer $CRON_SECRET`

---

## 0. SPOF preflight — verify these THREE first

Three single points of failure each take the **entire funnel** down. Verify them
before anything else, and learn their failure signatures so you recognize them live:

- [ ] **Migrations applied through `00048`** — `/api/health/supabase` → `ok: true`.
      *Failure signature:* every `/results/{id}` and `/assessment/in-depth/results/{id}`
      404s ("I take any assessment and it says it's not available"). This took the site
      down on 2026-06-18. (Full detail in §1.)
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` present** in Production.
      *Failure signature:* every results page 404s and every save fails. (See §2.)
- [ ] **`STRIPE_WEBHOOK_SECRET` matches the live-account live-mode endpoint** — verify by
      triggering one real delivery and seeing a **2xx in the Stripe dashboard**, not by
      eyeballing the value. *Failure signature:* buyer is charged, webhook 400s, access is
      never provisioned — silent on every purchase. (See §4.)

---

## 1. Database migrations (CRITICAL — do this first)

All migrations in `supabase/migrations/` must be applied to the **production**
Supabase database, in order, through the highest number present
(currently `00048`).

- [x] Apply every migration through `00048_paid_toolbox_access_helper.sql`.
      **✅ 2026-06-22: `00044`–`00048` applied to production via Supabase MCP**
      (`00044` action_packet_notes was the unapplied blocker; `00045`–`00048`
      reconciled). All additive/idempotent — `ADD COLUMN/TABLE/INDEX IF NOT EXISTS`,
      `CREATE OR REPLACE FUNCTION`, constraint widened 1→18. No destructive DDL.
- [x] Confirm with `GET /api/health/supabase` → `db.columns` shows
      `institution_context: true`, `action_packet_notes: true`,
      `previous_id: true`, and `ok: true`. **✅ 2026-06-22: returns `ok:true`,
      all three columns true, `error:null`.**
- [ ] Run `npm run check:course-schema:strict` against production-equivalent
      Supabase credentials before paid promotion.

> **Why this is first.** `loadAssessmentResponse` (free *and* paid results
> pages) reads `institution_context` (00045) and `action_packet_notes` (00044).
> Before the 2026-06-18 hardening, a missing column made the SELECT error and
> **every** `/results/{id}` and `/assessment/in-depth/results/{id}` 404 — the
> "I take any assessment and it says it's not available" symptom. The code is
> now fail-open (it retries without the optional columns), but the columns must
> still exist for institution context / action-packet notes to actually work.

## 2. Environment variables (Vercel → Production)

Core (assessments, auth, results):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — **without this, every results page 404s and every save fails**
- [ ] `NEXT_PUBLIC_SITE_URL` — used to build magic links / absolute URLs

Payments (Stripe):
- [ ] `STRIPE_SECRET_KEY` — must be `sk_live_…` for real charges (verify via `/api/health/stripe` → `mode: "live"`)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_FOUNDATION_PRICE_ID`
- [ ] `STRIPE_INDEPTH_PRICE_ID`
- [ ] `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` — **deferred (Appendix A); not a launch var.** Only if the Foundation institution bundle / persistent institution discounting is intentionally enabled.
- [ ] `STRIPE_TEAM_ASSESSMENT_PRICE_ID` — **deferred (Appendix A); not a launch var.** Only if Team Assessment checkout is intentionally enabled.

Email (Resend) + nurture (MailerLite):
- [ ] `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_FROM_NAME` (verify via `/api/health/email`)
- [ ] `OPS_ALERT_WEBHOOK_URL` or `OPS_ALERT_EMAIL` (verify a webhook failure / test alert reaches the support owner)
- [ ] `MAILERLITE_API_KEY` + `MAILERLITE_GROUP_ID_ASSESSMENT` / `MAILERLITE_GROUP_ID_PLAYBOOK` (only if nurture is going live)

AI providers (sandbox / toolbox / report generation):
- [ ] `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` (whichever features are enabled)

## 3. SKIP_* flags must be OFF in production

Each of these silently no-ops a subsystem when `=== 'true'`. Confirm they are
unset or `false` in prod:
- [ ] `SKIP_SUPABASE_PROFILES` (off → results persist)
- [ ] `SKIP_RESEND` (off → emails send; check via `/api/health/email`)
- [ ] `SKIP_MAILERLITE`
- [ ] `SKIP_PDF_GENERATION`
- [ ] `SKIP_ENROLLMENT_GATE` (off → paid content is actually gated)
- [ ] `SKIP_CRON_AUTH`

Run `npm run audit:env:production` against production-equivalent env before paid promotion.
It fails on missing required runtime vars, missing ops alert destination, and dangerous
production skip flags.

Run `npm run audit:secrets` before promotion and before opening a PR. It scans source,
docs, artifacts, and ignored local env files for live-looking Stripe/Supabase/Resend
secrets. If it flags `.env.local`, rotate the exposed secret first, then replace local
live values with non-live test/dev values or remove them.

## 4. Stripe webhook

- [ ] In the Stripe dashboard (**live account, live mode**), a webhook endpoint points at
      `https://<prod-domain>/api/webhooks/stripe`.
- [ ] Its signing secret matches `STRIPE_WEBHOOK_SECRET` — confirmed by a real 2xx
      delivery, not by eyeballing the value.
- [ ] **All four events the handler consumes are subscribed** (must match
      `docs/stripe-products.md` → Webhook setup; the handler in
      `src/app/api/webhooks/stripe/route.ts` is the source of truth):
  - [ ] `checkout.session.completed` — writes `course_enrollments` (provisioning).
  - [ ] `charge.refunded` — **revokes access.** Skip this and refunds silently fail to
        revoke; the §6 refund test will fail with no obvious cause.
  - [ ] `payment_intent.payment_failed` — failed-purchase analytics.
  - [ ] `payment_intent.succeeded` — acknowledged (fulfillment is on checkout completion).
- [ ] After the §6 smoke tests, the Stripe dashboard shows recent **2xx** deliveries for
      the events that fired.

## 5. Resend templates / sender

- [ ] Sending domain verified in Resend; `RESEND_FROM` uses it.
- [ ] Assessment results email renders (`assessment-results-breakdown`) — used
      by the free flow **and** the paid In-Depth completion email.
- [ ] In-Depth purchase email renders (`in-depth-assessment-purchase`).

## 6. End-to-end smoke tests on the live domain

- [ ] **Free assessment**: take it → submit email → land on `/results/{id}` (no 404) → receive the results email.
- [ ] **Paid In-Depth**: buy with a live card → purchase email arrives within ~5 min with a **working magic link** → link lands in an authenticated `/assessment/in-depth/take` (not a "purchase required" bounce) → complete → land on the briefing → results/briefing email arrives. Stripe shows 2xx for this session's webhook delivery.
- [ ] **Course purchase**: buy → welcome email arrives → reach `/courses/foundation/program` → save at least one artifact to the Toolbox.
- [ ] **Refund — full**: issue a full refund for a test Foundation purchase → within ~60s the `course_enrollments` row is gone and `entitlements.active=false` → the buyer's `/courses/foundation/program` shows the gated/purchase-required state.
- [ ] **Refund — partial**: issue a partial refund → access is **retained** (the handler discriminates full vs partial).
- [ ] **Refund — comp ($0)**: a comped enrollment has no charge, so `charge.refunded` cannot revoke it — revoke by **deleting its `course_enrollments` row** in Supabase and confirm the entitlement flips off.
- [ ] **Refund eligibility is manual**: the 7-day policy conditions (assessment unsubmitted / <2 modules / no certificate) are **not** enforced by the webhook — they are verified by a human before issuing the refund. Confirm the support owner knows this.
- [ ] **Refund notification is manual**: the webhook sends no refund email. Confirm the support owner sends a refund confirmation (or accept the gap explicitly).
- [ ] **Idempotency / replay**: in Stripe **test mode**, resend a `checkout.session.completed` for an already-provisioned session → handler returns 200 with **no duplicate** `course_enrollments` row.
- [ ] **Team Assessment, if enabled**: buy 10+ seats → receive admin link → participant link works → 10 completions unlock aggregate report → print route renders. *(Deferred per GTM plan — assisted-sales only until 2 cohorts pass.)*

## 7. Post-deploy sanity

- [ ] `/api/health/supabase` → `ok: true`
- [ ] `/api/health/stripe` → `mode: "live"`
- [ ] `/api/health/email` → `resendKeyPresent: true`, `skipResend: false`
- [ ] `POST /api/ops/alert-test` with `Authorization: Bearer $CRON_SECRET` returns
      `ok:true`, and the configured inbox/channel receives the synthetic alert.
- [ ] **Mobile (real iPhone, Safari):** `/`, `/assessment`, `/assessment/in-depth`,
      `/courses`, the Foundation purchase page, and one `/results/{id}` render without
      layout breakage and the primary CTA is tappable. Full free assessment completes in
      under 3 minutes.

## 8. Copy audit (the buying-path surfaces — do before any paid promotion)

Buyers lose trust when pages, emails, receipts, and PDFs disagree. Scope this to the
buying path, not the whole site.

- [ ] Free assessment is **12 questions**; In-Depth is **48 questions**; Foundation is
      **18 bite-sized modules** — verified on the live pages, the two Stripe `product.description`s,
      and the transactional emails.
- [ ] No public copy says Foundation has **9** or **12** modules (stale counts). *(Known
      stale internal comment: `ModuleMapItem.tsx` — not user-facing, fix opportunistically.)*
- [ ] No copy describes the individual In-Depth as "board-ready" or "institution-wide".
- [ ] Team Assessment copy does not imply fully self-serve institutional rollout.
- [ ] No banned phrases (`FFIEC-aware`, `regulator-approved`, `AiBI Foundations` plural,
      etc. — see CLAUDE.local brand rules). The string "FFIEC-aware" appears nowhere.
- [ ] Every public statistic has a named source + year.

## 9. Operational readiness (before serious promotion)

- [ ] Remote branch list is only `origin/main`; production deploys green from `main`.
- [ ] No public CTA links to a mockup-only route (`/playground`, `public/sketches/*`); a
      human clicked every primary CTA on `/`, `/assessment`, `/courses`, `/services` and
      each lands on a real product surface.
- [ ] **Support**: a named owner, an inbox, a stated first-response SLA (in business
      hours), and macros/runbook live in `docs/support-runbook.md`. Owner still needs
      to assign who verifies eligibility and who clicks refund in Stripe.
- [ ] **Weekly scorecard** exists (a 15-row Friday spreadsheet is fine — start manual; do
      not block launch on automated dashboards) covering the GTM plan's operating metrics.
- [ ] Dependency/security alerts are empty (`npm audit` clean, Dependabot empty).
- [ ] **Team Assessment self-serve stays off.** `/assessment/team` renders assisted rollout
      by default and `/api/checkout/team-assessment` returns 403 unless
      `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT=true`. Do not set the flag until 2
      cohorts pass E2E QA and the owner accepts self-serve risk.
- [ ] **Persona-review P1 items verified on live pages** (refund reversal adjacent to
      $99/$295 CTAs; `/services` single primary CTA via `/for-institutions`; ROI
      methodology one click away; credibility trust anchor present). Named founder/advisor
      content remains owner-provided.

## 10. Tax trigger (don't forget this one)

- [ ] Stripe Tax is intentionally **off** at launch (bank/CU buyers largely exempt). Set a
      reminder: at **50 cumulative paid transactions** (the GTM 90-day model crosses this
      inside the window) or the first multi-state pattern, re-evaluate enabling Stripe Tax.

## 11. Go-live actions a human must flip (NOT auto-applied)

These are outward-facing / live-money and were intentionally **not** automated:

- [ ] **Build + enable MailerLite nurture (NOT just "enable").** Inspected via MCP 2026-06-22:
      the 4 tier automations ("Starting Point / Early Stage / Building Momentum / Ready to
      Scale", trigger = subscriber_joins_group, groups wired correctly) exist but are
      **empty skeletons** — `complete_workflow: false` on all four:
        - Starting Point: 3 email steps, only 2 have content and both are `is_designed:false`
          (would send the generic "can't display HTML" fallback); one subject had the banned
          "AiBI Foundations" plural (fixed via MCP 2026-06-22).
        - Early Stage / Building Momentum / Ready to Scale: every email step is empty
          (`subject: null`, no body).
      **The email content must be written + designed in the MailerLite visual editor**
      (the API/MCP cannot author email HTML or enable an automation — both are dashboard-only).
      Do NOT enable until each email is designed and a test send is verified. Subjects +
      plain-text can be drafted via MCP `update_automation_email` as a starting point.
- [ ] **Verify live Stripe products.** The Stripe MCP/CLI is paired to the **sandbox**
      account; live products can only be created/verified on the **live** account. The app
      already runs live keys and live `price_*` IDs are configured, so live products likely
      exist — confirm in the live dashboard that In-Depth ($99) and Foundation ($295)
      products + prices match `docs/stripe-products.md` Block 1.
- [ ] **`STRIPE_TEAM_ASSESSMENT_PRICE_ID` can no longer re-arm checkout by itself** — if
      Team Assessment is ever enabled, set both the price id and
      `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT=true` intentionally.
- [ ] **Rotate `STRIPE_SECRET_KEY`** if it has been exposed in any log/transcript. After
      rotation, `npm run audit:secrets` must pass with no live-looking secrets.

## 12. Database hardening (post-launch, from Supabase advisors 2026-06-22)

Non-blocking; all pre-existing or by-design. Track for post-launch:
- New `team_assessment_*` tables have RLS enabled with **no policies** — intentional
  (service-role-only access), matches existing tables (certificates, refunded_checkout_sessions).
- Pre-existing: two `addie` SECURITY DEFINER views (ERROR-level lint), several
  SECURITY DEFINER functions executable by anon/authenticated (incl. `has_toolbox_access`
  as defined by migration 00048), `set_updated_at` mutable search_path, `citext` in public,
  and **leaked-password protection disabled** in Auth. Review before scaling, but none
  block the individual-funnel launch. Do not alter auth/entitlement functions casually —
  changing them can break RLS/login.
