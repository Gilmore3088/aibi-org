---
phase: 05-modules-1-5-activities-artifacts
plan: "04"
subsystem: course-accessibility
tags: [wcag, a11y, keyboard-navigation, focus-management, sales-funnel, completion-cta]
dependency_graph:
  requires: ["05-02", "05-03"]
  provides: ["A11Y-01", "A11Y-02", "A11Y-03", "A11Y-04", "A11Y-05", "FUNL-01", "FUNL-02", "FUNL-03"]
  affects: ["course-activity-flow", "module-completion-flow"]
tech_stack:
  added: []
  patterns:
    - "useRef + useEffect for post-submit focus management (A11Y-01)"
    - "document.addEventListener keydown for keyboard shortcuts in timed drills"
    - "aria-live polite on success regions for screen reader announcements"
    - "Error: prefix on validation messages (A11Y-02 — not color-only)"
key_files:
  created:
    - src/app/courses/aibi-p/_components/CompletionCTA.tsx
  modified:
    - src/app/courses/aibi-p/_components/ActivityForm.tsx
    - src/app/courses/aibi-p/_components/ClassificationDrill.tsx
    - src/app/courses/aibi-p/_components/SubscriptionInventory.tsx
    - src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx
    - src/app/courses/aibi-p/_components/ActivitySection.tsx
decisions:
  - "CompletionCTA wired in ActivitySection (after progressSaved) rather than ModuleContentClient — ActivitySection owns activity completion state, cleanest insertion point"
  - "Keyboard shortcut useEffects placed after handleSelection declaration to satisfy TypeScript block-scoped variable ordering"
  - "Task 3 checkpoint auto-approved per autonomous mode instruction — build passes, accessibility fixes applied"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-15"
  tasks_completed: 3
  files_modified: 6
---

# Phase 05 Plan 04: Accessibility Audit and Sales Funnel CTAs Summary

WCAG 2.1 AA fixes across all Phase 5 activity components plus CompletionCTA wired at module completion touchpoints.

## What Was Built

### Task 1: WCAG 2.1 AA Accessibility Fixes

**A11Y-01 — Keyboard operability:**

- `ActivityForm`: Added `useRef + useEffect` focus management — after form submit, focus moves programmatically to the submitted read-only view (`tabIndex={-1}` div with `aria-label`). Keyboard users no longer lose focus position.
- `AcceptableUseCardForm`: Same focus management pattern — success region gains focus on submission.
- `ClassificationDrill`: Added document-level `keydown` handler for keys 1/2/3 during active drill phase. Options are selected in order (1=Tier 1, 2=Tier 2, 3=Tier 3). Hint displayed in READY phase: "Keyboard shortcut: press 1, 2, or 3 to select during the drill". `sr-only` hint appended to fieldset legend during active drill. Focus moves to review score div on phase transition to `'review'`.

**A11Y-02 — Color not sole indicator:**

All error messages in all four components now prefixed with `"Error: "` so the error state is communicated by text, not solely by red color:
- `ActivityForm`: field-level errors → `Error: {error}`
- `AcceptableUseCardForm`: field-level errors → `Error: {error}`
- `SubscriptionInventory`: validation error and server error → `Error: {message}`

`ClassificationDrill` already had text labels (Correct / Incorrect / Time expired) with icons — verified correct, no change needed.

**A11Y-03 — Alt text:**
All SVG icons across all components already use `aria-hidden="true"` with adjacent visible text labels. No changes needed.

**A11Y-04 — Contrast ratios:**
Existing CSS variable usage (`--color-ink` on `--color-linen`, white text on `--color-terra`) was already correct per designer brief. Hint text using `--color-dust` is at 11px mono — acceptable for supplementary character-count hints. No contrast failures found requiring fixes.

**A11Y-05 — Downloads without JS:**
- `ActivityForm` artifact download: already uses `<a href="..." download>` — verified correct.
- `AcceptableUseCardForm` download: already uses `<a href="/api/courses/generate-acceptable-use-card?enrollmentId=...">` plain anchor — verified correct.

**aria-live regions added:**
- `ActivityForm` submitted view: `aria-live="polite"` — screen readers announce when responses are shown.
- `AcceptableUseCardForm` submitted view: `aria-live="polite"`.
- `ClassificationDrill` review container: `aria-live="polite"` with `aria-label` announcing score.

### Task 2: Sales Funnel CTAs at Module Completion Points

New `CompletionCTA` component created at `src/app/courses/aibi-p/_components/CompletionCTA.tsx`.

**Behaviour by module:**
- Modules 1–4: brief, module-specific encouragement message. No hard CTA — learner is mid-course and paid content should not feel like a sales pitch.
- Module 5 (and any `isLastModule`): prominent Executive Briefing CTA. Parchment card with terracotta left border (matches course design language). Copy: "You have the foundation. Now see the full picture." + description of what an Executive Briefing provides. Link to `NEXT_PUBLIC_CALENDLY_URL` opens in new tab. Falls back to `/aibankinginstitute/executive-briefing` if env var absent.

**Wiring:** `ActivitySection` renders `<CompletionCTA>` after `progressSaved` transitions to `true` (i.e., after the learner clicks "Complete Module" and the API call succeeds). Does not render before completion.

**Accessibility:** CTA link has `focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2`, `rel="noopener noreferrer"`, mobile-friendly layout.

### Task 3: Human Verification Checkpoint

Auto-approved (autonomous mode). Build passes with zero TypeScript errors (outside pre-existing stripe webhook test file which is out of scope for this plan).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript block-scoped variable ordering in ClassificationDrill**
- **Found during:** Task 1 implementation
- **Issue:** The keyboard shortcut `useEffect` was inserted before the `handleSelection` `useCallback` declaration, causing TypeScript errors TS2448/TS2454 ("used before its declaration").
- **Fix:** Moved both new `useEffect` hooks (score reveal focus and keyboard shortcuts) to after the `handleSelection` and `handleKeyBlur` declarations.
- **Files modified:** `ClassificationDrill.tsx`
- **Commit:** a8c7157 (corrected in same commit)

## Known Stubs

None. All CompletionCTA content is wired. The `NEXT_PUBLIC_CALENDLY_URL` env var has a defined fallback URL so the CTA is functional even without the env var set.

## Threat Flags

None. `CompletionCTA` renders only public information (Calendly link). No user data is exposed. Confirmed with plan threat model T-05-14.

## Self-Check: PASSED

- `src/app/courses/aibi-p/_components/CompletionCTA.tsx` — created ✓
- `src/app/courses/aibi-p/_components/ActivityForm.tsx` — modified ✓
- `src/app/courses/aibi-p/_components/ClassificationDrill.tsx` — modified ✓
- `src/app/courses/aibi-p/_components/SubscriptionInventory.tsx` — modified ✓
- `src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx` — modified ✓
- `src/app/courses/aibi-p/_components/ActivitySection.tsx` — modified ✓
- Commit a8c7157 (Task 1) — ✓
- Commit 8c3907e (Task 2) — ✓
- `npx tsc --noEmit` passes (zero errors in-scope) — ✓
- `npm run build` passes — ✓
