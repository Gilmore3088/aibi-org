# Phase 4: Onboarding Branch + Progress Tracking - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Wire the 3-question onboarding survey that routes platform-specific content throughout the course, implement Supabase-backed progress persistence (replacing sessionStorage for the course), and enforce forward-only module progression server-side. The onboarding survey appears after enrollment but before Module 1 unlocks.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Key constraints from prior phases:

- Onboarding questions per PRD: (1) Does your institution use M365? (Yes/No/Not sure), (2) Personal AI subscriptions? (Yes, select which / No, just free / None), (3) Primary role? (Lending/Operations/Compliance/Finance/Marketing/IT/Retail/Executive/Other)
- Onboarding answers stored in `course_enrollments.onboarding_answers` (jsonb column, created in Phase 1)
- Module completion stored in `course_enrollments.completed_modules` and `current_module` (created in Phase 1)
- Progress must persist to Supabase on every module advance — sessionStorage is cache only (iOS kills background tabs)
- Forward-only enforced server-side: API verifies all prior modules complete before writing a new completion
- Content routing: M365 users see Copilot activation path in M3, ChatGPT subscribers see ChatGPT content first, role determines feature spotlights
- Onboarding survey UI should match HTML mockup at `aibi_p_refined_onboarding/`
- Learner can update onboarding answers from profile settings at any time
- Resume functionality: redirect to current_module on course access

Phase 2 already created:
- getEnrollment.ts (reads enrollment from Supabase)
- courseProgress.ts (canAccessModule, getModuleStatus logic)
- Layout.tsx reads enrollment and passes to sidebar
- Module page redirects non-enrolled to /purchase, locked modules to current_module

This phase wires the WRITE path (progress updates, onboarding saves) and the onboarding survey page.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getEnrollment.ts` — reads enrollment; needs extension to write onboarding/progress
- `courseProgress.ts` — pure functions for access rules
- `CourseSidebar.tsx` — already shows module states based on completedModules
- `course_enrollments` table has onboarding_answers, completed_modules, current_module columns

### Integration Points
- New page: /courses/aibi-p/onboarding (survey form)
- New API route: /api/courses/save-progress (module completion writes)
- New API route: /api/courses/save-onboarding (onboarding answer writes)
- Layout.tsx needs to check onboarding_completed and redirect if not done
- Module content components need to read onboarding answers for platform routing

</code_context>

<specifics>
## Specific Ideas

- HTML mockup at `aibi_p_refined_onboarding/` shows the survey design
- "Curation of Context" heading with three questions in a stepped form
- Progress bar showing 3 steps

</specifics>

<deferred>
## Deferred Ideas

None — all 5 ONBD requirements are in scope.

</deferred>
