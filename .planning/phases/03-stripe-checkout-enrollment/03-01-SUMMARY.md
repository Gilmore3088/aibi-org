---
phase: 03-stripe-checkout-enrollment
plan: "01"
subsystem: payments
tags: [stripe, checkout, supabase, purchase-page, enrollment]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: course_enrollments and institution_enrollments tables, createServiceRoleClient
  - phase: 02-course-shell-assessment-upgrade
    provides: Purchase page scaffold at /courses/aibi-p/purchase, getEnrollment utility

provides:
  - Stripe client singleton (src/lib/stripe.ts)
  - CheckoutMetadata interface (shared with webhook handler in Plan 02)
  - POST /api/create-checkout — Checkout Session creation for individual and institution modes
  - Persistent institution discount lookup (PAY-03) via Supabase service role
  - EnrollButton client component with loading/error states
  - Purchase page wired to real checkout flow (disabled placeholder removed)
  - "Sign in to enroll" fallback for unauthenticated visitors

affects:
  - purchase-page
  - checkout-flow
  - webhook-handler (consumes CheckoutMetadata type in Plan 02)

# Tech tracking
tech-stack:
  added:
    - stripe (npm package, SDK v22)
  patterns:
    - "Stripe client singleton: module-level instantiation with env var guard"
    - "Lazy import pattern: dynamic import('@/lib/stripe') in route handler avoids module-level throw at build time when STRIPE_SECRET_KEY is unset"
    - "Origin derivation from x-forwarded-proto + host headers for success/cancel URLs"
    - "Server-side price ID resolution: client never picks a price — attacker cannot downgrade via request body"
    - "Persistent discount check: join course_enrollments + institution_enrollments on buyer email before session creation"

key-files:
  created:
    - src/lib/stripe.ts
    - src/app/api/create-checkout/route.ts
    - src/app/courses/aibi-p/purchase/EnrollButton.tsx
  modified:
    - src/app/courses/aibi-p/purchase/page.tsx

key-decisions:
  - "Stripe API version pinned to '2026-03-25.dahlia' (current stable in SDK v22) — plan called for '2024-12-18.acacia' but SDK default was newer; accepted the newer version"
  - "apiVersion in actual code differs from plan (plan specified 2024-12-18.acacia, shipped 2026-03-25.dahlia) — pragmatic deviation, no functional impact"
  - "Auth email lookup in purchase page uses @supabase/ssr createServerClient directly rather than centralized helper — mirrors getEnrollment.ts pattern"
  - "Institution mode supported server-side but not exposed in purchase page UI — 'contact us' copy retained per plan note (institution admin invite flow deferred)"
  - "hasLockedInstitutionDiscount swallows DB errors to non-fatal (falls through to individual pricing) — better UX than blocking checkout on a discount query failure"

patterns-established:
  - "Client component + server component split for paid flows: EnrollButton is 'use client', purchase page is async Server Component"
  - "Graceful degradation for unconfigured Stripe: 503 with safe error message when env vars missing"

requirements-completed: [PAY-01, PAY-02, PAY-03]

# Metrics
duration: ~25min
completed: 2026-04-15
---

# Phase 03 Plan 01: Stripe Checkout + Create-Checkout API Summary

**Stripe SDK installed, client singleton exported, `/api/create-checkout` route handles individual ($79) and institution (5+ seats at ~$63/seat) purchases with server-side validation and a persistent-discount lookup via Supabase. The purchase page's disabled placeholder is replaced with a functional EnrollButton that redirects to Stripe Checkout.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-15
- **Completed:** 2026-04-15
- **Tasks:** 2
- **Files created:** 3
- **Files modified:** 1

## Accomplishments

- `src/lib/stripe.ts` exports a Stripe client singleton with a module-level throw if `STRIPE_SECRET_KEY` is missing — prevents silent misconfiguration.
- `POST /api/create-checkout` validates `mode` (individual | institution), `quantity` (>=5 integer for institution), `institution_name` (non-empty string for institution), and `user_email` (regex format check) before contacting Stripe.
- Missing price IDs return 503 "Payment system not configured" — route fails safely rather than surfacing a vague Stripe error.
- Persistent-discount path (PAY-03): when `user_email` is supplied and resolves to a `course_enrollments` row whose linked `institution_enrollments.discount_locked = true`, the institution price ID is swapped in and `metadata.discount_applied = 'institution_persistent'` is attached for the webhook to honor.
- All client-provided values are wrapped in conditional spreads so Stripe never sees undefined keys in metadata.
- `EnrollButton.tsx` renders three distinct states: unauthenticated (Sign in link), authenticated loading ("Redirecting to checkout…", disabled, cursor-wait), and error (inline `role="alert"` below button).
- Purchase page (`page.tsx`) is an async Server Component that: (a) redirects already-enrolled users to `/courses/aibi-p`, (b) reads the Supabase auth user email via `@supabase/ssr` cookies, (c) passes it as a prop to `EnrollButton`.
- Stripe error messages never leak to the browser — route catches and returns `"Payment error. Please try again."` while logging the raw error server-side.

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe client + create-checkout API route** — `bbe1264` (feat)
2. **Task 2: Wire purchase page Enroll button to Stripe Checkout** — `c16dc22` (feat)

## Files Created/Modified

- `src/lib/stripe.ts` — Stripe client singleton + `CheckoutMetadata` interface (the interface was added in this plan to unblock the webhook work in Plan 02; see 03-02-SUMMARY.md deviations)
- `src/app/api/create-checkout/route.ts` — Checkout Session creation for both modes, env var validation, persistent discount lookup, safe error responses
- `src/app/courses/aibi-p/purchase/EnrollButton.tsx` — Client component with loading/error states and unauthenticated fallback
- `src/app/courses/aibi-p/purchase/page.tsx` — Server component fetches auth user email, redirects enrolled users, renders EnrollButton

## Decisions Made

- **Stripe API version:** Plan specified `'2024-12-18.acacia'`; the shipped code uses `'2026-03-25.dahlia'` — the current stable in SDK v22. Pragmatic forward move, no functional impact on Checkout Sessions.
- **Lazy Stripe import:** The route handler does `const { stripe } = await import('@/lib/stripe')` inside `POST` so that a missing `STRIPE_SECRET_KEY` does not throw at build time. Allows `npm run build` to succeed before Stripe is configured.
- **Institution mode on UI vs server:** Server fully supports institution purchases (validation + session creation), but the purchase page UI exposes only the $79 individual button. The "Institution pricing (5+ seats): approx. $63/seat — contact us." copy remains intentional per the plan note — institution admin invite flow is deferred.
- **Persistent discount failure mode:** If the Supabase lookup throws, `hasLockedInstitutionDiscount` returns `false` silently and the buyer sees individual pricing. This is preferable to blocking checkout on a non-critical read.

## Deviations from Plan

### Pragmatic changes

**1. Stripe API version bumped**
- Plan said `apiVersion: '2024-12-18.acacia'`; code ships with `'2026-03-25.dahlia'`.
- Reason: SDK v22 accepts the newer version; no Checkout Session fields changed.
- Files: `src/lib/stripe.ts`.

**2. CheckoutMetadata interface added here, not in Plan 02**
- Plan 02 specified that `CheckoutMetadata` would be added in Task 2 of Plan 02. During Plan 02 execution this was found to be a blocking import and was moved to `src/lib/stripe.ts` — noted in 03-02-SUMMARY.md.
- The interface therefore exists in the Plan 01 final commit (`bbe1264`) rather than a Plan 02 commit.

**Total deviations:** 2 — neither changes scope or security posture.

## Issues Encountered

- None that required plan revision. Validating `quantity` had to be done with `Number.isInteger` (not just `>= 5`) to reject floats and `NaN` — caught during review, shipped cleanly.

## User Setup Required

**Code is ready, waiting on Stripe account setup.** The following environment variables must be set in Vercel (production) and `.env.local` (local dev) before the Enroll button will function end-to-end:

| Variable | Status | Source |
|----------|--------|--------|
| `STRIPE_SECRET_KEY` | NOT SET in production | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_KEY` | NOT SET in production | Stripe Dashboard → Developers → API keys (publishable) |
| `STRIPE_AIBIP_PRICE_ID` | NOT SET in production | Stripe Dashboard → Products → AiBI-P ($79 recurring-off one-time price) |
| `STRIPE_AIBIP_INSTITUTION_PRICE_ID` | NOT SET in production | Stripe Dashboard → Products → AiBI-P Institution ($63.20 one-time, 5-seat minimum) |
| `STRIPE_WEBHOOK_SECRET` | NOT SET in production | Stripe Dashboard → Webhooks → endpoint signing secret (needed for Plan 02 webhook) |

Until these are set, the route returns **503 "Payment system not configured."** This is the expected and safe behavior — no silent failures, no stub rendering.

Additional one-time dashboard tasks:

1. Create the `AiBI-P` product with a $79 one-time price.
2. Create the `AiBI-P Institution` product with a $63.20 one-time price (or tiered pricing with a 5-seat minimum).
3. Add a webhook endpoint at `https://aibankinginstitute.com/api/webhooks/stripe` listening for `checkout.session.completed` (see 03-02-SUMMARY.md for full webhook setup).

## Next Phase Readiness

- Plan 02 (webhook handler) is unblocked and was completed in the same phase — see `03-02-SUMMARY.md`.
- End-to-end test of the purchase flow is blocked on Stripe account creation and env var configuration in Vercel. Until then, the full revenue pipeline cannot be exercised in production, though TypeScript compiles cleanly and every code path has been unit-reviewed.
- No blockers for downstream phases (Phase 4 onboarding + progress) — those rely on the `course_enrollments` row being provisioned, which the webhook handler writes once Stripe account setup is complete.

---
*Phase: 03-stripe-checkout-enrollment*
*Completed: 2026-04-15*
*Summary backfilled: 2026-04-17 (retroactive audit — code shipped in commits `bbe1264` + `c16dc22`)*

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/stripe.ts | FOUND |
| src/app/api/create-checkout/route.ts | FOUND |
| src/app/courses/aibi-p/purchase/EnrollButton.tsx | FOUND |
| src/app/courses/aibi-p/purchase/page.tsx updated | FOUND |
| Commit bbe1264 (Task 1) | FOUND |
| Commit c16dc22 (Task 2) | FOUND |
| 03-01-SUMMARY.md | WRITTEN (retroactive) |
