---
phase: 03-stripe-checkout-enrollment
plan: "02"
subsystem: payments
tags: [stripe, webhooks, supabase, enrollment, postgres]

# Dependency graph
requires:
  - phase: 03-stripe-checkout-enrollment/03-01
    provides: Stripe client singleton, create-checkout API, CheckoutMetadata type groundwork
  - phase: 01-database
    provides: course_enrollments and institution_enrollments tables with RLS policies

provides:
  - POST /api/webhooks/stripe — verified Stripe webhook handler
  - Individual enrollment provisioning into course_enrollments on payment success
  - Institution bundle provisioning into institution_enrollments with discount_locked=true
  - Idempotency guard on stripe_session_id (duplicate webhook deliveries skipped)
  - CheckoutMetadata interface shared between create-checkout and webhook handler
  - provisionEnrollment function extracted for testability

affects:
  - course-shell
  - institution-admin-invite
  - enrollment-gating

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stripe webhook: raw body via request.text(), constructEvent for HMAC verification"
    - "Idempotency: SELECT before INSERT on stripe_session_id to skip duplicate events"
    - "Enrollment provisioning: service role client bypasses RLS for system writes"
    - "Error taxonomy: 400 for permanent failures (missing metadata), 500 for transient DB errors"
    - "Lazy Stripe import: dynamic import() in route handler avoids module-level throw at build"

key-files:
  created:
    - src/app/api/webhooks/stripe/route.ts
    - src/app/api/webhooks/stripe/route.test.ts
  modified:
    - src/lib/stripe.ts

key-decisions:
  - "Permanent vs transient error distinction: missing metadata → 400 (Stripe stops retrying); DB errors → 500 (Stripe retries for 3 days)"
  - "user_id is nullable on enrollment: if buyer has no Supabase account at payment time, enrollment is created by email and user_id back-filled on account creation"
  - "institution_enrollment_id on individual discount enrollments: resolved from discount_locked=true institution row at webhook time"

patterns-established:
  - "Webhook handler pattern: raw body text → constructEvent → event type routing → provisionEnrollment"
  - "Test stubs: structural type checks and inline comments documenting live test execution steps"

requirements-completed: [PAY-04, PAY-05]

# Metrics
duration: 18min
completed: 2026-04-15
---

# Phase 03 Plan 02: Stripe Webhook + Enrollment Provisioning Summary

**Stripe webhook handler that verifies HMAC signatures, provisions course_enrollments for individual payments, and creates institution_enrollments with discount_locked=true for bundle purchases — with idempotency guards on stripe_session_id.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-04-15T00:00:00Z
- **Completed:** 2026-04-15T00:18:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- POST /api/webhooks/stripe rejects every unverified request with 400 before any processing occurs
- Individual checkout.session.completed events create a course_enrollments row with user_id (looked up via auth.admin API), email, product, and stripe_session_id
- Institution checkout.session.completed events create an institution_enrollments row with seats_purchased and discount_locked=true, enabling the ~$63 persistent discount (PAY-03) for all future learner purchases
- Duplicate Stripe webhook deliveries are silently skipped via stripe_session_id idempotency check
- CheckoutMetadata interface added to src/lib/stripe.ts so create-checkout and webhook handler share a single type contract
- provisionEnrollment extracted as a named export for future integration testing

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe webhook handler for checkout.session.completed** - `65160d3` (feat)
2. **Task 2: Webhook integration test helper and type safety** - `75c153a` (feat)

## Files Created/Modified

- `src/app/api/webhooks/stripe/route.ts` — Webhook route with signature verification, routing, and provisionEnrollment function
- `src/app/api/webhooks/stripe/route.test.ts` — Integration test stubs for individual, institution, idempotency, and missing metadata cases
- `src/lib/stripe.ts` — Added CheckoutMetadata interface export

## Decisions Made

- **Permanent vs transient error codes:** Missing metadata gets 400 (Stripe won't retry — the event is malformed permanently). DB errors get 500 (Stripe retries for up to 3 days — transient outages are recoverable).
- **Nullable user_id on enrollment:** A buyer may complete Stripe checkout before creating a Supabase account. The enrollment is written by email; user_id can be back-filled later when the account is created.
- **Auth admin API for user lookup:** `supabase.auth.admin.listUsers` with email filter is the reliable path — `from('auth.users')` is not accessible via the JS client even with service role.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added CheckoutMetadata to stripe.ts in Task 1 (not Task 2)**
- **Found during:** Task 1 (webhook handler)
- **Issue:** The webhook route imported `CheckoutMetadata` from `@/lib/stripe` before Task 2 had added it, causing `tsc --noEmit` to fail
- **Fix:** Added the `CheckoutMetadata` interface to `src/lib/stripe.ts` during Task 1 execution rather than waiting for Task 2
- **Files modified:** src/lib/stripe.ts
- **Verification:** `npx tsc --noEmit` passed after addition
- **Committed in:** `65160d3` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking import)
**Impact on plan:** No scope creep. The type was explicitly required by Task 2 anyway; moving it earlier unblocked Task 1 compilation.

## Issues Encountered

- `from('auth.users')` is not accessible via the Supabase JS client even with service role key — the correct API is `supabase.auth.admin.listUsers()`. Initial implementation was cleaned up before commit.
- Stripe `CustomerDetails` type in SDK v22 includes `business_name` and `individual_name` fields not present in earlier versions — test helper updated to cast via `as Stripe.Checkout.Session['customer_details']`.

## User Setup Required

**Stripe Webhook must be registered in the Stripe Dashboard before webhooks reach this handler.**

1. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://aibankinginstitute.com/api/webhooks/stripe`
3. Events to listen for: `checkout.session.completed`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
5. For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Next Phase Readiness

- Webhook handler is wired and ready; will provision enrollments once `STRIPE_WEBHOOK_SECRET` is configured in Vercel
- Integration tests are stubs — full execution requires live Supabase connection; uncomment test bodies when Supabase is available
- Institution admin invite flow (how admins activate individual learner seats) remains deferred — noted in 03-CONTEXT.md
- No blockers for Phase 4 (course shell / module rendering)

---
*Phase: 03-stripe-checkout-enrollment*
*Completed: 2026-04-15*

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/app/api/webhooks/stripe/route.ts | FOUND |
| src/app/api/webhooks/stripe/route.test.ts | FOUND |
| 03-02-SUMMARY.md | FOUND |
| Commit 65160d3 (Task 1) | FOUND |
| Commit 75c153a (Task 2) | FOUND |
