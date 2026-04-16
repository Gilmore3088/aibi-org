# Phase 5: Modules 1-5 Activities + Artifacts - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (large feature phase — discuss skipped in autonomous mode)

<domain>
## Phase Boundary

Make the first five modules (Awareness and Understanding pillars) fully interactive. Every activity becomes submittable, three artifacts become downloadable, the M5 classification drill is timed and scored, and the M5 Acceptable Use Card is generated dynamically from learner responses via @react-pdf/renderer. Also wire accessibility requirements (WCAG 2.1 AA) and sales funnel CTAs.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Key constraints:

**Module Activities (replace Phase 2 form shells with real interactive forms):**
- M1 Activity 1.1: Two free-text fields (min 20 chars each), triggers Regulatory Cheatsheet PDF download on submit
- M2 Activity 2.1: Subscription inventory form (7 platforms x 3 radio buttons), routes subsequent content
- M3 Activity 3.1: One free-text field about a discovered feature
- M4 Activity 4.1: One free-text field about feature discovery, Platform Reference Card download on M4 completion
- M5 Activity 5.1: 20-scenario classification drill (Tier 1/2/3), TIMED, score shown after, incorrect answers annotated
- M5 Activity 5.2: Four role-specific questions, triggers dynamic Acceptable Use Card PDF generation

**Artifacts:**
- ARTF-01: Regulatory Cheatsheet — static PDF in public/artifacts/, triggered after Activity 1.1
- ARTF-02: Acceptable Use Card — DYNAMIC PDF via @react-pdf/renderer API route, generated from Activity 5.2 responses
- ARTF-05: Platform Feature Reference Card — static PDF in public/artifacts/, triggered on M4 completion

**Activity submissions write to activity_responses table via save-progress API or new submit-activity API**

**All activities must be keyboard-accessible (A11Y-01), color not sole indicator (A11Y-02), alt text on images (A11Y-03), 4.5:1 contrast (A11Y-04)**

**Sales funnel CTAs (FUNL-01/02/03): tier-routing after assessment already built in Phase 2**

**@react-pdf/renderer needs `serverExternalPackages` in next.config.js**

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- ActivityFormShell.tsx from Phase 2 — currently renders disabled forms, needs to become interactive
- save-progress API route from Phase 4 — handles module completion writes
- contentRouting.ts from Phase 4 — provides platform priority and role spotlight
- Module content files have activity definitions with field types, minLength, etc.

### Established Patterns
- Activity responses go to activity_responses table (Phase 1 schema)
- Server Components for content, Client Components for interactive forms
- Supabase service role client for writes

### Integration Points
- New API route: /api/courses/submit-activity (writes activity responses)
- New API route: /api/courses/generate-pdf (dynamic Acceptable Use Card)
- ActivityFormShell.tsx → real interactive ActivityForm.tsx
- Static PDFs in public/artifacts/
- next.config.js needs serverExternalPackages for @react-pdf/renderer

</code_context>

<specifics>
## Specific Ideas

- The 20-scenario drill (M5 Activity 5.1) needs a timer component, one-at-a-time presentation, and scoring with explanations
- Acceptable Use Card PDF should match brand design: terracotta/parchment, Cormorant serif, AiBI watermark
- Static PDFs (Regulatory Cheatsheet, Platform Reference Card) can be placeholder designs initially — content is what matters

</specifics>

<deferred>
## Deferred Ideas

- A11Y-06 (video captions) — no video content in these modules
- Skill Template Library artifact (ARTF-03) → Phase 6
- My First Skill artifact (ARTF-04) → Phase 6

</deferred>
