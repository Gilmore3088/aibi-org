# Phase 2: Course Shell + Assessment Upgrade - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the browsable 9-module course shell at `/courses/aibi-p` with persistent sidebar navigation, pillar color banding, and real module content rendering. Simultaneously upgrade the free assessment from 8 fixed questions to 12 rotating questions drawn from a pool of 40-50 across 8 dimensions. The course shell must be mobile-first (390px iPhone Safari), forward-only, and redirect non-enrolled visitors to a purchase page.

</domain>

<decisions>
## Implementation Decisions

### Course Shell Layout
- Convert HTML mockups from `content/courses/AiBI-P v1/stitch_ai_banking_institute_course/` directly to Next.js components — mockups are the design source of truth
- Left sidebar is a shared layout component at `/courses/aibi-p/layout.tsx` wrapping all module routes (App Router convention)
- Module pages are Server Components that read typed content from `/content/courses/aibi-p/module-N.ts` and render sections/tables/activities as reusable components
- Locked modules appear greyed out with lock icon in sidebar, not clickable — redirect to current module if URL accessed directly

### Assessment Upgrade Strategy
- Create `/content/assessments/v2/` with new question pool (40-50 questions tagged by 8 dimensions), keep v1 intact
- Question pool lives in `/content/assessments/v2/questions.ts` — TypeScript, same pattern as v1
- New scoring in v2 with tier boundaries for 12-48 range (Starting Point 12-22, Early Stage 23-32, Building Momentum 33-40, Ready to Scale 41-48)
- Rotation: Fisher-Yates shuffle within each dimension bucket, pick 1 per 8 dimensions, then 4 random from remaining pool

### Mobile + Accessibility
- Sidebar collapses to hamburger menu on mobile — slide-out drawer triggered by icon in header
- Pillar color banding uses full-width header bars matching HTML mockups (colored bar with Cormorant heading)
- Add `--color-amber` CSS variable to globals.css for the Creation pillar (currently no amber token exists)

### Claude's Discretion
- Component file organization within `/src/app/courses/aibi-p/`
- Exact animation/transition for sidebar drawer on mobile
- Activity form shell components (interactive logic deferred to Phase 5-6, but forms should render)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAssessment.ts` — sessionStorage persistence pattern, phase state machine (questions/score/results)
- `useExam.ts` — forward-only question progression, random selection from pool
- `Header.tsx`, `Footer.tsx` — site-wide layout components
- `/content/courses/aibi-p/` — typed module content files (created in Phase 1)
- `/src/types/course.ts` — TypeScript types for course data
- `globals.css` — existing CSS variables for colors (sage, cobalt, terra, parch, linen, ink)

### Established Patterns
- Content versioning in `/content/` folder with typed exports
- `@content/` path alias for imports
- Readonly interfaces throughout
- Server Components by default, `'use client'` only for interactivity

### Integration Points
- New route: `/courses/aibi-p` (overview) + `/courses/aibi-p/[module]` (dynamic module pages)
- Assessment page at `/assessment` needs update to use v2 content
- Header may need course-specific nav items when on course pages
- `globals.css` needs `--color-amber` variable added

</code_context>

<specifics>
## Specific Ideas

- HTML mockup at `aibi_p_refined_course_overview/` shows: top nav bar, left sidebar with pillar groups, main content area with pillar cards grid and module map list
- HTML mockup at `m7_refined_skill_builder/` shows the sidebar pattern most clearly — "The Digital Curator" branding, pillar sections with module links, resume button
- Assessment score should be visible WITHOUT email gate per PRD Section 3.3 CRITICAL note
- Tier routing after assessment: Starting Point/Early Stage → AiBI-P $79 CTA; Building Momentum/Ready to Scale → Executive Briefing CTA

</specifics>

<deferred>
## Deferred Ideas

- Activity interactivity (form submissions, drills, builders) → Phase 5-6
- Stripe checkout/enrollment gating → Phase 3
- Onboarding branch survey → Phase 4
- Module completion tracking in Supabase → Phase 4

</deferred>

---

*Phase: 02-course-shell-assessment-upgrade*
*Context gathered: 2026-04-16 via smart discuss*
