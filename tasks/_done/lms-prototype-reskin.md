# LMS Prototype reskin — multi-PR roadmap

**Goal:** Re-skin all `/courses/foundation/program/*` routes to match the LMS prototype design from the 2026-05-09 Ledger handoff bundle.

**Reference design:**
- Live at https://www.aibankinginstitute.com/lms-preview (iframes `public/lms-prototype/`)
- Source: `public/lms-prototype/lms/{screens,components,data,app}.jsx`
- Bundle export: `/tmp/lms-bundle/ai-banking-institute/` (from Claude Design)

**Design system (extracted from the prototype):**
- Tokens: `--linen #ECE9DF`, `--paper #F4F1E7`, `--parch #E4E0D2`, `--ink #0E1B2D`, `--slate #5C6B82`, `--terra/accent #B5862A` (gold), `--sage/accent-2 #1E3A5F` (navy), `--rule #D5D1C2`
- Fonts: Newsreader serif (display), Geist sans (body), JetBrains Mono (labels/numbers)
- 280px sidebar with brand lockup + nav + pillars + modules + learner card footer
- Sticky `<TopBar>` with uppercase mono breadcrumbs + right slot
- Ink buttons with gold-on-hover, ghost-bordered secondary buttons

## PR boundaries

### PR 1 — Shared shell + course overview (this branch)
**Scope:** Build the shared Ledger LMS layout primitives and reskin only the course overview page.

- `src/components/lms/CourseShell.tsx` — layout wrapper with sidebar + top bar slot
- `src/components/lms/LMSSidebar.tsx` — 280px sidebar with brand lockup, nav, pillars + modules, learner footer
- `src/components/lms/LMSTopBar.tsx` — sticky breadcrumb bar
- `src/components/lms/ProgressDot.tsx`, `PillarTag.tsx`
- `src/components/lms/{PrimaryButton,GhostButton}.tsx` — ink/gold uppercase buttons
- `src/styles/tokens-ledger-lms.css` — LMS-only token additions if needed
- `src/app/courses/foundation/program/page.tsx` — reskinned overview matching `OverviewScreen` from the prototype

**Verification:** `npx tsc --noEmit` clean, `npm run build` green, visual preview on Vercel preview deploy.

### PR 2 — Module detail page
**Scope:** Reskin `src/app/courses/foundation/program/[module]/page.tsx` to match `ModuleScreen` + `ModuleSplit`/`ModuleStepped`/`ModuleLongform` patterns from the prototype.

Touches:
- The module detail route
- `src/components/lms/ActivityCard.tsx` — activity workspace card with model picker
- `src/components/lms/ModelPicker.tsx` — Claude / OpenAI / Gemini selector
- `src/app/courses/foundation/program/_components/*` — existing module-internal components rewritten

### PR 3 — Activity workspace
**Scope:** Reskin the activity-running surface inside modules.

- `src/components/lms/ActivityWorkspace.tsx` matching `ActivityWorkspace` from prototype
- `src/components/lms/FormField.tsx` for activity inputs
- Any module routes that render activities inline

### PR 4 — Toolbox + saved artifacts
**Scope:** Reskin `src/app/courses/foundation/program/toolkit/`, `prompt-library/`, `artifacts/[artifactId]/`, `gallery/` to match `ToolboxScreen` + `ArtifactsTable` from prototype.

### PR 5 — Completion / certificate
**Scope:** Reskin `src/app/courses/foundation/program/certificate/page.tsx` to match `CompleteScreen` from prototype.

Also covers post-assessment, certificate download, transformation report.

### PR 6 — Auxiliary surfaces
**Scope:** Onboarding (`/onboarding`), settings (`/settings`), quick-wins (`/quick-wins`), tool-guides (`/tool-guides`), purchase (`/purchase`), purchased confirmation (`/purchased`), submit (`/submit`), post-assessment (`/post-assessment`).

These don't have direct analogs in the prototype but should adopt the same shell + tokens.

### PR 7 — Cleanup
**Scope:** Remove the old Ledger course components in `src/app/courses/foundation/program/_components/` that are no longer referenced after PRs 2–6. Remove `/lms-preview` route (it iframes the demo; once real pages match, the preview is redundant). Or keep `/lms-preview` permanently as a design reference page; decide at PR 7 time.

## Out of scope

- The Foundation EXAM page (`src/app/certifications/exam/foundation/`) — currently has only `_lib/useExam.ts`, no route. Separate work; tracked as a new gap.
- Course data shape changes — the prototype's `LMS_DATA` is a flat structure (PILLARS, MODULES with `pillar/title/mins/output/goal`). The real content in `content/courses/foundation-program/` has richer structure. The reskin should accept whatever data shape exists and just present it Ledger-style; don't reshape the data.
- Mobile-specific layouts — the prototype hides the sidebar under 880px and shows a stub. Production needs a proper mobile drawer; can be done per-PR or in a dedicated mobile PR after PR 6.

## Naming consistency

While reskinning, use `AiBI-Foundation` (singular, hyphenated) per the 2026-05-11 canonical decision. PR #51 (the Practitioner→Foundation rename) is open and applies the same rule across the rest of the site; reskinned routes should be consistent.

## State at start of work

- Branch: `feature/lms-reskin-overview`
- Off `main` at the post-#50 commit (HubSpot/Plausible/Reviewer cleanup landed)
- PR #51 (Practitioner rename) is **open and not merged** — be aware that the rest of the site still says "Practitioner"; the reskinned overview is the first surface to commit to AiBI-Foundation naming.
