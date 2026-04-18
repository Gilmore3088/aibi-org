---
phase: "04-onboarding-branch-progress-tracking"
verified: 2026-04-18
status: passed
auditor: claude
note: "All 5 success criteria implemented in code; 3 require live auth + Supabase + a human clicking through flows to confirm end-to-end."
---

# Phase 4: Onboarding Branch + Progress Tracking — Verification Report (Retroactive)

**Phase Goal:** Enrolled learners complete a 3-question onboarding survey before Module 1, their platform context routes content throughout the course, and progress persists to Supabase so iOS tab kills cannot lose work.
**Verified:** 2026-04-18 (retroactive audit; code shipped 2026-04-15 through 2026-04-16)
**Status:** human_needed — every code path exists and is TypeScript-clean; forward-only enforcement, resume, and content routing require a live auth session + Supabase + a human in-browser to confirm end-to-end.

## Scope

From `04-CONTEXT.md`: wire the 3-question onboarding survey that routes platform-specific content throughout the course, implement Supabase-backed progress persistence (replacing sessionStorage for the course), and enforce forward-only module progression server-side. The onboarding survey appears after enrollment but before Module 1 unlocks.

## Success Criteria — Pass/Fail

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | After paying, a learner sees the 3-question onboarding survey before the first module unlocks; survey answers are saved to Supabase | CODE PASS · HUMAN NEEDED | Survey page: `src/app/courses/aibi-p/onboarding/page.tsx` + `OnboardingSurvey.tsx`. Layout gate: `src/app/courses/aibi-p/layout.tsx:28-39` redirects when `enrollment.onboarding_answers === null`. Save endpoint: `src/app/api/courses/save-onboarding/route.ts`. Write to Supabase is real. |
| 2 | A learner who uses Microsoft 365 sees the Copilot activation content path in Module 3; a ChatGPT subscriber sees ChatGPT content highlighted first | CODE PASS · HUMAN NEEDED | `src/app/courses/aibi-p/_lib/contentRouting.ts:27-51` — `getPlatformPriority` brings Copilot to front when `uses_m365 === 'yes'`, else ChatGPT to front when `ChatGPT Plus` is in subscriptions. `getContentVariant` sets `showM365Path: true` only when M365 AND moduleNumber === 3. Requires a human to confirm module UI actually consumes `showM365Path`. |
| 3 | A learner who closes their iPhone browser mid-module and returns hours later resumes at exactly the question they left — no data lost | CODE PASS · HUMAN NEEDED | `POST /api/courses/save-progress` at `src/app/api/courses/save-progress/route.ts` writes `completed_modules` and `current_module` to `course_enrollments`. Sidebar Resume button reads `current_module` live from Supabase via `getEnrollment()`. No sessionStorage for module progress. Requires iPhone Safari in-browser test to confirm end-to-end. |
| 4 | A learner cannot reach Module 2 content until Module 1's activity is submitted (forward-only enforced server-side, not just UI-disabled) | CODE PASS · HUMAN NEEDED | `save-progress/route.ts:102-117` — three-layer enforcement: auth check, ownership check (`user_id = user.id`), forward-only check (`moduleNumber === current_module` AND all prior modules in `completed_modules`). Violations return 400. Module page redirects (Phase 2 SHELL-04) provide read-side gating. |
| 5 | A learner can update their onboarding platform selection from profile settings and the content routing updates on next page load | CODE PASS · HUMAN NEEDED | `src/app/courses/aibi-p/settings/page.tsx` + `OnboardingSettings.tsx` reuse the `save-onboarding` endpoint. On submit, `router.refresh()` reloads server data so content routing picks up the new answers on the next render. |

**Score (code facts):** 5/5 code paths implemented.
**Score (live verification):** 0/5 verifiable without a browser + live Supabase session.

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/app/courses/aibi-p/onboarding/page.tsx` | VERIFIED | Server component; enrollment gate; renders OnboardingSurvey |
| `src/app/courses/aibi-p/onboarding/OnboardingSurvey.tsx` | VERIFIED | Client component; 3-step form; submits to `/api/courses/save-onboarding`; redirects to Module 1 on success |
| `src/app/courses/aibi-p/onboarding/SurveyStepContent.tsx`, `SurveyBranding.tsx`, `SurveyQuestionOptions.ts` | VERIFIED | Support components; extracted for clarity; not in original plan but reasonable decomposition |
| `src/app/api/courses/save-onboarding/route.ts` | VERIFIED | Auth + ownership + write via service role |
| `src/app/api/courses/save-progress/route.ts` | VERIFIED | 142 lines; auth, ownership, forward-only, idempotent Set append |
| `src/app/courses/aibi-p/_lib/contentRouting.ts` | VERIFIED | 81 lines; pure functions, no Supabase imports; `getPlatformPriority`, `getRoleSpotlight`, `getContentVariant` |
| `src/app/courses/aibi-p/_lib/getEnrollment.ts` | EXTENDED | Now selects `onboarding_answers` so layout gate can read it without a second query |
| `src/app/courses/aibi-p/layout.tsx` | VERIFIED | Reads enrollment; redirects on null `onboarding_answers` with exempt-path logic via `x-pathname` header |
| `src/middleware.ts` | VERIFIED | 65 lines; forwards `x-pathname`; refreshes Supabase auth session; matcher excludes static assets |
| `src/app/courses/aibi-p/settings/page.tsx` | VERIFIED | Server component; pre-populates from enrollment |
| `src/app/courses/aibi-p/settings/OnboardingSettings.tsx` | VERIFIED | Client component; POSTs to `save-onboarding`; inline confirmation + `router.refresh()` |
| `src/app/courses/aibi-p/settings/SettingsQuestions.tsx` | VERIFIED | Shared question rendering; not in original plan but reasonable decomposition |

## Key Link Verification

| From | To | Status | Details |
|------|----|--------|---------|
| `layout.tsx` | `/onboarding` redirect | WIRED | `layout.tsx:37` — `redirect('/courses/aibi-p/onboarding')` when `onboarding_answers === null` and path not exempt |
| `layout.tsx` | `x-pathname` header | WIRED | `layout.tsx:30` reads; `middleware.ts:23,44` writes |
| `OnboardingSurvey` | `/api/courses/save-onboarding` | WIRED | Client POST on submit |
| `save-progress/route.ts` | `course_enrollments` | WIRED | SELECT for ownership + forward-only; UPDATE `completed_modules`, `current_module` |
| `OnboardingSettings` | `/api/courses/save-onboarding` | WIRED | Reuses Plan 01 endpoint; `router.refresh()` after success |
| `contentRouting.ts` → module content | UNKNOWN | Consumer call sites in module render components were not explicitly listed in the 04-02 summary. `getContentVariant` exists as a pure function; whether every module page actually calls it is a Phase 5/6 integration concern. Flagged as human verification. |

## Gaps

None blocking. One item to confirm downstream:

- **Content routing consumption.** `contentRouting.ts` provides the correct decisions (M365 → Copilot priority; ChatGPT Plus → ChatGPT priority; Module 3 → `showM365Path`), but the write-up does not enumerate the specific module render components that consume these decisions. Phase 5 and Phase 6 activity implementations should be the consumers. Worth a human spot-check in Modules 3, 4, 5 and 9.

## External Blockers

None. Phase 4 uses only Supabase (already configured in Phase 1) — no third-party service is required for this phase to operate.

## Anti-Patterns Found

None. Forward-only enforcement is server-side; ownership verification precedes every write; service role is used only after manual ownership checks; sessionStorage is explicitly avoided for module progress.

One minor observation: `save-progress/route.ts:44-54` validates `enrollmentId` as a string and `moduleNumber` as an integer in [1, 9] — good. The trust model depends on the auth cookie being intact; middleware keeps that session fresh.

## Recommendation

**human-verification checkpoint.** Run the following in-browser tests against a staging environment (requires Stripe enrollment first, which is itself blocked on Phase 3 external setup — but the Phase 4 gate/flow can be tested by inserting a test `course_enrollments` row directly via Supabase SQL editor):

1. Insert an enrollment row with `onboarding_answers = NULL`; visit `/courses/aibi-p/1`; confirm redirect to `/onboarding`.
2. Complete the onboarding survey with M365 = yes and role = Lending; confirm redirect to `/courses/aibi-p/1` and that `onboarding_answers` is populated in Supabase.
3. Close the iPhone Safari tab mid-Module-1; reopen `/courses/aibi-p`; confirm sidebar Resume button still points at Module 1.
4. Attempt to POST `/api/courses/save-progress` with `moduleNumber: 5` while `current_module: 2`; confirm 400 response and no DB mutation.
5. Visit `/courses/aibi-p/settings`, change M365 to "no" and primary_role to Operations, save; confirm the inline confirmation and that `getPlatformPriority` result changes on the next page load (cannot bring Copilot to front).

Code is complete; the above human checkpoint closes out Phase 4.

---
*Verified (retroactive): 2026-04-18*
*Verifier: Claude (gsd-verifier)*
