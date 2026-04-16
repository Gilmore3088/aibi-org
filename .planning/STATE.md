# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-15)

**Core value:** AiBI-P course completable on mobile in under 5.5 hours, producing 5 tangible artifacts, culminating in an assessed work product that earns the AiBI-P credential.
**Current focus:** Phase 1 — Foundation (DB schema + content architecture)

## Current Position

Phase: 1 of 8 (Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-04-15 — Roadmap created, 135 requirements mapped across 8 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: --
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: --
- Trend: --

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Foundation: Content must live in `/content/courses/aibi-p/` from Phase 1 — not added later
- Foundation: Supabase Auth assumed to exist; if not present, must be added before Phase 3
- Foundation: Third-party integrations (Accredible, ConvertKit, HubSpot, Plausible) deferred to v2
- Foundation: File uploads use Supabase presigned URLs — never route file bytes through Vercel (4.5MB hard limit)
- Foundation: Course progress written to Supabase on every module advance — sessionStorage is read-back cache only

### Pending Todos

None yet.

### Blockers/Concerns

- Accredible credential group must be pre-created in Accredible dashboard before Phase 8 can ship (non-code prerequisite; `ACCREDIBLE_GROUP_ID` env var must be set)
- Reviewer identity model needs decision before Phase 7 build: `REVIEWER_EMAILS` env var allowlist vs. `reviewer_roles` Supabase table
- Institution bundle invite flow (how does an institution admin activate individual learners?) must be resolved before Phase 3 ships

## Session Continuity

Last session: 2026-04-15
Stopped at: Roadmap created — ready to run `/gsd-plan-phase 1`
Resume file: None
