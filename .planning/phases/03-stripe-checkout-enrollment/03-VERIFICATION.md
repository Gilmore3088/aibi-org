---
phase: "03-stripe-checkout-enrollment"
verified: 2026-04-18
status: blocked_external
auditor: claude
note: "All code shipped and TypeScript-clean; payment pipeline cannot actually run until Stripe account + env vars + webhook endpoint are configured in production."
---

# Phase 3: Stripe Checkout + Enrollment — Verification Report (Retroactive)

**Phase Goal:** A learner can pay $79 for individual access or purchase institution seats, and the Stripe webhook provisions their enrollment in Supabase granting course access.
**Verified:** 2026-04-18 (retroactive audit; code shipped 2026-04-15)
**Status:** blocked_external — code is complete and compiles, but the revenue pipeline cannot be exercised end-to-end until Stripe account setup + five environment variables are configured in Vercel.

## Scope

From `03-CONTEXT.md`: wire Stripe Checkout for AiBI-P course purchase ($79 individual, ~$63/seat institution at 5+), create the webhook handler that provisions enrollment in Supabase on `payment.success`, and implement institution bundle pricing with persistent discount. The purchase page already existed from Phase 2 — this phase made the Enroll button functional and closed the enrollment loop.

## Success Criteria — Pass/Fail

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | A learner who pays $79 via Stripe Checkout is provisioned with an enrollment row in `course_enrollments` and can immediately access the course | CODE PASS · BLOCKED EXTERNAL | `src/app/api/create-checkout/route.ts:147-159` creates Checkout Session; `src/lib/stripe/provision-enrollment.ts:103-112` INSERTs into `course_enrollments` on `checkout.session.completed`. Route returns 503 until env vars set; live flow unverifiable without Stripe account. |
| 2 | An institution buyer can purchase 5+ seats at the ~$63/seat price; the institution's discount persists for all future AiBI-P purchases | CODE PASS · BLOCKED EXTERNAL | Validation `route.ts:91-105` rejects quantity < 5; session creation at `route.ts:172-186` uses `STRIPE_AIBIP_INSTITUTION_PRICE_ID`; webhook writes `discount_locked=true` at `provision-enrollment.ts:151-157`. Institution mode is not surfaced in the purchase page UI (intentional per plan — "contact us" copy remains). |
| 3 | A learner who enrolls after their institution already has a discount pays $63 automatically | CODE PASS · BLOCKED EXTERNAL | `hasLockedInstitutionDiscount` at `route.ts:44-69` joins `course_enrollments` → `institution_enrollments` on buyer email; on `discount_locked=true` the institution price ID is substituted (`route.ts:139-145`) and `metadata.discount_applied = 'institution_persistent'` travels to the webhook, which resolves the `institution_enrollment_id` foreign key at `provision-enrollment.ts:87-101`. |
| 4 | A non-enrolled visitor who tries to access any module URL is redirected to the purchase page, not a 404 | PASS | Already satisfied in Phase 2 (SHELL-12): `src/app/courses/aibi-p/[module]/page.tsx:53` — `if (!enrollment) { redirect('/courses/aibi-p/purchase') }`. Verified in 02-VERIFICATION.md Truth #3. |

**Score (code facts):** 4/4 code paths implemented.
**Score (live verification):** 0/3 payment-flow criteria testable in production — blocked on Stripe account setup.

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/lib/stripe.ts` | VERIFIED | 38 lines; Stripe client singleton (SDK v22, apiVersion `2026-03-25.dahlia`); `CheckoutMetadata` interface exported |
| `src/app/api/create-checkout/route.ts` | VERIFIED | 193 lines; mode validation, env var guards, persistent-discount lookup, 503/400/500 error taxonomy, safe error messages |
| `src/app/courses/aibi-p/purchase/EnrollButton.tsx` | VERIFIED | 94 lines; 'use client' directive; unauthenticated fallback; loading/error states; role="alert" error message |
| `src/app/courses/aibi-p/purchase/page.tsx` | VERIFIED | 147 lines; async Server Component; redirects already-enrolled; reads auth user email via `@supabase/ssr` cookies |
| `src/app/api/webhooks/stripe/route.ts` | VERIFIED | 70 lines; `runtime='nodejs'`, `dynamic='force-dynamic'`; raw-body signature verification; delegates to `provisionEnrollment`; 400/500 error taxonomy |
| `src/lib/stripe/provision-enrollment.ts` | VERIFIED | 169 lines; `provisionEnrollment` function extracted; idempotency checks on `stripe_session_id`; nullable `user_id` via `auth.admin.listUsers` lookup |
| `src/app/api/webhooks/stripe/route.test.ts` | VERIFIED (stubs) | Integration test stubs — requires live Supabase for real execution per 03-02-SUMMARY.md |

## Key Link Verification

| From | To | Status | Details |
|------|----|--------|---------|
| `EnrollButton.tsx` | `/api/create-checkout` | WIRED | `fetch('/api/create-checkout', { method: 'POST', body: JSON.stringify({ mode: 'individual', user_email: userEmail }) })` at `EnrollButton.tsx:44-48` |
| `create-checkout/route.ts` | `stripe.checkout.sessions.create` | WIRED | Two call sites: `route.ts:147` (individual) and `route.ts:172` (institution) |
| `create-checkout/route.ts` | `institution_enrollments` | WIRED | `hasLockedInstitutionDiscount` joins `course_enrollments.institution_enrollments!inner(discount_locked)` at `route.ts:50-55` |
| `webhooks/stripe/route.ts` | `stripe.webhooks.constructEvent` | WIRED | `route.ts:43` — signature verification before any processing |
| `provision-enrollment.ts` | `course_enrollments` | WIRED | `supabase.from('course_enrollments').insert(...)` at `provision-enrollment.ts:103` |
| `provision-enrollment.ts` | `institution_enrollments` | WIRED | `supabase.from('institution_enrollments').insert({ ..., discount_locked: true })` at `provision-enrollment.ts:151` |

## Gaps

None in code. All four success criteria are implemented; error handling, idempotency, and signature verification match the plans' threat models.

Minor notes (not gaps, but worth flagging):

- **Integration tests are stubs.** `src/app/api/webhooks/stripe/route.test.ts` is a set of structural type checks with commented-out live-execution steps. Acceptable per 03-02-SUMMARY.md — full execution requires live Supabase. Re-run once the project has a test DB wired.
- **Institution admin invite flow is deferred.** The webhook creates an `institution_enrollments` row with `seats_purchased` and `seats_used=0`, but per-learner seat activation is not built. Deferred explicitly in `03-CONTEXT.md`. No per-learner `course_enrollments` rows are created for institution purchases yet — an admin dashboard is needed to send invitations.
- **Kajabi provisioning** is noted as Phase 2 (post-launch) in CLAUDE.md; out of scope for this phase.

## External Blockers

The following must be completed before the Phase 3 pipeline can be exercised in production. None are code gaps — all are external account/configuration work:

| Item | Owner | Status |
|------|-------|--------|
| Create Stripe account (live mode) | User | NOT DONE |
| Create `AiBI-P` product at $79 one-time | User | NOT DONE |
| Create `AiBI-P Institution` product at $63.20 (5-seat minimum) | User | NOT DONE |
| Register webhook endpoint `https://aibankinginstitute.com/api/webhooks/stripe` for `checkout.session.completed` | User | NOT DONE |
| Set `STRIPE_SECRET_KEY` in Vercel production | User | NOT SET |
| Set `NEXT_PUBLIC_STRIPE_KEY` in Vercel production | User | NOT SET |
| Set `STRIPE_AIBIP_PRICE_ID` in Vercel production | User | NOT SET |
| Set `STRIPE_AIBIP_INSTITUTION_PRICE_ID` in Vercel production | User | NOT SET |
| Set `STRIPE_WEBHOOK_SECRET` in Vercel production | User | NOT SET |

Until all five env vars are set, `/api/create-checkout` returns `503 "Payment system not configured."` by design, and `/api/webhooks/stripe` returns `503 "Webhook not configured."` Both are safe failure modes — no silent errors.

The v1.0 milestone audit (`.planning/v1.0-MILESTONE-AUDIT.md`) already classifies this as a "revenue pipeline blocked" item; this verification does not alter that assessment.

## Anti-Patterns Found

None. Error handling is explicit, secrets are never logged, Stripe error messages never leak to the client, webhook signature verification is mandatory, and idempotency is enforced via `stripe_session_id` uniqueness checks before every INSERT.

## Recommendation

**external-unblock.** No code changes required. The phase is ready to ship the moment the Stripe account is provisioned and the five environment variables are set in Vercel. A human must then perform the following in-browser smoke tests:

1. Navigate to `/courses/aibi-p/purchase` signed in; click "Enroll Now — $79"; complete Stripe Checkout with a test card; confirm redirect to `/courses/aibi-p?enrolled=true`.
2. Verify a `course_enrollments` row appears in Supabase with the correct `user_id`, `email`, `product='aibi-p'`, and `stripe_session_id`.
3. Replay the same webhook event via the Stripe CLI; confirm no duplicate row is created (idempotency).
4. Manually POST an institution-mode Checkout Session via a temporary admin tool; confirm `institution_enrollments` row has `discount_locked=true`.
5. Complete an individual purchase using an email that matches the institution row; confirm the price presented at Stripe Checkout is $63 (not $79).

Until those human-verification steps are performed against a live Stripe account, this phase is code-complete but unverified in production.

---
*Verified (retroactive): 2026-04-18*
*Verifier: Claude (gsd-verifier)*
