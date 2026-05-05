# Assessment Results — Spec 4: Return-to URL (Working Artifact)

**Date:** 2026-05-04
**Status:** Draft (awaiting user review)
**Owner:** James Gilmore
**Parent:** `docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md`
**Position:** Surface 4 of 4. Ships last. Foundation for future peer-benchmarking unlock (Phase 1.5+).

---

## Job

A stable, owner-bound URL the user can return to days/weeks later to see the same brief they originally completed. Optimized for **working artifact** + **peer-benchmarking foundation**: bookmarkable, durable, RLS-protected, source-of-truth-shifted from session state to database.

Audience: the same authenticated user, returning later. Forwarding the URL does nothing — Spec 4 is private, not shareable. (PDF, owned by Spec 2, is the artifact for sharing.)

## Locked Decisions (from Brainstorm)

| Decision | Choice | Rationale / Tradeoff |
|---|---|---|
| Access | Owner-only — must be signed in as the assessment-taker | Mirrors Spec 2's auth model. Strongest privacy. Forwarding does nothing — forwardees hit the auth wall. PDF (Spec 2) carries any sharing/advocacy job. |
| URL shape | `/results/{assessmentResponseId}` — UUID from existing schema | No new ID space. Existing `assessment_responses.id` is already a UUID. No share tokens, no opaque slugs. |
| History view | None — per-row URLs only, no `/dashboard` aggregation | Smallest Spec 4. Per "working artifact" job: the URL is for returning to a *specific* brief, not for longitudinal tracking. Phase 1.5+ may add `/dashboard` if user feedback demands it. |
| Source-of-truth | Database (`assessment_responses` row) — not session state | Required for return-trips. Spec 4's main engineering body is migrating ResultsViewV2 to props-only and shifting the loading layer into a server component. |
| Retake handling | Each retake = separate row = separate URL. Old URLs remain valid as historical snapshots. | Predictable, simple. No "which is current?" UI. |

## Detail-Level Defaults (overridable)

- **Auth model**: Spec 2's Supabase Auth signup is the existing path. Spec 4 reuses it — `auth.uid() = assessment_responses.user_id` is already enforced by Spec 2's RLS. Spec 4 adds no new auth surface.
- **Retention**: Rows kept forever. No auto-deletion of `assessment_responses`. (PDFs at Spec 2's 30-day retention are rebuilt on demand if a returning user wants to redownload — TBD as a Spec 4 detail; alternative is to regenerate at request time.)
- **Refresh semantics**: When the user returns, the on-screen brief is recomputed live from `personalization.ts` content. If we update the persona / big-insight / gap copy in code, returning users see the new content with their stored answers. This lays the foundation for Phase 1.5+ peer-benchmarking — a "Your peer percentile" block can light up automatically when the data backend supports it, no per-user migration needed.
- **Empty / not-found states**: A user signed in as User-A trying to load `/results/<User-B's-id>` gets a 404, not a 401. (Don't leak existence of other users' rows.)
- **Unauthenticated access**: A user not signed in trying to load `/results/{id}` gets redirected to Supabase Auth signin. After signin, redirects back to the requested URL.

## What This Spec Does NOT Do

- **No `/dashboard` page.** Out of scope; lands in Phase 1.5+ if demanded.
- **No share tokens / public URLs / "send to my CEO" links.** PDF (Spec 2) is the share artifact; the on-screen URL is private.
- **No peer-benchmarking content.** Blocked on N≥30 per segment per `CLAUDE.md`. Spec 4 lays groundwork (server-rendered, recomputable) but ships without it.
- **No re-PDF-generation triggered by visiting the URL.** Returning users see the on-screen brief; if they want a fresh PDF and Spec 2's 30-day retention sweep already ran, that's a Spec 2 amendment (regen-on-demand), tracked separately.
- **No edit-the-assessment / retake-from-here UX.** Retaking is the existing top-level `/assessment` flow. Spec 4 doesn't gain its own retake button.
- **No changes to assessment instrument, scoring, or the email-capture flow.**

## Architecture

**New files:**

- `src/app/results/[id]/page.tsx` — server component. Reads the `id` route param, validates Supabase Auth session, queries `assessment_responses` row by id (RLS auto-enforces ownership), passes props to `<ResultsViewV2 />`. Returns 404 if the row does not exist or RLS rejects the read.
- `src/lib/assessment/load-response.ts` — server-only helper. Single export: `loadAssessmentResponse(id: string) → AssessmentResponseLoaded | null`. Joins the row, recomputes tier from stored answers (so a future scoring tweak surfaces correctly), recomputes dimension breakdown, returns the props-shaped object ResultsViewV2 already expects.

**Modified files:**

- `src/app/assessment/_components/ResultsViewV2.tsx` — no behavioral change, but a small audit pass to remove any remaining session-state assumptions. The component is already props-only after Spec 1's reshape, so this should be a 0-change verification.
- `src/app/assessment/page.tsx` — after the in-flow render, append a `redirect('/results/{id}')` once Supabase Auth completes from Spec 2. The user's first visit goes through `/assessment` → results render → on auth completion, URL replaces to `/results/{id}` (browser back-button tolerates it).
- `supabase/migrations/00028_assessment_responses_index.sql` — adds `CREATE INDEX assessment_responses_user_id_idx ON assessment_responses(user_id) WHERE user_id IS NOT NULL;` to keep RLS-policy SELECTs fast for users with growing histories. Trivial migration.

**No changes:**

- All Spec 1 work (`ResultsViewV2.tsx` shape) stays.
- All Spec 2 work (PDF generation, storage, auth) stays.
- All Spec 3 work (ConvertKit tagging) stays — the email's "your brief is here" link goes to the new `/results/{id}` URL once Spec 4 ships.

## Acceptance Criteria

1. **URL works for owner**: An authenticated user navigating to `/results/{their-row-id}` sees the same on-screen brief they saw immediately after completing the assessment.
2. **URL is private to others**: An authenticated user navigating to `/results/{another-user's-row-id}` sees a 404 (not a 401, not the brief).
3. **Unauthenticated redirect**: An unauthenticated user navigating to `/results/{id}` is redirected to Supabase Auth signin. After signin (or signup), redirected back to the same `/results/{id}` URL. RLS then resolves visibility.
4. **Source-of-truth verified**: Clearing browser sessionStorage and visiting `/results/{id}` (signed in as owner) renders the brief identically. The page does not depend on session state.
5. **Recompute works**: Modifying tier breakpoints in `content/assessments/v2/scoring.ts` and re-deploying causes returning users to see the new tier when applicable. (Tested via a temporary breakpoint shift in staging.)
6. **No leak of others' content via RLS bypass**: Direct SQL queries through service-role client are scoped explicitly to the requesting user's id (in code, not just RLS). Defense-in-depth.
7. **Index exists and is used**: `EXPLAIN` on the SELECT-by-user-id query shows index usage.
8. **Spec 3 email links resolve correctly**: Email #1 sent post-Spec 3 + Spec 4 contains a `/results/{id}` URL that, when clicked, signs the user in (or routes through signin) and lands on their brief.
9. **Browser back-button tolerates the redirect**: After in-flow `/assessment` → `/results/{id}` redirect, hitting back does not re-trigger the assessment or duplicate-write a new row.
10. **Retake produces a new URL while preserving the old**: Completing the assessment a second time creates a new row, redirects to the new `/results/{new-id}`, and the old `/results/{old-id}` remains accessible to the same user.
11. **Mobile parity**: `/results/{id}` renders identically to in-flow results on iPhone SE (375px) — no layout shift, no horizontal scroll.
12. **404 page is well-styled**: A non-existent or non-owned row produces the project's existing 404 page (not a stack trace, not a Next.js dev page in production).

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Returning user sees stale tier copy because we updated `personalization.ts` | Acceptable — that's the point. Document in spec that copy changes propagate to historical briefs. If a tier is renamed (id changes), add a migration mapping old IDs to new. |
| RLS bypass via service-role client in API routes | Code review checklist: any service-role query against `assessment_responses` MUST include explicit `eq('user_id', sessionUserId)` filter. Added to security audit pass. |
| `redirect('/results/{id}')` race with in-flow client state causes flash | The in-flow `/assessment` page already shows ResultsViewV2 directly; the redirect happens *after* auth completes (Spec 2 timing). Staging test confirms no flash. |
| User loses access if they sign out and back in with a different email | Acceptable — the row is owned by the original `auth.uid()`. If they want to rebind to a new email, that's a manual support flow. |
| Spec 4 ships and breaks Spec 2's PDF download because the auth flow now expects `/results/{id}` | Coupled testing. The acceptance criteria above include "Spec 3 email links resolve correctly" which is the same surface area. |
| Eventually-large `assessment_responses` table degrades query perf | Index on user_id added in 00028. Long-term: archive to a `assessment_responses_archive` table at N years. Not a v1.0 concern. |

## Open Questions (for plan-time, not blockers)

- **Re-PDF generation on return-trip**: If a user returns to `/results/{id}` 60 days later (past Spec 2's 30-day retention), and clicks "Download PDF" — do we regenerate? Default plan: yes, the warm endpoint accepts an existing `assessmentResponseId` and produces a fresh PDF. Spec 2 amendment.
- **Sign-in flow when user originally captured email but never completed Spec 2's auth gate**: They have an `assessment_responses` row but no `user_id`. If they later try to access `/results/{id}` they'll be redirected to signin → after signin we need to back-fill the `user_id` if the auth user's email matches the row's email. v1.0 includes this back-fill on signin success.
- **Email mismatch between assessment-time and signup-time**: User typed `bob@bank.com` at capture but signed up as `bob@personal.com`. Row gets orphaned. Detection: signin success without a matching row → show "Looks like you didn't complete an assessment yet — start one?" Not orphan-recovery in v1.0.
