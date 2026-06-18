# Launch checklist — production readiness

Last updated: 2026-06-18.

Green code is necessary but not sufficient. `main` builds, type-checks, passes
247 unit tests, and deploys to Vercel — but production readiness depends on
operational state that lives in Vercel / Supabase / Stripe / Resend and cannot
be verified from the repo. Work this list top to bottom; **the database
migrations are the #1 launch blocker** (an unapplied migration took down every
assessment result on 2026-06-18 — see §1).

Verify config fast with the health endpoints (no secrets exposed):

- `GET /api/health/supabase` — env presence + DB connectivity + recent-migration columns
- `GET /api/health/stripe` — `{ mode: "live" | "test", configured }`
- `GET /api/health/email` — Resend key presence + `skipResend` + from-address

---

## 1. Database migrations (CRITICAL — do this first)

All migrations in `supabase/migrations/` must be applied to the **production**
Supabase database, in order, through the highest number present
(currently `00045`).

- [ ] Apply every migration through `00045_institution_context.sql`.
- [ ] Confirm with `GET /api/health/supabase` → `db.columns` shows
      `institution_context: true`, `action_packet_notes: true`,
      `previous_id: true`, and `ok: true`.

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
- [ ] `STRIPE_FOUNDATION_PRICE_ID`, `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID`
- [ ] `STRIPE_INDEPTH_PRICE_ID`, `STRIPE_INDEPTH_INSTITUTION_PRICE_ID`

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

- [ ] In the Stripe dashboard, a webhook endpoint points at
      `https://<prod-domain>/api/webhooks/stripe`.
- [ ] Its signing secret matches `STRIPE_WEBHOOK_SECRET`.
- [ ] `checkout.session.completed` is subscribed (this writes `course_enrollments`).

## 5. Resend templates / sender

- [ ] Sending domain verified in Resend; `RESEND_FROM` uses it.
- [ ] Assessment results email renders (`assessment-results-breakdown`) — used
      by the free flow **and** the paid In-Depth completion email.
- [ ] In-Depth purchase email renders (`in-depth-assessment-purchase`).

## 6. End-to-end smoke tests on the live domain

- [ ] **Free assessment**: take it → submit email → land on `/results/{id}` (no 404) → receive the results email.
- [ ] **Paid In-Depth**: buy with a real card → receive purchase email → sign in → take → complete → land on the briefing → receive the briefing email.
- [ ] **Course purchase**: buy → receive welcome email → reach the program.

## 7. Post-deploy sanity

- [ ] `/api/health/supabase` → `ok: true`
- [ ] `/api/health/stripe` → `mode: "live"`
- [ ] `/api/health/email` → `resendKeyPresent: true`, `skipResend: false`
- [ ] Spot-check the mobile enroll page and a couple of course pages on a phone.
