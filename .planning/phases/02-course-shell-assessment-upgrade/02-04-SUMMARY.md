---
phase: 02-course-shell-assessment-upgrade
plan: "04"
subsystem: assessment
tags: [assessment, v2, question-pool, rotation, scoring, hooks]
dependency_graph:
  requires: []
  provides:
    - content/assessments/v2 question pool (48 questions, 8 dimensions)
    - Fisher-Yates rotation (1-per-dimension + 4 random = 12 per session)
    - v2 scoring with 12-48 tier boundaries
    - useAssessmentV2 hook with sessionStorage persistence
    - assessment page serving 12 rotating questions without email gate on score
  affects:
    - src/app/assessment/page.tsx (upgraded to v2)
    - src/app/assessment/_components/QuestionCard.tsx (back nav made optional)
tech_stack:
  added: []
  patterns:
    - Fisher-Yates shuffle in rotation.ts (same pattern as useExam.ts)
    - Dimension-typed question pool (Dimension union type)
    - Two-phase score reveal: score visible immediately, email gates breakdown only
key_files:
  created:
    - content/assessments/v2/types.ts
    - content/assessments/v2/questions.ts
    - content/assessments/v2/scoring.ts
    - content/assessments/v2/rotation.ts
    - content/assessments/v2/index.ts
    - src/app/assessment/_lib/useAssessmentV2.ts
    - src/app/assessment/_components/ResultsViewV2.tsx
  modified:
    - src/app/assessment/page.tsx
    - src/app/assessment/_components/QuestionCard.tsx
decisions:
  - ASMT-06 implemented as written: score and tier visible immediately without email gate, reversing the v1 email-gate decision (documented in CLAUDE.md decisions log 2026-04-15). The v2 upgrade explicitly supersedes the v1 decision.
  - QuestionCard onBack/canGoBack made optional rather than removed — preserves v1 backward compatibility while enabling v2 no-back-nav behavior.
  - ResultsViewV2 created as separate component (not modifying ResultsView) to keep v1 results untouched per ASMT-11.
  - Dimension breakdown bars scaled to filledBars = round(score/maxScore * 4) so partial representation (1 question per dimension = max 4 pts) renders correctly.
metrics:
  duration: ~35 minutes
  completed: 2026-04-16
  tasks_completed: 2
  files_created: 7
  files_modified: 2
---

# Phase 2 Plan 04: Assessment v2 Upgrade Summary

**One-liner:** 48-question rotating pool across 8 dimensions with Fisher-Yates selection (1 per dimension + 4 random = 12 per session), score visible immediately without email gate, tier-routing CTAs on results.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | v2 question pool, scoring, rotation | a264633 | content/assessments/v2/{types,questions,scoring,rotation,index}.ts |
| 2 | v2 hook and assessment page upgrade | f28167a | useAssessmentV2.ts, ResultsViewV2.tsx, page.tsx, QuestionCard.tsx |

## What Was Built

### Task 1: Content Layer

**`content/assessments/v2/types.ts`**
- `Dimension` union type (8 values)
- `DIMENSION_LABELS` record mapping dimension keys to display names
- `AssessmentQuestion` with `dimension: Dimension` (typed, not `string`)
- `AssessmentOption` unchanged from v1 pattern

**`content/assessments/v2/questions.ts`**
- 48 real assessment questions, 6 per dimension
- All content relevant to community banking AI readiness
- Covers: current AI tool use, governance, literacy, quick win identification, leadership commitment, security posture, training capacity, builder culture

**`content/assessments/v2/scoring.ts`**
- Tier boundaries: Starting Point 12-22, Early Stage 23-32, Building Momentum 33-40, Ready to Scale 41-48
- `getTierV2(totalScore)` — same pattern as v1 `getTier` but for 12-48 range
- `getDimensionScores(answers, sessionQuestions)` — returns per-dimension score and maxScore for email-gated breakdown

**`content/assessments/v2/rotation.ts`**
- `selectQuestions(pool)` — Fisher-Yates selection
  1. Group by dimension
  2. Shuffle within each bucket, pick 1 per dimension (8 questions)
  3. Shuffle remaining pool, pick 4 (total: 12)
  4. Final shuffle for presentation order

**`content/assessments/v2/index.ts`**
- Barrel export for all v2 types, questions, scoring, and rotation

### Task 2: Application Layer

**`useAssessmentV2.ts`**
- Selects 12 questions on mount via `selectQuestions(pool)`
- Persists `selectedQuestionIds` + `answers` + `currentQuestion` to `sessionStorage` key `aibi-assessment-v2`
- Restores from sessionStorage on reload; rebuilds question objects from IDs using pool map
- No `back()` action — forward-only per ASMT-09
- Transitions to `'score'` phase after answer 12, `'results'` phase after email capture
- `getDimensionBreakdown()` exposes dimension scores for the ResultsViewV2

**`QuestionCard.tsx`**
- `onBack` and `canGoBack` props made optional
- Back button only renders when `canGoBack === true && onBack` is provided
- Backward compatible — v1 page still passes both props

**`page.tsx`** (upgraded)
- Uses `useAssessmentV2` and `QUESTIONS_PER_SESSION = 12`
- Score phase: ScoreRing + tier label + summary visible immediately (ASMT-06)
- Tier CTAs: Starting Point/Early Stage → AiBI-P $79 at `/courses/aibi-p/purchase`; Building Momentum/Ready to Scale → Executive Briefing via `NEXT_PUBLIC_CALENDLY_URL` (ASMT-08)
- EmailGate below CTAs — only gates dimension breakdown (ASMT-07)
- No `canGoBack` or `onBack` passed to QuestionCard (ASMT-09)

**`ResultsViewV2.tsx`**
- Full results after email capture
- ScoreRing with 12-48 range
- Dimension breakdown using `DIMENSION_LABELS` and `getDimensionScores` output
- Score interpretation copy updated to reference `/48`
- NextStepCards, NewsletterCTA, PrintButton all reused from v1 components

## Deviations from Plan

None — plan executed exactly as written.

The ASMT-06 score visibility reversal (v1 email-gated score → v2 score visible immediately) was explicitly specified in the plan and implemented as directed. This is a documented v2 behavior change, not a deviation from this plan.

## Known Stubs

- `/courses/aibi-p/purchase` — linked from the Starting Point/Early Stage CTA. The purchase route does not yet exist (Phase 3 scope). The link will 404 until Phase 3 Stripe checkout is built. This is intentional deferral per PROJECT.md.
- `NEXT_PUBLIC_CALENDLY_URL` — falls back to `'#'` if env var not set. Calendly integration is deferred per CLAUDE.md decisions log.

## Threat Flags

None — all surfaces existed before this plan. Score computation remains client-side (accepted risk T-02-09). No new API endpoints introduced.

## Self-Check: PASSED

- content/assessments/v2/types.ts — FOUND
- content/assessments/v2/questions.ts — FOUND
- content/assessments/v2/scoring.ts — FOUND
- content/assessments/v2/rotation.ts — FOUND
- content/assessments/v2/index.ts — FOUND
- src/app/assessment/_lib/useAssessmentV2.ts — FOUND
- src/app/assessment/_components/ResultsViewV2.tsx — FOUND
- Commit a264633 — FOUND (feat(02-04): create v2 assessment question pool...)
- Commit f28167a — FOUND (feat(02-04): upgrade assessment page to v2 hook...)
- `npx tsc --noEmit` — PASSED (0 errors)
- `npm run build` — PASSED (all routes compiled cleanly)
