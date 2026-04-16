# Architecture Research

**Domain:** Self-paced LMS course integration into existing Next.js 14 App Router site
**Researched:** 2026-04-15
**Confidence:** HIGH — based on direct inspection of existing codebase + PRD

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Browser / iPhone Safari                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Course Shell  │  │  Activities  │  │  Reviewer Dashboard  │   │
│  │ /courses/     │  │  (forms,     │  │  /admin/reviewer     │   │
│  │  aibi-p/[m]  │  │   drills,    │  │  (protected route)   │   │
│  │              │  │   builder)   │  │                      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
└─────────┼─────────────────┼──────────────────────┼───────────────┘
          │                 │                      │
┌─────────▼─────────────────▼──────────────────────▼───────────────┐
│                 Next.js 14 App Router (Vercel)                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Server Components (SSR) — module content, layout, metadata │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Client Components — useCourseProgress hook, activity forms │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │/api/course│  │/api/submit-│  │/api/reviewer/│  │/api/verify│  │
│  │-progress  │  │work-product│  │[action]      │  │/[certID]  │  │
│  └─────┬─────┘  └─────┬──────┘  └──────┬───────┘  └─────┬────┘  │
└────────┼──────────────┼─────────────────┼────────────────┼───────┘
         │              │                 │                │
┌────────▼──────────────▼─────────────────▼────────────────▼───────┐
│                         Supabase                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  course_progress  │  │  work_submissions │  │  certificates   │ │
│  │  (per-learner     │  │  + Storage bucket │  │  (verified by   │ │
│  │   module state)   │  │  (uploaded files) │  │   cert ID)      │ │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
         │                │                  │
┌────────▼────────┐  ┌────▼────────┐  ┌──────▼──────────────────┐
│   ConvertKit    │  │  Accredible  │  │  Stripe                 │
│  (tags on enrol │  │  (cert gen + │  │  (Checkout $79          │
│   + certify)    │  │   badge URL) │  │   + institution bundle) │
└─────────────────┘  └─────────────┘  └─────────────────────────┘
```

---

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| Course Shell Layout | Persistent progress sidebar, module nav, pillar color banding | Server component with client `useCourseProgress` island |
| `useCourseProgress` hook | Module advance, resume, forward-only gate, sessionStorage sync | Mirrors `useAssessment` pattern exactly |
| Onboarding Survey | 3 questions at enrollment, routes platform content | Client component in `/courses/aibi-p/onboarding/` |
| Module Page | Content + activity container per module | Server component; activity is a client island |
| Activity Forms | Submission, validation, character minimums | Client components co-located under `_components/` per module |
| Skill Builder | 5-component labeled fields, .md export | Client component, `URL.createObjectURL` for download |
| Work Product Submission | 4 text fields + file upload (.md skill file) | Client component posting FormData to API route |
| Reviewer Dashboard | Queue view, rubric scoring, approve/fail | Protected route, server-rendered list, client scoring form |
| PDF Generator | Acceptable Use Card (dynamic), static artifacts (served) | `@react-pdf/renderer` in API route for dynamic; static PDFs in `public/artifacts/` |
| `/verify/[certID]` | Public certificate verification page | Server component, Supabase query, no auth required |
| Analytics | 9 Plausible events via existing `trackEvent()` | Extend existing `plausible.ts` with new event types |

---

## Recommended Project Structure

The additions fit the existing `@content/` and `@/` path alias conventions exactly.

```
content/
└── courses/
    └── aibi-p/
        ├── modules.ts          # Module map: id, pillar, title, time, color var
        ├── onboarding.ts       # 3 survey questions + routing rules
        ├── m1/
        │   ├── content.ts      # Module content spec (headings, body, callouts)
        │   └── activity.ts     # Activity definition (fields, minimums, artifact trigger)
        ├── m2/ ... m9/         # Same pattern per module
        └── artifacts.ts        # Artifact definitions (name, trigger, type: static|dynamic)

src/app/
├── courses/
│   └── aibi-p/
│       ├── layout.tsx          # Course shell: progress rail, pillar banding (SERVER)
│       ├── page.tsx            # Course landing / enrollment gate (SERVER)
│       ├── onboarding/
│       │   └── page.tsx        # 3-question survey (CLIENT island)
│       ├── [module]/
│       │   ├── page.tsx        # Module content + activity (SERVER + CLIENT island)
│       │   └── _components/
│       │       ├── ActivityForm.tsx      # Per-module activity (CLIENT)
│       │       ├── SkillBuilder.tsx      # M7 only — 5-field + .md export (CLIENT)
│       │       └── ClassificationDrill.tsx  # M5 only — 20-scenario timed drill (CLIENT)
│       └── submit/
│           └── page.tsx        # M9 work product submission (CLIENT)
├── admin/
│   └── reviewer/
│       ├── page.tsx            # Submission queue (SERVER)
│       └── [submissionId]/
│           └── page.tsx        # Rubric scoring interface (CLIENT)
├── verify/
│   └── [certId]/
│       └── page.tsx            # Public cert verification (SERVER)
└── api/
    ├── course/
    │   ├── enroll/route.ts          # POST: Stripe session → provision access
    │   ├── progress/route.ts        # POST: advance module, enforce forward-only
    │   ├── onboarding/route.ts      # POST: save survey answers, update routing prefs
    │   └── activity/route.ts        # POST: submit activity response, trigger artifact
    ├── submit-work-product/
    │   └── route.ts                 # POST: FormData (files + text), save to Supabase Storage
    ├── reviewer/
    │   ├── queue/route.ts           # GET: pending submissions for reviewer
    │   └── score/route.ts           # POST: rubric scores, trigger cert or feedback email
    ├── generate-pdf/
    │   └── route.ts                 # POST: acceptable-use-card dynamic PDF
    ├── verify/
    │   └── [certId]/route.ts        # GET: public cert data, no PII beyond spec
    ├── webhooks/
    │   └── stripe/route.ts          # EXISTING — extend to handle aibi-p purchase
    └── create-checkout/
        └── route.ts                 # EXISTING — extend for $79 + institution bundle

src/lib/
├── accredible/
│   └── index.ts            # createCredential(email, name, certId) → badge URL
├── courses/
│   ├── progress.ts         # Supabase read/write for course_progress
│   ├── submissions.ts      # Supabase read/write for work_submissions
│   └── certificates.ts     # Supabase read/write for certificates table
└── analytics/
    └── plausible.ts        # EXTEND — add 9 new PlausibleEventName values

public/
└── artifacts/
    ├── regulatory-cheatsheet-v1.pdf
    ├── platform-reference-card-v1.pdf
    └── skill-template-library-v1.pdf   # Static artifacts — no generation needed
```

---

### Structure Rationale

- **`content/courses/aibi-p/`:** Mirrors `content/assessments/v1/` and `content/exams/aibi-p/` exactly. Module content stays out of components, enabling Kajabi migration without touching component code.
- **`[module]` dynamic segment:** All 9 modules share one layout + page file. Module number drives content lookup from `content/courses/aibi-p/modules.ts`.
- **`_components/` co-location:** Activity forms are private to the course route, same pattern as `src/app/assessment/_components/`.
- **`admin/reviewer/`:** Separate from `/courses/` to support role-based access. Reviewer pages need a different auth check than learner pages.
- **`src/lib/accredible/`:** Follows existing `src/lib/convertkit/`, `src/lib/hubspot/` adapter pattern. Thin wrapper, easy to swap.
- **Static PDFs in `public/artifacts/`:** Regulatory Cheatsheet, Platform Reference Card, and Skill Template Library do not vary by learner. Serve directly from CDN. Only the Acceptable Use Card is generated dynamically.

---

## Architectural Patterns

### Pattern 1: Co-located Hook per Feature

**What:** Each interactive feature (assessment, exam, course) has a `useX` hook that owns all state, persists to sessionStorage, and exposes typed state + actions. Components are thin consumers.

**When to use:** Any multi-step flow with progress state (onboarding survey, per-module activity, work product form).

**Trade-offs:** Hook grows complex for 9-module flow. Mitigate by splitting: `useCourseProgress` (module navigation) is separate from `useActivityForm` (per-module submission state).

**Example — mirrors existing useAssessment:**
```typescript
// src/app/courses/aibi-p/_lib/useCourseProgress.ts
'use client';

const STORAGE_KEY = 'aibi-course-aibi-p-v1';

export interface CourseProgressState {
  readonly enrollmentId: string;
  readonly currentModule: number;       // 1–9
  readonly completedModules: readonly number[];
  readonly onboarding: OnboardingAnswers | null;
  readonly phase: 'onboarding' | 'course' | 'submitted' | 'certified';
}

// Persist to sessionStorage on every state change (same pattern as useAssessment)
// Write to Supabase via /api/course/progress on module advance
```

### Pattern 2: Server Component Shell + Client Island

**What:** Module page is a Server Component that imports content from `@content/courses/aibi-p/m[n]/content.ts` and renders it as HTML. The activity form is a `'use client'` island that posts to an API route.

**When to use:** All 9 module pages. Keeps content rendering fast and SEO-friendly while keeping activity state isolated to the client.

**Trade-offs:** The content/activity split requires clear boundaries. Activity state must not bleed into the server component.

**Example:**
```typescript
// src/app/courses/aibi-p/[module]/page.tsx  (SERVER)
import { getModuleContent } from '@content/courses/aibi-p/modules';
import { ActivityForm } from './_components/ActivityForm';

export default async function ModulePage({ params }: { params: { module: string } }) {
  const content = getModuleContent(Number(params.module));
  return (
    <article>
      {/* Server-rendered content */}
      <ModuleContent content={content} />
      {/* Client island for interaction */}
      <ActivityForm moduleId={content.id} activityDef={content.activity} />
    </article>
  );
}
```

### Pattern 3: Forward-Only Progress with Server Validation

**What:** Client enforces forward-only navigation via `completedModules` state. Server validates on `/api/course/progress` that the module being advanced is `completedModules.length + 1` — preventing anyone from POSTing out-of-order completion.

**When to use:** Module advance. Activity re-submission prevention.

**Trade-offs:** Requires server round-trip on each module advance. Acceptable for a course where advances happen at most 9 times per learner.

### Pattern 4: Onboarding Routing Context

**What:** Onboarding survey answers (`m365_access`, `paid_subscriptions`, `role`) are stored in Supabase and mirrored to a React context so any module component can read them without prop drilling.

**When to use:** Any component that needs to conditionally show platform-specific content (M2 through M5 have branched content by platform access).

**Trade-offs:** Context adds coupling between onboarding and module pages. Acceptable because the routing is a core product feature, not optional.

```typescript
// src/app/courses/aibi-p/layout.tsx
// Fetch onboarding answers server-side, pass as prop to client context provider
```

### Pattern 5: Dynamic PDF via @react-pdf/renderer

**What:** Acceptable Use Card is generated from the learner's Activity 5.2 answers in an API route. `@react-pdf/renderer` runs on the server in a Route Handler, returns a `Response` with `Content-Type: application/pdf`.

**When to use:** Only for the Acceptable Use Card. All other artifacts are static files in `public/artifacts/`.

**Why not Puppeteer:** Puppeteer requires a Chromium binary that exceeds Vercel's serverless function size limit without additional configuration. `@react-pdf/renderer` runs in Node.js without a browser binary, making it the right fit for Vercel.

```typescript
// src/app/api/generate-pdf/route.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { AcceptableUseCardPDF } from '@/components/pdf/AcceptableUseCardPDF';

export async function POST(req: Request) {
  const { role, tools, dataTier, contact } = await req.json();
  const buffer = await renderToBuffer(
    <AcceptableUseCardPDF role={role} tools={tools} dataTier={dataTier} contact={contact} />
  );
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="acceptable-use-card.pdf"',
    },
  });
}
```

---

## Data Flow

### Enrollment Flow
```
Learner clicks "Enroll" on /courses/aibi-p
  → /api/create-checkout (Stripe Checkout Session, $79 or institution bundle)
  → Stripe payment.success webhook → /api/webhooks/stripe
  → INSERT course_enrollments (email, product: 'aibi-p', stripe_session_id)
  → INSERT course_progress (enrollment_id, current_module: 0, phase: 'onboarding')
  → ConvertKit tag: aibi-p-enrolled
  → HubSpot: course_enrolled property updated
  → Plausible: course_enrolled event
  → Redirect to /courses/aibi-p/onboarding
```

### Module Advance Flow
```
Learner submits activity form
  → POST /api/course/activity { enrollmentId, moduleId, responses }
  → Server validates: moduleId === completedModules.length + 1
  → INSERT activity_responses (enrollment_id, module_id, responses, submitted_at)
  → If artifact triggered: return artifact URL or generate-pdf endpoint
  → POST /api/course/progress { enrollmentId, completedModule: moduleId }
  → UPDATE course_progress SET completed_modules = completed_modules || moduleId
  → Plausible: module_completed { learner_id, module_number, time_spent_min }
  → Client advances to next module
```

### Work Product Submission Flow
```
Learner submits M9 work product (4 text fields + .md file upload)
  → POST /api/submit-work-product (FormData)
  → Server: extract file from formData, validate type (.md only), validate size
  → Supabase Storage: upload to work-products/{enrollmentId}/{timestamp}.md
  → INSERT work_submissions (enrollment_id, skill_text, input_text, raw_output,
      edited_output, annotation, file_path, submitted_at)
  → UPDATE course_progress SET phase = 'submitted'
  → ConvertKit: tag aibi-p-submitted (optional — not in PRD but useful)
  → Plausible: work_product_submitted { learner_id, timestamp }
  → Email: "submission received, review within 5 business days"
```

### Reviewer Approval Flow
```
Reviewer opens /admin/reviewer/[submissionId]
  → Server fetches work_submission + learner profile
  → Reviewer scores 5 dimensions (1–4 each)
  → POST /api/reviewer/score { submissionId, scores, verdict: 'pass' | 'fail' }
  → Server validates: if Accuracy === 1, force verdict = 'fail'
  → If fail:
      → UPDATE work_submissions SET status = 'failed', feedback = ...
      → Email learner: specific dimension feedback + resubmission guidance
      → Plausible: work_product_failed { learner_id, failed_dimension }
  → If pass:
      → Generate unique certificate ID (uuid)
      → POST Accredible API: createCredential(email, name, certId) → badge URL
      → INSERT certificates (enrollment_id, cert_id, issued_at, accredible_badge_url)
      → UPDATE course_progress SET phase = 'certified'
      → ConvertKit tag: aibi-p-certified
      → HubSpot: aibi_p_certified = true
      → Plausible: certificate_issued { learner_id, certificate_id, timestamp }
      → Email learner: cert PDF + Accredible badge link
```

### Certificate Verification Flow
```
GET /verify/[certId]
  → Server: SELECT * FROM certificates WHERE cert_id = certId
  → Return: holder_name, designation, issued_at, institution_name
  → No email, no enrollment_id, no score — only what PRD specifies
```

### State Management

```
sessionStorage (client — resume across tab kills)
    ↓ (hydrate on mount, same as useAssessment)
useCourseProgress hook (client state)
    ↓ (write on module advance)
/api/course/progress (server validation)
    ↓ (persist)
Supabase course_progress table (source of truth)
    ↓ (read on page load for authenticated users)
Server Component layout.tsx (pass progress as prop to client context)
```

---

## Database Schema Additions

These tables extend the existing `assessment_responses` and `course_enrollments` schema.

```sql
-- Rename existing course_enrollments or extend it:
-- The existing table already covers enrollment; add phase tracking.

ALTER TABLE course_enrollments
  ADD COLUMN IF NOT EXISTS phase text DEFAULT 'onboarding'
    CHECK (phase IN ('onboarding', 'course', 'submitted', 'certified')),
  ADD COLUMN IF NOT EXISTS onboarding_answers jsonb,
  ADD COLUMN IF NOT EXISTS completed_modules integer[] DEFAULT '{}';

-- Per-module activity responses
CREATE TABLE activity_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES course_enrollments(id),
  module_id integer NOT NULL CHECK (module_id BETWEEN 1 AND 9),
  responses jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, module_id)  -- forward-only enforced: can't resubmit
);

-- M9 assessed work product submissions
CREATE TABLE work_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES course_enrollments(id),
  skill_text text NOT NULL,
  input_text text NOT NULL,
  raw_output text NOT NULL,
  edited_output text NOT NULL,
  annotation text NOT NULL,
  file_path text,                  -- Supabase Storage path for .md file
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'passed', 'failed', 'resubmitted')),
  reviewer_id uuid,
  rubric_scores jsonb,             -- { accuracy: 3, completeness: 4, ... }
  reviewer_feedback text,
  reviewed_at timestamptz,
  attempt integer DEFAULT 1 CHECK (attempt IN (1, 2))
);

-- Issued certificates
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES course_enrollments(id),
  cert_id text UNIQUE NOT NULL,    -- public-facing ID used in /verify/[certId]
  issued_at timestamptz DEFAULT now(),
  accredible_badge_url text,
  holder_name text NOT NULL,
  institution_name text,
  designation text DEFAULT 'AiBI-P · Banking AI Practitioner'
);

-- RLS: Learner reads own data only
CREATE POLICY "Learner reads own enrollment" ON course_enrollments
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Reviewers need a separate role or a simple admin flag
-- Simplest for Phase 1: add reviewer_approved boolean to a reviewer_profiles table
-- or check email against an allowlist in the API route (no RLS complexity for Phase 1)
```

**Supabase Storage bucket:**
```
Bucket: work-products (private)
Path pattern: work-products/{enrollment_id}/{timestamp}-skill.md
Max size: 1 MB (skill .md files are small)
RLS: only service role can write; only reviewer can read
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Stripe | Extend existing `/api/webhooks/stripe` to handle `aibi-p` product purchase | Add `aibi-p` case to existing webhook handler; provision enrollment on `payment.success` |
| Accredible | New `src/lib/accredible/index.ts` adapter, POST from `/api/reviewer/score` | MEDIUM confidence — API is REST, creates credential object, returns badge URL. Verify endpoint shape against [docs.api.accredible.com](https://docs.api.accredible.com/) before building |
| ConvertKit | Extend existing `src/lib/convertkit/` with two new tags: `aibi-p-enrolled`, `aibi-p-certified` | No sandbox — staging must set `SKIP_CONVERTKIT=true` |
| HubSpot | Extend existing `src/lib/hubspot/` to set `course_enrolled` and `aibi_p_certified` contact properties | Pre-create these properties in HubSpot dashboard before going live |
| Supabase Storage | New bucket for work product file uploads | Service-role client only — never expose storage URLs to learner directly |
| Plausible | Extend existing `plausible.ts` with 9 new `PlausibleEventName` values | Uses existing deferred queue pattern — no new setup |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Course layout ↔ module pages | Server props + React context (onboarding answers) | Layout fetches progress server-side, passes to `CourseProgressContext` |
| Module page ↔ activity form | Props from server component to client island | Activity definition from `@content` is serializable — pass as prop |
| Activity form ↔ API route | `fetch('/api/course/activity', { method: 'POST', body: JSON })` | Standard JSON, not FormData (except work product submission) |
| Work product form ↔ API route | `fetch('/api/submit-work-product', { method: 'POST', body: FormData })` | Use `request.formData()` in Route Handler — no `bodyParser` config needed in App Router |
| Reviewer route ↔ learner routes | Separate under `/admin/reviewer/` — access controlled by API-level allowlist check | Phase 1: check reviewer email against `REVIEWER_EMAILS` env var. Phase 2: Supabase RLS with reviewer role |
| Verification endpoint ↔ certificates table | Server component direct Supabase query, no auth | Returns only: holder_name, designation, issued_at, institution_name |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 learners | Current architecture handles this with no changes. Vercel serverless, Supabase free/pro tier. |
| 500–5K learners | Supabase connection pooling (PgBouncer, already enabled on pro). Add `created_at` index on `work_submissions` for reviewer queue. |
| 5K+ learners | Reviewer queue becomes a bottleneck (human reviewers). Consider async queue (Supabase Edge Functions or Inngest) to dequeue and assign submissions. Kajabi migration (Phase 2) likely already triggered before this scale. |

**First bottleneck:** The reviewer queue is human-rate-limited. At 50+ submissions/week, a simple database query list becomes a workflow management problem. Not an architectural problem — a staffing and process problem. Flag this in Phase 2 planning.

**Second bottleneck:** Dynamic PDF generation (Acceptable Use Card) on Vercel has a 10-second serverless timeout on hobby/pro plans. `@react-pdf/renderer` is fast enough that this is not a concern at current scale. If generation regularly exceeds 5 seconds, move to background job pattern.

---

## Anti-Patterns

### Anti-Pattern 1: Hardcoding Module Content in Components

**What people do:** Write module content (headings, body text, callout text) directly in `.tsx` files.

**Why it's wrong:** Breaks Kajabi migration requirement. Makes content updates require code deploys. Violates the content-separation architecture already established for assessments and exams.

**Do this instead:** All content in `content/courses/aibi-p/m[n]/content.ts`. Components receive content as typed props from server components.

### Anti-Pattern 2: Single `useCourseProgress` Hook Owning All Activity State

**What people do:** Add per-activity form state (text field values, drill scores, skill builder fields) into the course progress hook.

**Why it's wrong:** Activity state is transient (submit and done). Course progress state is durable (persists across sessions). Mixing them creates a giant hook that's hard to test and reason about.

**Do this instead:** `useCourseProgress` owns module navigation and completed modules only. Each activity has its own local `useState` or a dedicated `useActivityForm` hook. Activity state is NOT persisted to sessionStorage — only submitted responses matter.

### Anti-Pattern 3: Exposing Supabase Storage URLs Directly to Learners

**What people do:** Return the storage URL for uploaded .md files directly to the client for "download your submission" links.

**Why it's wrong:** Storage URLs can expose the full file path including enrollment_id. Creates a guessable URL pattern for other learners' submissions.

**Do this instead:** Route downloads through an API endpoint that validates the requesting user owns the enrollment before generating a signed URL from Supabase Storage.

### Anti-Pattern 4: Client-Side Forward-Only Enforcement Only

**What people do:** Enforce forward-only module progression entirely on the client (disable the "back" button, hide completed module links).

**Why it's wrong:** A determined learner can POST directly to `/api/course/progress` to mark any module complete out of order.

**Do this instead:** Server validates on every progress write that `moduleId === max(completed_modules) + 1`. Client enforcement is UX only.

### Anti-Pattern 5: New Stripe Product Without Webhook Extension

**What people do:** Create a new Stripe Checkout Session for AiBI-P but forget the webhook handler only knows about the old product price IDs.

**Why it's wrong:** `payment.success` fires but enrollment is never provisioned. Learner paid, can't access course.

**Do this instead:** Before creating the Stripe product, update the `payment.success` case in `/api/webhooks/stripe` to handle the `STRIPE_AIBI_P_PRICE_ID` and `STRIPE_INSTITUTION_PRICE_ID` environment variables.

---

## Build Order

Dependencies drive this order. Each phase produces a usable vertical slice that can be tested before the next begins.

### Phase 1: Foundation (No Learner Data)
**Goal:** Course shell, content structure, and static display work end-to-end on a test route.

1. `content/courses/aibi-p/modules.ts` — Module map type definitions
2. `content/courses/aibi-p/onboarding.ts` — Survey questions + routing rules
3. `content/courses/aibi-p/m1/ ... m9/` — Content stubs (titles, pillar, activity def)
4. `src/app/courses/aibi-p/layout.tsx` — Course shell with hardcoded progress (no DB yet)
5. `src/app/courses/aibi-p/[module]/page.tsx` — Module page rendering content from `@content`
6. `src/app/courses/aibi-p/[module]/_components/ActivityForm.tsx` — Generic activity form (no submit)
7. Pillar color banding (Sage/Awareness, Cobalt/Understanding, Amber/Creation, Terra/Application)

**Deliverable:** Full 9-module course is browsable at `/courses/aibi-p/[1-9]` with real content. No auth, no DB.

### Phase 2: Stripe + Enrollment
**Goal:** Learner can pay and be provisioned. Course is paywalled.

8. Extend `STRIPE_AIBI_P_PRICE_ID` and `STRIPE_INSTITUTION_PRICE_ID` env vars
9. Extend `/api/webhooks/stripe` to handle AiBI-P purchase
10. `src/app/api/course/enroll/route.ts` — Provision enrollment + progress row
11. Paywall check in `src/app/courses/aibi-p/layout.tsx` (redirect to enrollment if no active row)
12. `src/app/courses/aibi-p/page.tsx` — Enrollment landing with Stripe Checkout CTA
13. Extend ConvertKit + HubSpot libs for `aibi-p-enrolled` tag

**Deliverable:** Learner pays, gets access, lands on onboarding. Non-enrolled visitors see enrollment page.

### Phase 3: Onboarding + Progress Tracking
**Goal:** Onboarding survey saves, progress persists across sessions.

14. `src/app/courses/aibi-p/onboarding/page.tsx` — 3-question survey client component
15. `src/app/api/course/onboarding/route.ts` — Save answers to `course_enrollments.onboarding_answers`
16. `src/app/courses/aibi-p/_lib/useCourseProgress.ts` — Hook with sessionStorage + Supabase sync
17. `src/app/api/course/progress/route.ts` — Server-side forward-only validation + DB write
18. Course layout reads progress from Supabase server-side, passes to client context
19. Module navigation respects `completed_modules` (forward-only, current module highlighted)
20. Module content branches based on `onboarding_answers.m365_access` and `paid_subscriptions`

**Deliverable:** Learner completes onboarding, navigates modules in order, can close and resume.

### Phase 4: Activities + Artifacts
**Goal:** Each module's activity is submittable; artifacts trigger and download correctly.

21. `src/app/api/course/activity/route.ts` — Save responses to `activity_responses`
22. Activity forms per module (M1 reflection, M2 inventory, M5 classification drill, etc.)
23. `src/app/courses/aibi-p/[module]/_components/ClassificationDrill.tsx` — M5 20-scenario drill
24. `src/app/courses/aibi-p/[module]/_components/SkillBuilder.tsx` — M7 5-field + .md export
25. Static artifact downloads wired to module completion events (`public/artifacts/`)
26. `src/app/api/generate-pdf/route.ts` — Acceptable Use Card dynamic PDF (`@react-pdf/renderer`)
27. Extend `plausible.ts` with course event types; wire `module_completed` and `artifact_downloaded`

**Deliverable:** All 9 modules completable with activities. 4 of 5 artifacts downloadable (Acceptable Use Card dynamic PDF may need design input before building).

### Phase 5: Work Product + Reviewer
**Goal:** M9 submission works; reviewer can score and approve or fail.

28. `src/app/courses/aibi-p/submit/page.tsx` — 4-field + file upload form
29. `src/app/api/submit-work-product/route.ts` — FormData handler, Supabase Storage upload
30. `src/app/admin/reviewer/page.tsx` — Queue view (pending submissions list)
31. `src/app/admin/reviewer/[submissionId]/page.tsx` — Rubric scoring interface
32. `src/app/api/reviewer/score/route.ts` — Score submission, Accuracy hard gate, update status
33. Reviewer access control (email allowlist via env var for Phase 1)
34. Failure email template (feedback on specific failed dimensions)
35. Plausible: `work_product_submitted`, `work_product_passed`, `work_product_failed`

**Deliverable:** Full submission and review cycle works end-to-end. Reviewer can approve or reject.

### Phase 6: Certificates + Verification
**Goal:** Approved submissions generate real certificates. `/verify/[certId]` is live.

36. `src/lib/accredible/index.ts` — Adapter wrapping Accredible REST API
37. Extend `/api/reviewer/score/route.ts` — On pass: call Accredible, insert certificate row
38. Certificate delivery email (Accredible badge URL + PDF link)
39. ConvertKit tag `aibi-p-certified` + HubSpot `aibi_p_certified` property
40. `src/app/verify/[certId]/page.tsx` — Public verification page
41. `src/app/api/verify/[certId]/route.ts` — Returns cert data with no PII beyond spec
42. Plausible: `certificate_issued`

**Deliverable:** Complete flow from payment to certificate. AiBI-P is shippable.

---

## Key Integration Touchpoints with Existing Code

These existing files need modification (not replacement) to support the course:

| Existing File | Change Required |
|---------------|-----------------|
| `src/app/api/webhooks/stripe/route.ts` | Add `aibi-p` and institution bundle price ID cases to `payment.success` handler |
| `src/app/api/create-checkout/route.ts` | Add $79 individual and institution bundle products |
| `src/lib/analytics/plausible.ts` | Add 9 new `PlausibleEventName` union values |
| `src/lib/convertkit/index.ts` | Add `tagContact` call for `aibi-p-enrolled` and `aibi-p-certified` |
| `src/lib/hubspot/index.ts` | Add `course_enrolled` and `aibi_p_certified` property updates |
| `src/lib/user-data.ts` | Optionally: add `courseEnrollment` to `UserData` interface (or use Supabase directly) |
| `src/app/dashboard/page.tsx` | Add course progress section once Supabase is wired |
| `public/sitemap.ts` → `src/app/sitemap.ts` | Add `/courses/aibi-p` and `/verify/[certId]` pattern |

---

## Sources

- Codebase inspection: `src/app/assessment/_lib/useAssessment.ts` (sessionStorage + hook pattern)
- Codebase inspection: `src/app/certifications/exam/_lib/useExam.ts` (forward-only, typed state)
- Codebase inspection: `src/lib/analytics/plausible.ts` (deferred queue pattern)
- Codebase inspection: `src/app/api/capture-email/route.ts` (API route validation pattern)
- PRD: `content/courses/aibi-p-prd-complete copy.txt` (module map, activities, artifacts, reviewer rubric, analytics events, integrations)
- [Next.js Route Handler docs](https://nextjs.org/docs/app/api-reference/file-conventions/route) — `request.formData()` for file uploads (no bodyParser in App Router)
- [Accredible API docs](https://docs.api.accredible.com/) — certificate creation endpoint (MEDIUM confidence — verify endpoint shape before building)
- [Supabase Storage docs](https://supabase.com/docs/guides/storage) — private bucket, signed URLs, RLS
- @react-pdf/renderer preferred over Puppeteer for Vercel: avoids Chromium binary size limit

---

*Architecture research for: AiBI-P course integration into Next.js 14 App Router*
*Researched: 2026-04-15*
