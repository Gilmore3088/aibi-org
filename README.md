# The AI Banking Institute LMS

Next.js application for The AI Banking Institute. The platform leads with
a free diagnostic, deepens with a paid diagnostic, and converts into a paid
course with a credential at the end:

`Free Assessment → In-Depth Assessment → AiBI-Foundation Course → Certificate`

The same primitives — assessment, personalized path, short lesson, practice
rep, useful artifact, progress, certification — are the reference
implementation for any future course on the platform.

## The Three Public Offers

1. **Free AI Readiness Assessment** — `/assessment`
   Twelve questions, three minutes. Score, tier, and a tailored starter
   artifact. Email captured for the dimension breakdown.

2. **In-Depth Assessment** — `/assessment/in-depth` — $99, $79/seat at 10+
   Forty-eight questions across eight readiness dimensions. Consulting-grade
   report with peer-band comparison plus an anonymized rollup for institution
   leaders.

3. **AiBI-Foundation Course** — `/courses/foundation/program` — $295,
   $199/seat at 10+. **Lifetime access** to all twelve modules, practice
   reps, artifact templates, the prompt library, learner dashboard, and
   the AiBI-Foundation credential issued on reviewed work.

`AiBI-P` is a legacy internal identifier (route slug `aibi-p`, DB
`product='aibi-p'`, file path `public/AiBI-P/`, certificate ID prefix
`AIBIP-`). It must not appear in public copy — the course is AiBI-Foundation.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run test
npm run build
```

## Core Product Surfaces

- `/` — three-offer hero ladder and ROI calculator.
- `/assessment` — twelve-question free assessment with email-gated detail.
- `/assessment/in-depth` — paid forty-eight-question diagnostic.
- `/courses/foundation/program` — AiBI-Foundation course overview.
- `/courses/foundation/program/[module]` — Learn / Practice / Apply shell.
- `/courses/foundation/program/prompt-library` — searchable prompt library.
- `/dashboard` — learner command center.
- `/admin/reviewer` — work product review queue.

## Reusable Course Model

Shared LMS primitives live in `src/types/lms.ts`.

AiBI-Foundation course configuration lives in:

- `content/courses/foundation-program/course-config.ts`
- `content/courses/foundation-program/modules.ts`
- `content/practice-reps/foundation-program.ts`
- `content/courses/foundation-program/prompt-library.ts`

Future courses reuse the same shape: course config, modules, practice reps,
prompts, artifacts, progress, certificate requirements.

## Environment Variables

Create `.env.local` with the values needed for the features you are testing.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_FOUNDATION_PRICE_ID=             # $295 AiBI-Foundation individual
STRIPE_FOUNDATION_INSTITUTION_PRICE_ID= # $199/seat at 10+
STRIPE_INDEPTH_PRICE_ID=                # $99 In-Depth individual
STRIPE_INDEPTH_INSTITUTION_PRICE_ID=    # $79/seat at 10+

NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
REVIEWER_EMAILS=

# Local course access bypass only. Never use in production.
SKIP_ENROLLMENT_GATE=true
```

## Supabase

Run migrations in order from `supabase/migrations`.

Important tables:

- `user_profiles` — readiness and proficiency results keyed by email.
- `course_enrollments` — enrollment, onboarding, current module, completed.
- `activity_responses` — module activity submissions.
- `work_submissions` — final practical assessment packages.
- `certificates` — issued credentials.
- `quick_wins` — post-course impact entries.
- `practice_rep_completions` — reusable practice rep completion state.
- `saved_prompts` — learner prompt library saves.
- `user_artifacts` — optional artifact state across courses.

## Stripe

Stripe Checkout provisions both paid offers:

- `/api/checkout/in-depth/route.ts` — In-Depth Assessment
- `/api/create-checkout/route.ts` — AiBI-Foundation course
- `/api/webhooks/stripe/route.ts` — signed payment.success handler
- `/src/lib/stripe/provision-enrollment.ts` — enrollment writer

The Foundation checkout writes Stripe `metadata.product='foundation'` (new
canonical) and the webhook accepts both `'foundation'` and the legacy
`'aibi-p'` via `normalizeProduct()` so 2026-Q1 retry events still resolve.

**Operator dashboard checklist before launch:**

- Stripe product display names must read **AiBI-Foundation Course** and
  **In-Depth Assessment** — internal lookup keys stay legacy.
- Webhook secret is configured in production.
- Checkout success and cancel URLs route back into the app.
- Test purchase creates a `course_enrollments` row or a paid In-Depth row
  on `user_profiles` and triggers the matching Resend template.

## AI Safety Policy

Learners follow the SAFE rule:

- Strip sensitive data.
- Ask clearly.
- Fact-check outputs.
- Escalate risky decisions.

Do not paste customer PII, account numbers, credit decisions, SAR
information, or sensitive financial records into public AI tools or course
practice fields.

## Beta Launch QA

Minimum viable learning loop:

1. Understand the three offers from the homepage in under thirty seconds.
2. Take the free assessment.
3. See score, top gaps, and a tailored next step.
4. Enter email and access the dimension breakdown and starter artifact.
5. Optionally upgrade to the In-Depth Assessment for the consulting-grade
   report.
6. Enroll in AiBI-Foundation and confirm lifetime access copy is visible
   before checkout.
7. Complete Module 1.
8. Complete one practice rep.
9. Save or download one artifact.
10. Return later and continue.

Also verify privacy, terms, AI disclaimer, loading states, empty states,
mobile spacing, analytics events, and support/contact paths before
inviting beta users.
