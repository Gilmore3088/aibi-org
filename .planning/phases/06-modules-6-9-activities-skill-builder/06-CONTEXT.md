# Phase 6: Modules 6-9 Activities + Skill Builder - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Make the Creation and Application pillar modules (M6-M9) fully interactive. The centerpiece is the skill builder (M7) — a 5-component form (Role, Context, Task, Format, Constraint) that produces a downloadable .md file. Also: M6 three-skill diagnosis activity, M8 iteration protocol, M9 automation identification framework and capstone submission. Two artifacts: Skill Template Library (M6 completion) and My First Skill (M7 activity).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Key constraints from PRD:

**M6 Activities:**
- Activity 6.1: Three-Skill Diagnosis — evaluate three example skills (poor, mediocre, strong), identify weakest component and fix
- M6 completion triggers Skill Template Library artifact (PDF + five .md starter files)

**M7 Skill Builder (star feature):**
- 5 labeled fields: Role, Context, Task, Format, Constraint
- Role-specific placeholder examples based on onboarding role selection
- Five role-specific skill starters available
- Activity 7.1: Complete all 5 fields to create first skill
- On completion: downloadable .md file named [Role]-[Task]-Skill-v1.md
- Skill accessible for re-download from profile at any time (My First Skill artifact ARTF-04)
- The one-change iteration rule introduced here

**M8 Activities:**
- Activity 8.1: Run M7 skill 3 more times with different inputs, apply one-change rule, save final as .md, write 3 sentences about changes

**M9 Activities:**
- Presents Automation Identification Framework (3 screening questions)
- Role-specific automation examples (3 tiers per role from PRD)
- Quality Standard reinforcement
- M9 completion unlocks work product submission (Phase 7)

**HTML mockup at m7_refined_skill_builder/ shows the builder UI — two-column layout with RTFC framework explanation on left, form on right**

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- ActivityForm.tsx + ActivitySection.tsx from Phase 5 — generic activity handling
- submit-activity API — writes responses to activity_responses table
- contentRouting.ts — getRoleSpotlight() for role-specific placeholders
- Module content files (module-6 through module-9) have activity definitions

### Integration Points
- ActivitySection.tsx needs new component routing for skill builder and skill diagnosis
- New component: SkillBuilder.tsx (5-field form with .md export)
- New component: SkillDiagnosis.tsx (3-skill evaluation)
- New component: IterationTracker.tsx (M8 iteration protocol)
- Skill Template Library: static PDF + .md files in public/artifacts/
- My First Skill: dynamic .md generation from skill builder responses

</code_context>

<specifics>
## Specific Ideas

- Skill builder HTML mockup shows RTFC framework (Role, Task, Format, Constraint) — PRD uses 5 components (Role, Context, Task, Format, Constraint). Use the PRD's 5-component version.
- .md file download uses browser Blob URL — zero dependencies needed
- Skill starters should be real banking examples per the PRD

</specifics>

<deferred>
## Deferred Ideas

- Work product submission form → Phase 7
- Reviewer queue → Phase 7

</deferred>
