# Overnight execution plan — 2026-05-10 night

**Audience:** A fresh-context AI assistant picking this up cold.
**Goal:** Build 4 independent PRs while the operator sleeps. Each is a discrete branch + open PR for morning review. **Do not merge anything.**

---

## TL;DR — what to do tonight

Build, in this order:

1. **`feature/lms-reskin-module-detail`** — LMS reskin PR 2 of 7: the module detail page
2. **`feature/lms-reskin-activity-workspace`** — LMS reskin PR 3 of 7: the activity-running surface inside modules
3. **`feature/foundation-exam-page`** — Build the missing Foundation exam route (separate from the reskin sequence)
4. **`feature/lms-mobile-sidebar`** — Add a mobile drawer for the LMS sidebar (improves the already-shipped PR #52)

Each gets its own branch off `main`, its own PR, its own commit message. Do NOT chain them. If task 2 finds a bug introduced by task 1, fix it as a follow-up commit on task 1's branch before continuing.

**Time budget:** ~10-12 hours of work across the 4 tasks. Tasks 1-3 are independent; task 4 is small.

**Stop conditions:**
- Any task takes more than 2× its estimate → stop, write a status note in `tasks/overnight-status-2026-05-10.md`, move to next task.
- Test failures you can't resolve in 30 minutes → stop, document, move on.
- Any production-affecting action requested → stop, leave a note in the status doc, do not proceed without operator.
- Out of context → stop, write status note.

---

## Context the next agent must know

### The project

"The AI Banking Institute" (AiBI). Next.js 14 App Router, TypeScript strict, Tailwind. Supabase Postgres + Auth. Stripe checkout. Resend email. MailerLite for marketing email. Hosted on Vercel at https://www.aibankinginstitute.com.

The product: a free 12-question AI readiness assessment that converts into:
- A paid 48-question In-Depth Assessment ($99)
- The AiBI-Foundation self-paced course ($295 individual, $199/seat at 10+)
- Future: AiBI-S (Specialist) and AiBI-L (Leader), both currently soft-hidden

Operator: James Gilmore. Not a developer. Communicates intent; relies on you to verify premises and push back on bad ideas.

### Recent state (catch up on this before doing anything)

Read in order:
1. `CLAUDE.md` (project root) — full project intelligence. Critical sections: "Reference Plans", "Architecture", "Brand & Copy Rules", and the entire "Decisions Log" — especially 2026-05-09, 2026-05-11.
2. `tasks/handoff-2026-05-10.md` — end-of-day summary from the prior session
3. `tasks/lms-prototype-reskin.md` — full 7-PR roadmap for the LMS reskin work
4. `tasks/handoff-2026-05-10.html` — operator-facing version of the handoff (don't need to read, just know it exists)

### Hard rules (non-negotiable)

- **NEVER push to `main`.** Push only to feature branches.
- **NEVER merge any PR.** Only open them.
- **NEVER touch the production database** without an explicit caps-prefixed approval prompt to the operator. The operator is asleep, so this means: don't touch the production DB at all tonight.
- **NEVER touch Vercel env vars, Stripe products, Supabase Auth dashboard, MailerLite automations, Resend templates, or any other external service config.** All of those were configured during the prior session and the operator owns them.
- **NEVER delete external resources** (DB rows, Stripe products, Vercel deployments, etc.) without explicit caps approval. Same rule.
- **NEVER write to `.env.local` or any `.env*` file via `sed -i`.** Use awk-to-tmp + mv or just don't touch them.
- **NEVER skip git hooks** (`--no-verify`, `--no-gpg-sign`, etc).
- **NEVER amend commits.** Create new commits instead.
- If you're unsure about scope: write a question to `tasks/overnight-status-2026-05-10.md` and skip the ambiguous part. Do not improvise on the operator's intent.

### Open PRs as of session start

- **#51** `chore/practitioner-to-foundation-rename` — rename remaining brand-references. Awaiting operator merge.
- **#52** `feature/lms-reskin-overview` — LMS reskin PR 1 of 7: course overview + shared library. Awaiting operator merge.

Don't touch either. Your work goes on new branches off `main`.

### Production state

- Deploy is on commit `636fdf6` (PR #50 merge). Healthy.
- Database is empty of users (operator wiped test data earlier today). Constraint widened to accept `'foundation'` singular. Recovery migration `00030_widen_foundation_product_and_backfill_plural.sql` is in git and applied.
- Stripe products are renamed to canonical `AiBI-Foundation` (singular).
- Supabase Auth is configured end-to-end except for ONE known bug in the email templates (see "Known bugs" below). Don't try to fix the Auth bug — it requires the dashboard, which you can't reach.

### Known bugs (do not fix overnight — operator will handle in morning)

- **Supabase Auth email templates hardcode `next=/dashboard`.** All 4 templates (signup, magic link, recovery, email_change) ignore the `emailRedirectTo` query param. Operator has to update them in the dashboard tomorrow. Fix is to change `href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=X&next=/dashboard"` to `href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=X"` for each template. Operator knows about this — it's noted in `tasks/handoff-2026-05-10.md`.
- **`/api/assessment/pdf/warm` 500s on Vercel** (libnss3.so missing). Pre-existing. Don't fix tonight.
- **`SUPABASE_SERVICE_ROLE_KEY` flagged as plaintext-readable** in Vercel. Operator's responsibility.

### Naming conventions

- **AiBI-Foundation** (singular, hyphenated) is the canonical name for the course AND the credential earned.
- **Never write:** AiBI-Practitioner, AiBI Foundations (plural), Banking AI Practitioner, AiBI-P (in user-facing copy).
- **Generic "practitioner" / "practitioners" in body prose is OK** — refers to banking practitioners as a profession, not the brand.
- **`'in-depth-assessment'`** (two hyphens) is the canonical product value for the In-Depth Assessment. Never `'indepth-assessment'`.

### Reference materials

- LMS prototype HTML mock: `public/lms-prototype/` (live at https://www.aibankinginstitute.com/lms-preview)
- LMS prototype source code: `public/lms-prototype/lms/{screens,components,data,app}.jsx`
- Ledger design tokens: `src/styles/tokens-ledger.css` (all `--ledger-*` prefixed)
- Already-built LMS components: `src/components/lms/` (from PR #52, but on branch `feature/lms-reskin-overview`, NOT yet on main)

**Important:** PR #52 has NOT been merged to main yet. The shared LMS components (`CourseShell`, `LMSSidebar`, `LMSTopBar`, `ProgressDot`, `PillarTag`, `LMSButtons`, types, adapters) live on the `feature/lms-reskin-overview` branch.

**For your work:** Branch off `main`. Then cherry-pick the LMS components from `feature/lms-reskin-overview` so your branches also have them. Or rebase the operator's open PR #52 into your new branches as the first commit. Either works.

Recommended approach: each new branch starts with `git checkout -b feature/X feature/lms-reskin-overview` so it inherits PR #52's components automatically. If PR #52 lands on main before your branches get merged, rebase them onto main and the duplicate commits will be auto-skipped.

---

## Task 1 — `feature/lms-reskin-module-detail`

**Estimated time:** 3-4 hours.

### Goal

Re-skin `src/app/courses/foundation/program/[module]/page.tsx` to match the prototype's `ModuleScreen` pattern. This is the page a user lands on when they click a specific module from the course overview.

### Reference

- Prototype source: `public/lms-prototype/lms/screens.jsx` — function `ModuleScreen` (~line 183) and the three layout variants `ModuleSplit`, `ModuleStepped`, `ModuleLongform`.
- Existing page: `src/app/courses/foundation/program/[module]/page.tsx`. Read it first to understand what data it consumes (current module, sections, activities, progress, etc.).
- Existing module data shape: `content/courses/foundation-program/module-{1..12}.ts` and `course-config.ts`.

### Outline

1. Branch off `feature/lms-reskin-overview` so you have the shared LMS library: `git checkout -b feature/lms-reskin-module-detail feature/lms-reskin-overview`.
2. Read the existing `[module]/page.tsx` end-to-end. Note every data field it consumes and every navigation pathway.
3. Read `ModuleScreen` + the three Module* layouts in `screens.jsx`. Decide which prototype layout maps best to the existing page (likely `ModuleSplit` — two-column with sections + activities).
4. Build new components in `src/components/lms/`:
   - `ModuleHeader.tsx` — title + pillar tag + estimated time + progress dot
   - `ModuleSectionList.tsx` — left column with sections (Learn / Practice / Apply / etc.)
   - `ModuleActivityCard.tsx` — right column with the active activity
5. Rewrite `[module]/page.tsx` to use `<CourseShell>` + `<LMSTopBar crumbs={['Education', 'AiBI-Foundation', mod.title]}>` + the new components.
6. Preserve all existing behavior:
   - Enrollment gate (redirect to `/auth/login` if not logged in)
   - Progress tracking (current module logic)
   - Section navigation (within-module routing if it exists)
   - Activity submission paths (`/api/courses/submit-activity` and similar)
7. Run `npx tsc --noEmit`. Fix any type errors.
8. Run `npm run build`. Fix any lint errors.
9. Commit with a detailed message describing what was reskinned and what behavior was preserved.
10. Push the branch: `git push -u origin feature/lms-reskin-module-detail`.
11. Open a PR via `gh pr create --base main --head feature/lms-reskin-module-detail --title "feat(lms): reskin module detail page to match LMS prototype (PR 2 of 7)"`. Title and body should follow the same pattern as PR #52 (`feature/lms-reskin-overview`).

### Definition of done

- New branch pushed to origin with PR open
- `npx tsc --noEmit` clean
- `npm run build` green
- Page renders without errors when running `npm run dev` (don't run dev server overnight — just verify build output)
- All existing module-detail behavior preserved (enrollment gate, progress tracking, activity submission)

### Out of scope for task 1

- The activity workspace itself — that's task 2
- Mobile responsive behavior — task 4
- Cleanup of the existing module-detail's `_components/` folder — PR 7 of the roadmap

---

## Task 2 — `feature/lms-reskin-activity-workspace`

**Estimated time:** 2-3 hours.

### Goal

Re-skin the activity-running surface inside modules. This is where the learner reads the lead, follows steps, picks a model, submits work.

### Reference

- Prototype source: `public/lms-prototype/lms/screens.jsx` — function `ActivityWorkspace` (~line 402) and `FormField` (~line 516).
- Existing components: look in `src/app/courses/foundation/program/_components/` and `src/app/courses/foundation/program/[module]/_components/` for current activity rendering (likely `ActivityForm.tsx`, `ContentSection.tsx`, etc.).

### Outline

1. Branch off task 1's tip: `git checkout -b feature/lms-reskin-activity-workspace feature/lms-reskin-module-detail`.
2. Identify which existing components render activities. Read them.
3. Look at prototype's `ActivityWorkspace`:
   - Header with pillar + module number + activity title
   - Lead paragraph
   - Numbered step list
   - Form fields (`FormField` component — label + textarea/input + multi-line)
   - Model picker at the top right
   - Submit button (`PrimaryButton`)
4. Build new components:
   - `src/components/lms/ActivityWorkspace.tsx`
   - `src/components/lms/FormField.tsx`
   - `src/components/lms/ModelPicker.tsx` (Claude / OpenAI / Gemini selector — currently informational; no actual model call wiring tonight)
5. Wire these into the module-detail page from task 1 (so the activity workspace renders when a user is "inside" a section).
6. Preserve:
   - Activity submission API call
   - Validation
   - Loading + success states
7. Build verification + PR same as task 1.

### Definition of done

- Branch pushed, PR open with title "feat(lms): reskin activity workspace (PR 3 of 7)"
- tsc clean, build green
- Activity submission still works (existing logic intact)
- ModelPicker is purely a display component for now (no Anthropic/OpenAI/Gemini call wiring)

### Out of scope

- Actual model invocation (that's a separate plumbing task)
- Drill-style activities (separate component, defer)
- Branching scenarios (also defer)

---

## Task 3 — `feature/foundation-exam-page`

**Estimated time:** 3-4 hours.

### Goal

Build the missing `src/app/certifications/exam/foundation/page.tsx`. Currently the `src/app/certifications/exam/` directory contains only `_lib/useExam.ts` (a hook) — there is NO page route, so any link to `/certifications/exam/foundation` 404s.

This is a **separate** branch from the LMS reskin sequence. It's a new feature, not a reskin.

### Reference

- Existing hook: `src/app/certifications/exam/_lib/useExam.ts`
- Exam content: `content/exams/foundation-program/questions.ts` and `scoring.ts`
- LMS prototype: there is NO exam screen in the prototype. You'll need to design one matching the Ledger aesthetic. Reference the existing `/assessment/page.tsx` (the 12-question free assessment) for an UX pattern — but apply Ledger styling, not the current Terra/Sage tokens.

### Outline

1. Branch off `feature/lms-reskin-activity-workspace` so you have the shared LMS library: `git checkout -b feature/foundation-exam-page feature/lms-reskin-activity-workspace`.
2. Read `_lib/useExam.ts` to understand the exam state machine.
3. Read `content/exams/foundation-program/questions.ts` for the question shape and count.
4. Read `content/exams/foundation-program/scoring.ts` for how scoring + tier mapping work.
5. Design + build the exam page:
   - `src/app/certifications/exam/foundation/page.tsx` — server component that gates on auth (must be logged in) + enrollment (must have completed Foundation course or be near completion — check `course_enrollments.completed_modules` length)
   - `src/app/certifications/exam/foundation/_components/ExamRunner.tsx` — client component that uses the existing `useExam.ts` hook to step through questions
   - Layout matching the LMS shell aesthetic: `<CourseShell>` (or a simplified `<ExamShell>` if the shell feels wrong), `<LMSTopBar crumbs={['Education', 'AiBI-Foundation', 'Final Exam']}>`
   - One question at a time, with progress bar at top
   - Submit handler that calls a new API route `/api/certifications/exam/submit` (build that route too)
6. Build `/api/certifications/exam/submit/route.ts` if it doesn't exist:
   - POST handler
   - Verify auth
   - Verify enrollment
   - Apply scoring from `content/exams/foundation-program/scoring.ts`
   - Insert into a new table or column for exam results (CHECK SCHEMA FIRST — if no exam table exists, DON'T create a migration overnight; just leave a comment "// TODO: persist to exam_results table once schema is added")
   - Return result JSON
7. Build verification + PR same as task 1. Title: "feat(certifications): build the missing Foundation exam page".

### Definition of done

- Branch pushed, PR open
- tsc clean, build green
- Route `/certifications/exam/foundation` no longer 404s; renders auth-gated exam UI
- Submitting an answer calls the new API; result is returned (even if not persisted)

### Out of scope

- Schema changes for exam result persistence — leave a TODO and a JSDoc note
- Certificate issuance on passing — separate flow
- Email notifications — separate flow

### What to do if you discover the gate logic doesn't make sense

The current pattern (course → exam → certificate) may not have a clear single source of truth in the codebase. If the existing `useExam.ts` hook or scoring file makes assumptions that don't match the live `course_enrollments` schema, document the mismatch in your PR description and use the most defensible interpretation. Don't try to redesign the certification flow overnight.

---

## Task 4 — `feature/lms-mobile-sidebar`

**Estimated time:** 1-2 hours. Smallest task.

### Goal

The `<LMSSidebar/>` from PR #52 is `hidden md:flex` — under 880px it disappears entirely with no replacement. Add a mobile drawer pattern: hamburger button in the top bar opens a slide-in panel.

### Reference

- Existing sidebar: `src/components/lms/LMSSidebar.tsx`
- Existing top bar: `src/components/lms/LMSTopBar.tsx`
- Existing shell: `src/components/lms/CourseShell.tsx`

### Outline

1. Branch off `feature/foundation-exam-page` to inherit all prior work: `git checkout -b feature/lms-mobile-sidebar feature/foundation-exam-page`.
2. Add a hamburger button slot to `LMSTopBar` (only renders on mobile, hidden on desktop).
3. Modify `LMSSidebar` to support a `mobile` mode:
   - Desktop: current sticky 280px sidebar
   - Mobile: slide-in drawer that appears when the hamburger button is clicked
   - Use `'use client'` and React state to control the drawer
   - Add a backdrop overlay
   - Add keyboard accessibility (Esc to close)
4. Modify `CourseShell` to:
   - On desktop: 2-column grid as today
   - On mobile: single column, full-width main content. Sidebar lives off-screen.
5. Build verification + PR same as task 1. Title: "feat(lms): add mobile drawer for sidebar".

### Definition of done

- Branch pushed, PR open
- tsc clean, build green
- Tested manually via build inspection: the `hidden md:flex` no longer hides the entire mobile experience; there's a usable nav
- No regressions to desktop layout

### Out of scope

- Animations beyond a simple slide-in
- Gesture support (swipe to close)
- A separate mobile route — same routes, just different layout

---

## What success looks like in the morning

When the operator wakes up, they should see:

- 4 new PRs on origin (in addition to the open #51 and #52):
  - `feature/lms-reskin-module-detail` → "feat(lms): reskin module detail page (PR 2 of 7)"
  - `feature/lms-reskin-activity-workspace` → "feat(lms): reskin activity workspace (PR 3 of 7)"
  - `feature/foundation-exam-page` → "feat(certifications): build the missing Foundation exam page"
  - `feature/lms-mobile-sidebar` → "feat(lms): add mobile drawer for sidebar"
- All 4 PRs have green Vercel preview builds
- Each PR description includes: summary, scope, test plan, what's out of scope
- A status note at `tasks/overnight-status-2026-05-10.md` documenting:
  - Which tasks completed
  - Which tasks stopped early and why
  - Any decisions made that the operator should review
  - Any gotchas hit (e.g., "Task 3 found that `useExam.ts` expects a `submitExam` callback that isn't defined anywhere; I stubbed it and noted in the PR")

If you finish all 4 tasks early and have time + context budget remaining, you may:
- Continue to LMS reskin PR 4 (Toolbox + saved artifacts) — see `tasks/lms-prototype-reskin.md`
- Improve accessibility on the new components
- Write unit tests for the LMS adapters and helpers
- Do NOT start anything that the roadmap doesn't already specify

If you run out of context or hit blockers on multiple tasks, write what you got done to `tasks/overnight-status-2026-05-10.md` and stop. Partial PRs are fine — clearly mark them as WIP in the title (e.g., "WIP: feat(lms): module detail page reskin").

---

## State references

### Repository
- Path: `~/Projects/TheAiBankingInstitute`
- Default branch: `main`
- Production commit: `636fdf6` (PR #50 merge)

### Worktrees (per `git worktree list`)
- `~/Projects/TheAiBankingInstitute` → `main`
- Various feature worktrees that you don't need to touch

### Branches you'll create
- `feature/lms-reskin-module-detail` (off `feature/lms-reskin-overview`)
- `feature/lms-reskin-activity-workspace` (off `feature/lms-reskin-module-detail`)
- `feature/foundation-exam-page` (off `feature/lms-reskin-activity-workspace`)
- `feature/lms-mobile-sidebar` (off `feature/foundation-exam-page`)

This stacking is intentional — each task builds on the prior one. After PR #52 merges to main, the operator will rebase your branches automatically (or you can rebase them at the start of your morning).

### Existing open PRs (do NOT touch)
- `#51 chore/practitioner-to-foundation-rename`
- `#52 feature/lms-reskin-overview`

### Backup tags
- `backup/stripe-products-pre-rebase-2026-05-11` on origin — preserves PR #44's original work

### Quick reference commands

```bash
# verify state
cd ~/Projects/TheAiBankingInstitute && git status && git log --oneline -3

# branch off PR #52's tip
git checkout -b feature/lms-reskin-module-detail feature/lms-reskin-overview

# verification before commit
npx tsc --noEmit && npm run build

# commit pattern (use HEREDOC for multi-line)
git commit -m "$(cat <<'EOF'
feat(lms): reskin module detail page (PR 2 of 7)

[detail body...]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

# push + PR
git push -u origin feature/lms-reskin-module-detail
gh pr create --base main --head feature/lms-reskin-module-detail --title "..." --body "..."
```

---

## Cross-reference for the next agent

The handoff doc `tasks/handoff-2026-05-10.md` has the full end-of-day context — read it if anything in this plan is unclear. The roadmap `tasks/lms-prototype-reskin.md` has the canonical 7-PR breakdown for the LMS reskin work.

Memory entries that matter:
- `~/.claude/projects/-Users-jgmbp-Projects-TheAiBankingInstitute/memory/MEMORY.md` — index of relevant project memory
- Especially `project_in_depth_assessment_naming.md` — `'in-depth-assessment'` two-hyphen is canonical
- Especially `project_foundation_v2_redesign.md` — AiBI-Foundation is ONE course, not four tracks
- Especially `feedback_no_sed_i_on_env_files.md` — never `sed -i` on .env files
- Especially `feedback_no_overwriting.md` — never overwrite working files; route around them

Good luck. Move steadily, ship small, leave good notes.
