---
phase: 02-course-shell-assessment-upgrade
verified: 2026-04-16T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
deferred:
  - truth: "Learner can leave mid-module and return to exactly where they left off, including mid-activity (resume functionality)"
    addressed_in: "Phase 4"
    evidence: "Phase 4 goal: 'their platform context routes content throughout the course, and progress persists to Supabase so iOS tab kills cannot lose work'. CONTEXT.md explicitly defers 'Module completion tracking in Supabase → Phase 4'."
  - truth: "Course progress is persisted to Supabase on every module completion"
    addressed_in: "Phase 4"
    evidence: "Phase 4 success criterion: 'A learner who closes their iPhone browser mid-module and returns hours later resumes at exactly the question they left — no data lost.' CONTEXT.md defers write path explicitly."
human_verification:
  - test: "Load /courses/aibi-p on iPhone Safari (390px viewport) and verify no horizontal scrolling occurs on any section including the module map and pillar cards."
    expected: "All content fits within viewport; pillar cards stack vertically; module map stacks to 1 column; no horizontal overflow"
    why_human: "Responsive CSS cannot be verified by static analysis — needs real browser rendering at 390px."
  - test: "Navigate to /courses/aibi-p/1 through /courses/aibi-p/9 and verify each module page renders the correct pillar header color: modules 1-2 sage, modules 3-5 cobalt, modules 6-8 amber, module 9 terra."
    expected: "Each module's full-width header band matches its pillar color; no fallback to default/white background."
    why_human: "CSS variable resolution with inline style backgroundColor requires browser rendering to confirm."
  - test: "Verify ContentTable at 390px — module pages with tables (e.g., Module 1 regulatory frameworks table) should scroll horizontally within the table container, not break the page layout."
    expected: "Table scrolls internally; page does not scroll horizontally; font remains readable at minimum 14pt."
    why_human: "Overflow scroll behavior in a constrained viewport requires real device or browser DevTools."
  - test: "Complete the assessment from start to finish: answer all 12 questions, verify 'Question N of 12' counter increments correctly, verify score and tier are visible immediately without entering email."
    expected: "Counter shows Question 1 of 12 through Question 12 of 12; after final answer the score ring and tier label appear without any prompt for email; email gate appears below the CTA buttons."
    why_human: "The 'score visible without email' requirement (ASMT-06) involves interaction flow that must be verified in a running browser."
  - test: "Attempt to access /courses/aibi-p/3 without being logged in. Verify redirect to /courses/aibi-p/purchase."
    expected: "Browser lands at /courses/aibi-p/purchase; no module content is visible; 'Enrollment coming soon' button is present."
    why_human: "Server-side redirect requires Supabase auth integration to be testable end-to-end; also confirms SHELL-12 in a real environment."
---

# Phase 2: Course Shell + Assessment Upgrade — Verification Report

**Phase Goal:** The 9-module course is fully browsable (real content, pillar color banding, activity form shells) and the free assessment serves 12 rotating questions from the expanded pool.
**Verified:** 2026-04-16
**Status:** human_needed
**Re-verification:** No — initial verification.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/courses/aibi-p` shows four-pillar overview with Sage/Cobalt/Amber/Terra banding and all 9 modules | ✓ VERIFIED | `page.tsx` renders `PILLAR_ORDER.map(pillar => <PillarCard colorVar={meta.colorVar}>)` using PILLAR_META with sage/cobalt/amber/terra. `modules.map(mod => <ModuleMapItem>)` renders all 9 from typed array. |
| 2 | Any module page at `/courses/aibi-p/[1-9]` renders real module content with correct pillar header color | ✓ VERIFIED | `[module]/page.tsx` calls `ModuleHeader` with `pillar={mod.pillar}`; ModuleHeader sets `backgroundColor: PILLAR_META[pillar].colorVar`. All 9 module-N.ts files exist with substantive content (148-253 lines each). No placeholder text found in content files. |
| 3 | Non-enrolled visitor attempting module access is redirected to purchase page | ✓ VERIFIED | `[module]/page.tsx` line 53: `if (!enrollment) { redirect('/courses/aibi-p/purchase') }` — server-side before any JSX renders. `purchase/page.tsx` exists with disabled enrollment CTA. |
| 4 | Assessment serves exactly 12 questions, shows "Question N of 12", score and tier visible without email | ✓ VERIFIED | `QUESTIONS_PER_SESSION = 12` in `useAssessmentV2.ts`. `QuestionCard` renders `Question {questionNumber} of {totalQuestions}`. `page.tsx` shows ScoreRing + tier label in `phase === 'score'` block before EmailGate render. |
| 5 | Persistent left sidebar shows modules grouped by pillar; completed=checkmark; current=highlighted; locked=visually distinct | ✓ VERIFIED | `CourseSidebar` renders three distinct visual states: locked (opacity-40, non-interactive div, lock SVG icon), current (parch-dark background, terra text, aria-current="page"), completed (pillar-colored checkmark SVG). Layout reads live enrollment via `getEnrollment()` and passes `completedModules`/`currentModule` to sidebar. |

**Score:** 5/5 truths verified

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Module completion write path to Supabase (SHELL-07) — completed_modules is read but never written in Phase 2 | Phase 4 | Phase 4 SC 3: "A learner who closes their iPhone browser mid-module and returns hours later resumes at exactly the question they left — no data lost." CONTEXT.md: "Module completion tracking in Supabase → Phase 4" |
| 2 | Full resume functionality including mid-activity state (SHELL-06 complete scope) | Phase 4 | Phase 4 goal: "progress persists to Supabase so iOS tab kills cannot lose work." The current implementation reads current_module correctly from DB for sidebar Resume button; the overview page hero CTA is stubbed to module 1. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/courses/aibi-p/layout.tsx` | Server layout with sidebar and enrollment read | ✓ VERIFIED | 54 lines; async; calls `getEnrollment()`; passes real data to CourseSidebar and MobileSidebarDrawer |
| `src/app/courses/aibi-p/page.tsx` | Overview with four pillars and 9-module map | ✓ VERIFIED | 197 lines; renders PILLAR_ORDER map and modules.map(); stubs completedModules/currentModule for hero section (intentional — documented) |
| `src/app/courses/aibi-p/[module]/page.tsx` | Dynamic module page with gating | ✓ VERIFIED | 142 lines; generateStaticParams for 1-9; enrollment check + canAccessModule enforcement; renders ModuleHeader, ContentSection, ContentTable, ActivityFormShell |
| `src/app/courses/aibi-p/_components/CourseSidebar.tsx` | Persistent sidebar with three visual states | ✓ VERIFIED | 185 lines; locked/current/completed states; pillar group headings; resume button at bottom |
| `src/app/courses/aibi-p/_components/ModuleHeader.tsx` | Pillar-colored header band | ✓ VERIFIED | 63 lines; `style={{ backgroundColor: meta.colorVar }}`; Cormorant italic title; DM Mono meta row |
| `src/app/courses/aibi-p/purchase/page.tsx` | Purchase redirect target | ✓ VERIFIED | 116 lines; $79 pricing block; disabled button; 6 feature bullets; back link |
| `src/app/courses/aibi-p/_lib/getEnrollment.ts` | Supabase enrollment lookup | ✓ VERIFIED | 65 lines; getAll/setAll pattern; graceful null fallback; queries course_enrollments by user_id and product='aibi-p' |
| `src/app/courses/aibi-p/_lib/courseProgress.ts` | Pure progress functions | ✓ VERIFIED | 67 lines; canAccessModule, getModuleStatus, getPillarStatus; no external dependencies |
| `content/assessments/v2/questions.ts` | 48-question pool | ✓ VERIFIED | 48 questions confirmed; 6 per dimension across all 8 dimensions (grep count) |
| `content/assessments/v2/scoring.ts` | Tier boundaries 12-48 | ✓ VERIFIED | tiers: Starting Point 12-22, Early Stage 23-32, Building Momentum 33-40, Ready to Scale 41-48; getTierV2; getDimensionScores |
| `content/assessments/v2/rotation.ts` | Fisher-Yates rotation | ✓ VERIFIED | selectQuestions: group by dimension, shuffle, pick 1 per dimension (8), pick 4 remaining, final shuffle; total = 12 |
| `src/app/assessment/_lib/useAssessmentV2.ts` | Assessment v2 hook | ✓ VERIFIED | 165 lines; QUESTIONS_PER_SESSION=12; sessionStorage persistence; forward-only (no back action); score/results phases |
| `src/app/assessment/page.tsx` | Assessment page using v2 | ✓ VERIFIED | Uses useAssessmentV2; QuestionCard passes totalQuestions=QUESTIONS_PER_SESSION; score visible before EmailGate; tier-routing CTAs implemented |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `layout.tsx` | `getEnrollment.ts` | `import + await` | ✓ WIRED | Layout calls `getEnrollment()` and passes result to CourseSidebar/MobileSidebarDrawer |
| `[module]/page.tsx` | `getEnrollment.ts` | `import + await` | ✓ WIRED | Module page calls `getEnrollment()` and redirects to /purchase on null |
| `[module]/page.tsx` | `courseProgress.ts` | `canAccessModule()` | ✓ WIRED | Module page calls `canAccessModule(moduleNum, enrollment.completed_modules)` before rendering |
| `assessment/page.tsx` | `useAssessmentV2` | `import + use` | ✓ WIRED | Page imports `useAssessmentV2` and `QUESTIONS_PER_SESSION`; all state comes from the hook |
| `useAssessmentV2.ts` | `rotation.ts` | `selectQuestions()` | ✓ WIRED | Hook calls `selectQuestions(questionPool)` on mount and on restart |
| `useAssessmentV2.ts` | `scoring.ts` | `getTierV2()` | ✓ WIRED | Hook calls `getTierV2(totalScore)` when `isComplete === true` |
| `page.tsx` (assessment) | `ResultsViewV2` | `getDimensionBreakdown()` | ✓ WIRED | Results phase renders `ResultsViewV2` with `dimensionBreakdown={state.getDimensionBreakdown()}` |
| `CourseSidebar` | `content/courses/aibi-p` | `modules, PILLAR_META` | ✓ WIRED | Sidebar imports from `@content/courses/aibi-p` and renders all 9 modules grouped by pillar |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `CourseSidebar` | `completedModules`, `currentModule` | `getEnrollment()` in layout.tsx → Supabase query | Yes — `SELECT ... WHERE user_id = user.id AND product = 'aibi-p'` returns live DB row | ✓ FLOWING |
| `[module]/page.tsx` | Module content (sections, tables, activities) | typed `module-N.ts` files compiled at build time | Yes — substantive TypeScript content files, not empty | ✓ FLOWING |
| `assessment/page.tsx` | `selectedQuestions` (12 questions) | `selectQuestions(questionPool)` using `questions` from `v2/questions.ts` | Yes — 48-question pool with real content | ✓ FLOWING |
| `page.tsx` (overview) | `completedModules`, `currentModule` for hero CTA | Hardcoded stubs (`STUB_COMPLETED_MODULES = []`, `STUB_CURRENT_MODULE = 1`) | No — overview page hero section not connected to enrollment | ⚠️ HOLLOW — hero CTA always links to module 1; sidebar uses real data |

### Behavioral Spot-Checks

Step 7b: SKIPPED for server-side routes requiring auth (enrollment gating). Assessment and course shell require a running Next.js server and browser environment for end-to-end behavioral verification. Static artifact analysis performed instead.

### Requirements Coverage

| Requirement | Phase 2 Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SHELL-01 | 02-01 | Four-pillar overview at /courses/aibi-p with color coding | ✓ SATISFIED | PillarCard renders with PILLAR_META colorVar; four pillars in PILLAR_ORDER |
| SHELL-02 | 02-01 | 9-module map with numbers, titles, pillar, times, outputs | ✓ SATISFIED | ModuleMapItem renders module.number, module.title, module.estimatedMinutes, module.keyOutput |
| SHELL-03 | 02-01 | Persistent left sidebar grouped by pillar, current highlighted, completed checked | ✓ SATISFIED | CourseSidebar: three visual states verified |
| SHELL-04 | 02-03 | Forward-only progression | ✓ SATISFIED | canAccessModule enforced in [module]/page.tsx server-side |
| SHELL-05 | 02-03 | Server-side enforcement | ✓ SATISFIED | redirect() before JSX renders in [module]/page.tsx |
| SHELL-06 | 02-03 | Resume functionality | PARTIAL — DEFERRED | Sidebar Resume button reads current_module from DB. Overview CTA stub. Mid-activity resume requires write path (Phase 4). |
| SHELL-07 | 02-03 | Progress persisted to Supabase on completion | DEFERRED | Read path exists; write path explicitly deferred to Phase 4 per CONTEXT.md |
| SHELL-08 | 02-01 | Progress indicator 9 steps | ✓ SATISFIED | ProgressIndicator: 9 dots, ARIA progressbar, "N of 9 modules complete" label |
| SHELL-09 | 02-01/02 | Mobile responsive 390px iPhone Safari | ? NEEDS HUMAN | overflow-x-auto on ContentTable, responsive grid classes present; visual verification required |
| SHELL-10 | 02-01/02 | Converts HTML mockups to Next.js | ✓ SATISFIED | Components follow mockup structure; CONTEXT.md cites mockup references |
| SHELL-11 | 02-02 | Module header bands pillar-colored | ✓ SATISFIED | ModuleHeader: `style={{ backgroundColor: meta.colorVar }}` |
| SHELL-12 | 02-03 | Non-enrolled redirect to purchase | ✓ SATISFIED | `if (!enrollment) { redirect('/courses/aibi-p/purchase') }` in [module]/page.tsx |
| ASMT-01 | 02-04 | 12 questions per session from pool of 40-50 | ✓ SATISFIED | 48 questions in pool; QUESTIONS_PER_SESSION=12 |
| ASMT-02 | 02-04 | 1 per dimension + 4 random = 12 | ✓ SATISFIED | selectQuestions: 8 dimension picks + 4 random from remaining = 12 |
| ASMT-03 | 02-04 | 8 dimensions defined | ✓ SATISFIED | All 8 dimensions present with 6 questions each |
| ASMT-04 | 02-04 | Score range 12-48 | ✓ SATISFIED | tiers min=12, max=48; getTierV2 validates range |
| ASMT-05 | 02-04 | Tier boundaries correct | ✓ SATISFIED | Starting Point 12-22, Early Stage 23-32, Building Momentum 33-40, Ready to Scale 41-48 |
| ASMT-06 | 02-04 | Score/tier visible without email gate | ✓ SATISFIED | 'score' phase renders ScoreRing+tier before EmailGate component; comment confirms intent |
| ASMT-07 | 02-04 | Email gates dimension breakdown | ✓ SATISFIED | advanceToResults() called in EmailGate onCaptured callback; ResultsViewV2 only renders after email |
| ASMT-08 | 02-04 | Tier-routing CTAs | ✓ SATISFIED | Starting Point/Early Stage → /courses/aibi-p/purchase; Building Momentum/Ready to Scale → CALENDLY_URL |
| ASMT-09 | 02-04 | No back navigation | ✓ SATISFIED | useAssessmentV2 has no back() action; QuestionCard called without onBack/canGoBack |
| ASMT-10 | 02-04 | "Question N of 12" visible throughout | ✓ SATISFIED | QuestionCard renders `Question {questionNumber} of {totalQuestions}` with totalQuestions=12 |
| ASMT-11 | 02-04 | Content in /content/assessments/v2/ | ✓ SATISFIED | All 5 files present: types.ts, questions.ts, scoring.ts, rotation.ts, index.ts |

**Requirements satisfied:** 21/23 (SHELL-06 partial/deferred, SHELL-07 deferred, SHELL-09 needs human)

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/courses/aibi-p/page.tsx` | 20-22 | `STUB_COMPLETED_MODULES = []`, `STUB_CURRENT_MODULE = 1` — hardcoded stub values | ⚠️ Warning | Overview page hero CTA always links to module 1; module map always shows module 1 as current and all others locked. Sidebar (via layout.tsx) is NOT affected — it reads real enrollment. Documented in SUMMARY-01 as intentional; Plan 02-03 was expected to resolve but only resolved the sidebar, not the page itself. |

**Note on stub classification:** The `ActivityFormShell` submit button is permanently disabled with "Activity submission available when enrolled." This is intentional per CONTEXT.md (activity interactivity deferred to Phase 5-6) and is not a hidden stub — it is explicitly documented design.

### Human Verification Required

#### 1. Mobile Responsiveness at 390px

**Test:** Open /courses/aibi-p on an iPhone Safari at 390px viewport. Scroll through the hero, pillar cards grid, and module map grid. Then open a module page (e.g., /courses/aibi-p/1) and scroll through to the regulatory frameworks table.
**Expected:** No horizontal page scrolling anywhere; pillar cards in 1-column grid; module map in 1-column grid; table scrolls internally within its container; all text readable at minimum 14pt.
**Why human:** CSS responsive breakpoints and overflow behavior require real browser rendering to verify.

#### 2. Pillar Header Color Rendering

**Test:** Visit each module page 1 through 9. Verify header band color: modules 1-2 use sage green (Awareness), modules 3-5 use cobalt blue (Understanding), modules 6-8 use amber/gold (Creation), module 9 uses terra/brick (Application).
**Expected:** Distinct, correctly mapped color on each module header; no white or default backgrounds.
**Why human:** CSS variable resolution in inline `style={{ backgroundColor: meta.colorVar }}` requires browser rendering to confirm.

#### 3. Assessment Score Visibility (ASMT-06)

**Test:** Complete the assessment answering all 12 questions without entering an email address. Verify the score ring, score number, tier label, tier summary, and CTA button all appear before any email prompt.
**Expected:** After answering question 12, the score is immediately visible. The email input appears below the CTA, not above it, and skipping it does not hide the score.
**Why human:** The interaction sequence (question → score reveal → email gate below) must be verified in a running browser.

#### 4. Enrollment Redirect (SHELL-12)

**Test:** Open an incognito window (not logged in). Navigate directly to /courses/aibi-p/3.
**Expected:** Browser redirects to /courses/aibi-p/purchase; module 3 content never renders.
**Why human:** Server-side Supabase auth check requires a running Next.js server with Supabase configured to test the full redirect path.

#### 5. Forward-Only Enforcement (SHELL-04/05)

**Test:** Log in with a new test account that has zero completed modules. Attempt to navigate directly to /courses/aibi-p/5 via URL bar.
**Expected:** Browser redirects to /courses/aibi-p/1 (the current module for a new enrollee).
**Why human:** Requires a real Supabase enrollment row with controlled completed_modules array to test the redirect target.

### Gaps Summary

No blocking gaps found. All 5 success criteria are verified in the codebase. The two deferred items (SHELL-06 full scope, SHELL-07 write path) are explicitly planned for Phase 4 and do not prevent the Phase 2 goal ("fully browsable course shell with assessment serving 12 rotating questions") from being achieved.

The overview page hero CTA stub (`Resume Course` always links to module 1) is a known, documented limitation. The sidebar Resume button uses live enrollment data. For Phase 3/4 this should be resolved by making the overview page read enrollment, but it is not a Phase 2 blocker since the sidebar always shows correct state.

Five behavioral items require human verification in a running browser environment — primarily around mobile rendering, color resolution, and auth integration.

---

_Verified: 2026-04-16_
_Verifier: Claude (gsd-verifier)_
