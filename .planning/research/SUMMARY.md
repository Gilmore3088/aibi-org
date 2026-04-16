# Project Research Summary

**Project:** AiBI-P Banking AI Practitioner — Self-Paced Certification Course
**Domain:** Professional LMS certification course integrated into existing Next.js 14 site
**Researched:** 2026-04-15
**Confidence:** HIGH (stack, architecture, Vercel constraints), MEDIUM (Accredible API specifics)

## Executive Summary

The AiBI-P course is a professional certification product — not a content site. That distinction drives every architectural decision. Unlike Teachable or Thinkific courses, AiBI-P issues a human-reviewed credential that must be credible to hiring managers and compliance officers at community banks. That means: forward-only progression enforced server-side, a reviewer queue with a 5-dimension rubric, Accredible-issued badges with LinkedIn integration, and zero tolerance for certificate inflation. The course runs within the existing Next.js 14 / Supabase / Stripe stack — no new hosting platform, no LMS framework, no migration required until Phase 2 when Kajabi becomes relevant.

The recommended approach is to build in 6 sequential vertical slices that each produce a testable deliverable: (1) course shell with content rendering, (2) Stripe enrollment and access gating, (3) onboarding branch and progress tracking, (4) per-module activities and artifact downloads, (5) work product submission and reviewer queue, (6) Accredible certificate issuance and public verification. This order is dictated by hard dependency chains — nothing in the reviewer flow can be tested until upload and submission work, which cannot be tested until enrollment and progress gating exist. The dependency tree is strictly linear.

The two risks that could kill the product's credibility are both avoidable with deliberate architecture: (1) certificates issued prematurely due to a race condition between rubric submission and Accredible API call — prevented by a re-read of approved status before calling Accredible; and (2) course progress lost on iOS Safari tab kill — prevented by writing to Supabase synchronously on every module advance, treating sessionStorage as a read-back cache only. Both are architectural decisions that must be made before the first line of course feature code is written.

## Key Findings

### Recommended Stack

The existing stack (Next.js 14 App Router, Supabase Postgres + Auth + Storage, Stripe Checkout, ConvertKit, HubSpot, Plausible) handles the course without significant new infrastructure. The only net-new additions are four npm packages (`@react-pdf/renderer`, `react-dropzone`, `react-hook-form`, `zod` + `@hookform/resolvers`) and a custom 40-line Accredible REST wrapper in `src/lib/accredible/`. Kajabi, an LMS framework, and any additional SaaS are explicitly out of scope for Phase 1.

**Core technologies:**
- `@react-pdf/renderer ^4.4.1`: Generates the Acceptable Use Card PDF in a Next.js Route Handler — runs pure Node.js, no Chromium, within Vercel's 250 MB function bundle limit
- `react-dropzone ^14.3.5`: Drag-and-drop file upload UI that integrates with Supabase Storage presigned URLs — keeps uploads within already-contracted infrastructure
- `react-hook-form ^7.54.2` + `zod ^3.24.1`: Form validation for multi-field forms (5+ interdependent fields qualify — subscription inventory, work product submission); not needed for simple forms
- Accredible REST API (custom wrapper, no SDK): POST credential, receive `credential.url` + LinkedIn badge URL — no npm package, 40-line wrapper is cleaner than any unmaintained community SDK
- Supabase Storage (existing): Work product `.md` file uploads via presigned URL pattern — never route file bytes through a Vercel function

**Critical version note:** `@react-pdf/renderer` must be v4.1.0+ for React 19 compatibility and Next.js App Router crash fix. `next.config.js` must add `serverExternalPackages: ['@react-pdf/renderer']`.

### Expected Features

The MVP requires 15 features across 6 concern groups. Nothing is discretionary — each item either gates another feature or defines what makes AiBI-P credible as a credential product rather than a quiz.

**Must have (table stakes):**
- Supabase Auth (email/password) — gates all course content; every other feature depends on it
- Stripe Checkout ($79 individual + institutional quantity) — no payment, no enrollment
- Forward-only module gating with server-side prerequisite validation — credential integrity
- Mobile-first layout, one card per screen at 390px, 14pt minimum — banking staff complete on phones
- Skill Builder (5-component form + .md export) — learner leaves with reusable prompt library
- Work product submission (4-item, file upload via Supabase Storage signed URLs)
- Reviewer queue with 5-dimension rubric, Accuracy hard gate (score 1 = auto-fail)
- Accredible certificate issuance on reviewer approval, LinkedIn badge link surfaced
- Public certificate verification at `/verify/[certId]` — no auth required
- 3 static artifact downloads (Regulatory Cheatsheet, Acceptable Use Card, Skill Template Library)
- Dynamic PDF: "My First Skill" populated from Skill Builder data via `@react-pdf/renderer`
- 9 Plausible analytics events at module boundaries

**Should have (competitive differentiators):**
- 3-question onboarding branch routing platform-specific content (Copilot vs. ChatGPT vs. generic)
- Institution bundle pricing (~$63/seat at 5+) — community banks buy in cohorts
- ConvertKit enrollment and certification tags (`aibi-p-enrolled`, `aibi-p-certified`)
- HubSpot `course_status` and `certification_date` property updates
- "Platform Feature Reference Card" second dynamic PDF

**Defer to v1.x / v2+:**
- Kajabi migration (content in `/content/courses/aibi-p/` is migration-ready by design)
- Peer benchmarking ("You ranked in the top 30%") — requires N >= 30 submissions per segment
- Batch/cohort enrollment with CSV upload
- Certificate expiration and renewal workflow
- Video content per module — enormous production cost, no Kajabi reuse path
- Real-time chat / cohort discussions — zero users at launch, off-brand for institutional consulting product

**Explicit anti-features (never build):**
- Self-graded work product (destroys credential credibility)
- Gamification points/leaderboards (wrong register for compliance-adjacent banking content)
- Dark mode (excluded by designer brief; parchment brand system is the product)

### Architecture Approach

The architecture is additive to the existing codebase — no rewrites, no new route segments that conflict with existing pages. Course content lives entirely in `/content/courses/aibi-p/` (same pattern as `content/assessments/v1/`), making it Kajabi-portable when that migration arrives. Module pages are Server Components that receive content as typed props; activity forms are `'use client'` islands co-located under `_components/`. State is owned by a `useCourseProgress` hook (mirrors `useAssessment`) with sessionStorage as a read-back cache and Supabase as the source of truth. The reviewer queue lives at `/admin/reviewer/` under separate RLS and access control from learner routes. Certificate verification at `/verify/[certId]` is fully public with no auth.

**Major components:**
1. **Course Shell (`/courses/aibi-p/layout.tsx`)** — Progress rail, pillar color banding, enrollment gate; Server Component with `useCourseProgress` client island
2. **Module Pages (`/courses/aibi-p/[module]/page.tsx`)** — Server-rendered content from `@content`, client activity form island; 9 modules share one layout + page file via dynamic segment
3. **`useCourseProgress` hook** — Module navigation, completed-modules tracking, sessionStorage cache, Supabase write on advance; mirrors `useAssessment` exactly
4. **Work Product Submission + Reviewer Queue** — FormData to Supabase Storage via presigned URL; reviewer dashboard at `/admin/reviewer/`; 5-dimension rubric with Accuracy hard gate
5. **Accredible adapter (`src/lib/accredible/index.ts`)** — Thin REST wrapper; called only after re-reading `approved` status from DB
6. **PDF generator (`/api/generate-pdf/route.ts`)** — `@react-pdf/renderer` in a Route Handler; returns `application/pdf`; static artifacts served from `public/artifacts/`

**Database additions:** `ALTER TABLE course_enrollments ADD COLUMN phase, onboarding_answers, completed_modules` plus three new tables: `activity_responses`, `work_submissions`, `certificates`. Supabase Storage private bucket `work-products`.

### Critical Pitfalls

1. **File uploads routed through Vercel functions** — Vercel hard-enforces a 4.5 MB request body cap with no override. Prevention: issue a Supabase presigned upload URL from the API route; client uploads directly to Supabase Storage — the API route never touches file bytes.

2. **Course progress in sessionStorage only** — iOS Safari aggressively kills background tabs; a 5.5-hour course cannot rely on sessionStorage. Prevention: write to Supabase `course_progress` synchronously before advancing the module UI; sessionStorage is a read-back cache only.

3. **Certificate issued before approval confirmed** — Accredible credential deletion invalidates LinkedIn badge URLs already shared by learners — reversal is costly. Prevention: reviewer submits rubric, write `approved` status, separate `/api/certify` re-reads `approved` from DB before calling Accredible.

4. **Forward-only progression enforced client-side only** — A learner can POST directly to the completion API to skip modules. Prevention: server validates `moduleId === max(completed_modules) + 1` on every progress write.

5. **Supabase RLS without policies** — Enabled by default, no policies = empty result sets with no error; overly broad policies = cross-user data leakage. Prevention: write RLS policies in the same migration file as the table CREATE; test with Supabase Dashboard RLS tester (not SQL Editor, which bypasses RLS).

6. **Content hardcoded in JSX** — Module prose embedded in `.tsx` files doubles the scope of the Kajabi migration. Prevention: enforce `/content/courses/aibi-p/` separation from the first module built; components receive content as typed props only.

## Implications for Roadmap

Based on the dependency chain identified in FEATURES.md and the build order specified in ARCHITECTURE.md, 6 phases are recommended. Each produces a vertically testable slice before the next begins.

### Phase 1: Course Shell and Content Structure
**Rationale:** Content structure must be established before any other feature is built — it enforces the Kajabi-portable content schema and prevents the "content in JSX" anti-pattern. No DB, no auth, no Stripe required. Stakeholders can review the full 9-module structure before payment infrastructure exists.
**Delivers:** Full 9-module course browsable at `/courses/aibi-p/[1-9]` with real content, pillar color banding, and activity form shells (no submit).
**Addresses:** Mobile layout, content separation, 404 handling, Kajabi-portable content schema
**Avoids:** Content hardcoded in JSX (Pitfall 9 in PITFALLS.md)
**Research flag:** Standard patterns — mirrors existing `content/assessments/v1/` structure exactly.

### Phase 2: Stripe Enrollment and Access Gating
**Rationale:** Auth and payment are hard blockers for every downstream feature — progress tracking, onboarding, work product submission, certificates. Nothing can be tested end-to-end until a learner can pay and be provisioned. Institution bundle seat model must be scaffolded here even if invite UI comes later.
**Delivers:** Learner pays $79, webhook provisions enrollment row in Supabase, course is paywalled, non-enrolled visitors see enrollment page.
**Uses:** Extend existing `/api/webhooks/stripe` with `aibi-p` price ID case; existing Stripe Checkout Session pattern
**Addresses:** Stripe enrollment (P1), access gate (P1)
**Avoids:** New Stripe product without webhook extension; institution bundle without seat model (Pitfall 8 in PITFALLS.md)
**Research flag:** Stripe per-seat quantity pattern is HIGH confidence. Institution bundle invite flow design needs resolution before Phase 2 ships.

### Phase 3: Onboarding Branch and Progress Tracking
**Rationale:** Platform context (Copilot vs. ChatGPT vs. generic) must be captured before Module 1 renders — it conditions content across 4+ modules. Progress persistence is the second dependency: without `course_progress` writes, activities in Phase 4 have nowhere to persist.
**Delivers:** Onboarding survey saves to Supabase, forward-only module navigation, session resume on iOS tab kill, platform-branched content in modules M2–M5.
**Implements:** `useCourseProgress` hook, `course_progress` Supabase write pattern, onboarding branch React context fed from server-side layout fetch
**Addresses:** Progress persistence (P1), onboarding branch (P1)
**Avoids:** Course progress in sessionStorage only (Pitfall 3); onboarding branch not persisted (Pitfall 7); forward-only client-only enforcement (Pitfall 4)
**Research flag:** Standard patterns — `useCourseProgress` mirrors `useAssessment` directly.

### Phase 4: Module Activities and Artifact Downloads
**Rationale:** Once progress persistence exists, each module's activity can be built and submitted. This phase transforms the course from a static reading list into the interactive product that justifies the $79 price point.
**Delivers:** All 9 modules completable with submitted activities; 3 static artifact downloads; Acceptable Use Card dynamic PDF; Skill Builder with .md export; ClassificationDrill 20-scenario timer; 9 Plausible events wired.
**Uses:** `@react-pdf/renderer` in Route Handler for Acceptable Use Card; `URL.createObjectURL` blob for .md export; `react-hook-form` + `zod` for multi-field forms
**Addresses:** Skill Builder (P1), artifacts (P1), classification drill (P1), Plausible events (P1)
**Avoids:** Puppeteer / PDF bundle bust (Pitfall 2 in PITFALLS.md)
**Research flag:** `@react-pdf/renderer` Route Handler integration is MEDIUM confidence — verify `serverExternalPackages` config before building. Only non-standard pattern in this phase.

### Phase 5: Work Product Submission and Reviewer Queue
**Rationale:** The highest-complexity feature group and the one that defines AiBI-P's credibility over auto-graded alternatives. Must be fully tested before certificates can exist — the reviewer queue produces the `approved` status that gates Accredible.
**Delivers:** M9 4-item submission with `.md` file upload via presigned URL; reviewer queue at `/admin/reviewer/`; 5-dimension rubric with Accuracy hard gate enforced server-side; pass/fail workflow with feedback email on fail.
**Uses:** `react-dropzone` + Supabase Storage presigned URL; `work_submissions` table with `status` column; reviewer email allowlist via `REVIEWER_EMAILS` env var for Phase 1 access control
**Addresses:** Work product submission (P1), reviewer queue (P1)
**Avoids:** File uploads through Vercel functions (Pitfall 1 — 4.5 MB hard limit); reviewer endpoint accessible to any authenticated user; RLS gaps on `work_submissions`
**Research flag:** Implementation review recommended before shipping. File upload presigned URL pattern and Accuracy hard gate are both places where subtle bugs create irreversible credential problems.

### Phase 6: Certificates, Verification, and Integrations
**Rationale:** Everything upstream feeds into this phase. Reviewer approval triggers Accredible; certificate is the product's final deliverable and the marketing artifact that makes every earner a referral vector. ConvertKit and HubSpot tags slot in here — low-risk additions that leverage existing adapters.
**Delivers:** Accredible credential issuance on reviewer approval; LinkedIn badge link on completion page; public `/verify/[certId]` page with no auth; ConvertKit `aibi-p-certified` tag; HubSpot `aibi_p_certified` property; `certificate_issued` Plausible event.
**Uses:** `src/lib/accredible/index.ts` custom REST wrapper; existing ConvertKit and HubSpot lib patterns
**Addresses:** Certificate issuance (P1), verification (P1), ConvertKit/HubSpot tags (P2)
**Avoids:** Certificate issued before approval confirmed (Pitfall 5 — re-read `approved` before calling Accredible); Accredible duplicate credential (idempotency check before POST)
**Research flag:** Accredible API details are MEDIUM confidence. Verify `POST /v1/credentials` response structure against live `docs.api.accredible.com` before building adapter. Accredible credential group must be pre-created in dashboard — non-code prerequisite that blocks this phase.

### Phase Ordering Rationale

- **Content before auth** (Phase 1 before Phase 2): Establishes content schema that prevents the Kajabi migration trap. Browsable shell can be reviewed by stakeholders before any payment infrastructure exists.
- **Auth before activities** (Phase 2 before Phase 4): Activity submissions require `enrollment_id` as a foreign key. Without enrollment, no `activity_responses` row can be written.
- **Onboarding before activities** (Phase 3 before Phase 4): Platform branch context conditions content in M2–M5. If not persisted before module content renders, personalization silently falls back to generic.
- **Submission before certificates** (Phase 5 before Phase 6): Reviewer queue must exist and produce an `approved` status row before Accredible is ever called. The safety check in `/api/certify` (re-read status before API call) only works if Phase 5 wrote the status correctly.
- **Integrations last** (ConvertKit/HubSpot in Phase 6): Both adapters exist in the codebase. Wiring course-specific tags is a 30-minute addition per service — correct to defer until the core loop is validated.

### Research Flags

Phases needing implementation research before building:
- **Phase 4 (PDF generation):** `@react-pdf/renderer` in Next.js 14 App Router Route Handlers — verify `serverExternalPackages` config, test locally, and validate that the Route Handler returns a proper binary `Response` before building the full PDF component. MEDIUM confidence on integration pattern.
- **Phase 6 (Accredible):** API endpoint shape and error codes are MEDIUM confidence. Verify `POST /v1/credentials` request/response structure against live docs before building the adapter. Confirm credential group must be pre-created in Accredible dashboard — this is a hard prerequisite.

Phases with standard patterns (skip research):
- **Phase 1:** Content structure mirrors existing `content/assessments/v1/` pattern exactly.
- **Phase 2:** Stripe Checkout Session extension is established in codebase and documented in official Stripe docs.
- **Phase 3:** `useCourseProgress` mirrors `useAssessment` — same sessionStorage + Supabase dual-write pattern already working.
- **Phase 5:** Supabase Storage presigned URL pattern is HIGH confidence from official docs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core packages verified via official docs; Accredible wrapper is the only MEDIUM item |
| Features | HIGH | Feature set derived from PRD + competitive analysis; MVP boundary is clear and well-reasoned |
| Architecture | HIGH | Based on direct codebase inspection; patterns are consistent extensions of existing code |
| Pitfalls | HIGH (Vercel limits), MEDIUM (Accredible) | Vercel limits from official docs; Accredible error handling and rate limits not publicly documented |

**Overall confidence:** HIGH — the course is an additive extension to a well-understood existing stack. The only meaningful uncertainty is Accredible API specifics, which require a live account to fully verify.

### Gaps to Address

- **Accredible credential group pre-creation:** The Accredible dashboard must have an AiBI-P credential group created (badge design, certificate template) before any API call can succeed. `ACCREDIBLE_GROUP_ID` env var is stable once set. This is a non-code prerequisite that blocks Phase 6 — flag it early.
- **Reviewer identity model:** Phase 1 uses `REVIEWER_EMAILS` env var allowlist. Decide before Phase 5 build whether to extend to a `reviewer_roles` Supabase table or keep the env var approach for the first cohort. Either path is fine; ambiguity during build is not.
- **Institution bundle invite flow:** The seat model (decrement `seats_used` on each learner activation) is specified. The invite UI (how does an institution admin activate individual learners?) is not fully designed. Must be resolved before Phase 2 ships institutional checkout.
- **Accredible duplicate credential protection:** Idempotency check — verify `certificates` table for existing `enrollment_id` row before calling Accredible — must be explicitly built. Accredible's API does not handle this.

## Sources

### Primary (HIGH confidence)
- Vercel Functions Limits official docs — 4.5 MB body limit, 250 MB bundle limit confirmed
- Supabase Storage signed URL official docs — presigned upload URL pattern
- Supabase RLS official docs — `(select auth.uid())` performance pattern
- Stripe per-seat pricing official docs — `quantity` on Checkout Session line items
- react-dropzone official docs — file input integration patterns
- react-hook-form official docs — multi-field form validation patterns
- Existing codebase (direct inspection): `useAssessment.ts`, `useExam.ts`, `plausible.ts`, `/api/capture-email/route.ts`

### Secondary (MEDIUM confidence)
- Next.js 14 + react-pdf community article — `serverExternalPackages` config pattern verified
- Accredible API structure — endpoint shape confirmed via community sources and partially accessible official docs; error codes and rate limits not confirmed

### Tertiary (LOW confidence)
- Accredible rate limits — not publicly documented; treat as unknown until a live account is provisioned and tested
- iOS Safari sessionStorage tab-kill behavior — Apple Developer Forums, aligns with known platform behavior

---
*Research completed: 2026-04-15*
*Ready for roadmap: yes*
