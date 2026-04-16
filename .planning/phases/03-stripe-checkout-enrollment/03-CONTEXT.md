# Phase 3: Stripe Checkout + Enrollment - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure/integration phase)

<domain>
## Phase Boundary

Wire Stripe Checkout for AiBI-P course purchase ($79 individual, ~$63/seat institution at 5+), create the webhook handler that provisions enrollment in Supabase on payment.success, and implement institution bundle pricing with persistent discount. The purchase page already exists from Phase 2 (02-03) — this phase makes the "Enroll" button functional.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — backend integration phase. Key constraints:

- Stripe Checkout Session pattern (not Elements) per CLAUDE.md
- Webhook signature verification is mandatory per CLAUDE.md (`stripe.webhooks.constructEvent`)
- Environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_KEY, plus new AiBI-P price IDs
- On payment.success: write enrollment to course_enrollments table with Supabase service role client
- Institution bundle: quantity param on Checkout Session with institution-tier SKU at 20% off
- Institution discount persists: once purchased at 5+ tier, all future purchases get discount (check institution_enrollments table)
- Individual who bought at $79 before institution tier: certificate identical, no downgrade
- Purchase page at /courses/aibi-p/purchase already exists — wire the Enroll button to create-checkout API route
- Non-enrolled redirect already works from Phase 2 (02-03 enrollment gating)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `/src/app/courses/aibi-p/purchase/page.tsx` — Purchase page (disabled button, needs wiring)
- `/src/app/courses/aibi-p/_lib/getEnrollment.ts` — Enrollment check utility
- `/src/lib/supabase/client.ts` — Supabase client with createServiceRoleClient
- `/src/types/course.ts` — CourseEnrollment, InstitutionEnrollment types
- `supabase/migrations/00001_course_tables.sql` — Tables already exist

### Established Patterns
- API routes in `/src/app/api/` (existing: capture-email, subscribe-newsletter, inquiry)
- Stripe patterns from CLAUDE.md: Checkout Sessions, webhook signature verification

### Integration Points
- New API route: `/api/create-checkout` (Stripe Checkout Session creation)
- New/updated API route: `/api/webhooks/stripe` (payment.success handler)
- Purchase page button wiring
- Environment variables for Stripe price IDs

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond PRD. Refer to ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

- Institution admin invite flow (how admins activate individual learner seats) — blocker noted in STATE.md, resolve design before shipping
- Kajabi provisioning automation — Phase 2 per CLAUDE.md

</deferred>
