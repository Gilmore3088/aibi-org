# Phase 1: Foundation - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Database schema and content architecture are established so every subsequent phase has somewhere to write data and a canonical place for module content. This phase creates 5 new Supabase tables (extending course_enrollments, plus activity_responses, work_submissions, certificates, institution_enrollments), applies RLS policies with indexed foreign keys, and establishes the `/content/courses/aibi-p/` directory structure matching the existing content versioning pattern.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from PROJECT.md and research:
- Content must live in `/content/courses/aibi-p/` — not hardcoded in .tsx files
- Follow existing `/content/assessments/v1/` pattern for consistency
- RLS policies must wrap `auth.uid()` in SELECT for performance
- All policy columns and foreign keys must be indexed
- Activity responses table must enforce RLS so learners only see their own data
- Course progress will be written to Supabase (not sessionStorage) — schema must support this
- File uploads will use Supabase Storage presigned URLs — work_submissions schema references storage URLs not file bytes

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `/content/assessments/v1/questions.ts` and `scoring.ts` — pattern for content versioning
- `/content/exams/aibi-p/questions.ts` — pattern for typed question banks
- `/content/certifications/v1.ts` — pattern for typed product definitions
- `/src/lib/supabase/client.ts` — existing Supabase client

### Established Patterns
- Content files export typed constants (readonly interfaces)
- Assessment questions use typed question/answer structures
- Supabase client created from `@/lib/supabase`

### Integration Points
- `course_enrollments` table already exists in schema (needs extension)
- Supabase Auth may or may not be configured — verify before Phase 3

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
