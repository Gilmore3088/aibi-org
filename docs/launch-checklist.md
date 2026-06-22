# Launch checklist — production readiness

Last updated: 2026-06-22.

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

- [ ] Apply every migration through `00048_paid_toolbox_access_helper.sql`.
- [ ] Confirm with `GET /api/health/supabase` → `db.columns` shows
      `institution_context: true`, `action_packet_notes: true`,
      `previous_id: true`, and `ok: true`.
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
- [ ] `MAILERLITE_API_KEY` + the `MAILERLITE_GROUP_ID_*` group ids (only if nurture is going live)

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
      hours), and 5 macros (access / failed payment / missing email / refund / certificate).
      Refund runbook names who verifies eligibility and who clicks refund.
- [ ] **Weekly scorecard** exists (a 15-row Friday spreadsheet is fine — start manual; do
      not block launch on automated dashboards) covering the GTM plan's operating metrics.
- [ ] Dependency/security alerts are empty (`npm audit` clean, Dependabot empty).

## 10. Tax trigger (don't forget this one)

- [ ] Stripe Tax is intentionally **off** at launch (bank/CU buyers largely exempt). Set a
      reminder: at **50 cumulative paid transactions** (the GTM 90-day model crosses this
      inside the window) or the first multi-state pattern, re-evaluate enabling Stripe Tax.
