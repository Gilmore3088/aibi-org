# The AI Banking Institute LMS

Next.js application for the AI Banking Institute learning platform. AiBI-P is
the first course and the reference implementation for a reusable LMS pattern:

`Assessment -> Personalized Path -> Short Lesson -> Practice Rep -> Useful Artifact -> Progress -> Certification`

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

- `/` - buyer-aware homepage and free assessment CTA.
- `/assessment` - 12-question AI readiness assessment with email-gated detail.
- `/dashboard` - learner command center with next action, practice, progress, prompts, and artifacts.
- `/courses/aibi-p` - AiBI-P course overview.
- `/courses/aibi-p/[module]` - Learn / Practice / Apply module shell.
- `/courses/aibi-p/prompt-library` - searchable and filterable prompt library.
- `/admin/reviewer` - work product review queue.

## Reusable Course Model

Shared LMS primitives live in `src/types/lms.ts`.

AiBI-P course configuration lives in:

- `content/courses/aibi-p/course-config.ts`
- `content/courses/aibi-p/modules.ts`
- `content/practice-reps/aibi-p.ts`
- `content/courses/aibi-p/prompt-library.ts`

Future courses should reuse the same shape: course config, modules, practice
reps/simulations, prompts, artifacts, progress, and certificate requirements.

## Environment Variables

Create `.env.local` with the values needed for the features you are testing.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_AIBI_P=

NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
REVIEWER_EMAILS=

# Local course access bypass only. Never use in production.
SKIP_ENROLLMENT_GATE=true
```

## Supabase

Run migrations in order from `supabase/migrations`.

Important tables:

- `user_profiles` - readiness and proficiency results keyed by email.
- `course_enrollments` - enrollment, onboarding, current module, completed modules.
- `activity_responses` - module activity submissions.
- `work_submissions` - final practical assessment packages.
- `certificates` - issued credentials.
- `quick_wins` - post-course impact entries.
- `practice_rep_completions` - reusable practice rep completion state.
- `saved_prompts` - learner prompt library saves.
- `user_artifacts` - optional artifact state across courses.

## Stripe

Stripe checkout provisions AiBI-P enrollment through
`src/app/api/webhooks/stripe/route.ts` and
`src/lib/stripe/provision-enrollment.ts`.

Before launch, confirm:

- Product metadata uses `product=aibi-p`.
- Webhook secret is configured in production.
- Checkout success and cancel URLs route back into the app.
- Test purchase creates a `course_enrollments` row.

## AI Safety Policy

Learners should follow the SAFE rule:

- Strip sensitive data.
- Ask clearly.
- Fact-check outputs.
- Escalate risky decisions.

Do not paste customer PII, account numbers, credit decisions, SAR information,
or sensitive financial records into public AI tools or course practice fields.

## Beta Launch QA

Minimum viable learning loop:

1. Understand the product from the homepage.
2. Take the assessment.
3. See score, top gaps, and a recommendation.
4. Enter email and access dashboard.
5. Start AiBI-P.
6. Complete Module 1.
7. Complete one practice exercise.
8. Save or download one artifact.
9. Return later and continue.

Also verify privacy, terms, AI disclaimer, loading states, empty states, mobile
spacing, analytics events, and support/contact paths before inviting beta users.
