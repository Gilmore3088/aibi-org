---
status: shipped
created: 2026-05-17
shipped: 2026-05-17
owner-tasks: tasks/_done/dashboard-ledger-redesign.md
---

# Dashboard Ledger Redesign + Sales-Surface Refinement (2026-05-17)

## Why

The signed-in dashboard at `/dashboard` was still on the legacy Terra
palette and didn't match the Ledger refresh (2026-05-09). It also
lacked any visible ladder from "I just signed up" → "I'm enrolled and
practising." The In-Depth Assessment landing page mirrored the same
problem in reverse: three stacked `$99` callouts with no comparative
framing against the free scan.

A single session (2026-05-17 evening) addressed both — plus the
chrome/auth side-effects that surfaced while testing on preview.

## What shipped

### `/dashboard` — full Ledger rebuild

Source design: `User Home.html` from the Claude Design handoff bundle
(`api.anthropic.com/v1/design/h/YwatjHkQYmQVsOv6WAjawg`). Same bundle
re-fetched mid-session at `…/AyViAgbGthsTGBLq6UlmsQ` — verified
byte-identical, so the implementation was already on-spec.

Composition (top to bottom):

1. **Tabs row** — Dashboard / The Brief / Curriculum / Toolbox. Tabs
   point at real routes; Curriculum + Toolbox carry a "with Foundation"
   lock until the user enrolls. (Removed the design's 5th "Account"
   tab — no `/account` route exists.)
2. **Welcome hero** — personalised greeting (derived from the email's
   local part), state-aware lede + CTA pair.
3. **Activation ladder** — seven rungs tied to real evidence:
   account → free readiness → first rep → In-Depth ($99) → Foundation
   ($295) → first module complete → certificate. Only the next un-done
   rung lights up.
4. **Trio cards** — Assess / Practice / Build, each linking to the
   right next action for the user's state.
5. **Today's six-minute rep** — pulled from `getDailyPracticeRep()`,
   with a risky→safe illustration the user can scan.
6. **In-Depth section** — appears only when entitled.
7. **Foundation preview** (dark card) — copy honest about self-paced,
   no video, real counts (12 modules, 30+ prompts, 6 artifacts).
8. **Free resources** — 4 cards pointing at real published briefings.
9. **SAFE rule strip** — 4-letter explainer with CTA.

### `/assessment/in-depth` — refocused on selling the $99

- Single buying surface: Free Readiness Scan (muted "for the curious")
  vs In-Depth (gold-bordered "Recommended") side-by-side, with the
  $99 button rendered inside the Recommended card alongside its
  deliverables.
- Line-by-line comparison table below for buyers who want detail.
- All three "Purchase In-Depth · $99" CTAs (hero, card, table) now
  call `/api/checkout/in-depth` via `PurchaseButton` instead of being
  page-anchor links. Generalised `PurchaseButton` with `label` /
  `pendingLabel` / `size` props so one component covers all three.
- Removed the redundant trust strip at the bottom.

### Chrome fixes (side effects of testing)

- `/auth/*` — global SiteNav was rendering on top of `LedgerSurface`'s
  internal lockup, producing a double brand mark. Added `showHeader`
  prop to `LedgerSurface` (default `true` for other consumers) and
  passed `false` from the four auth pages.
- `/courses/foundation/program/*` — hamburger button leaked onto
  desktop because the button's inline `display: inline-flex` won
  specificity against `className=md:hidden`. Wrapped the button in a
  `<div className="md:hidden">` so the parent's `display: none`
  cascades and inline style can't beat it.
- `/courses/foundation/program` (root) — removed from
  `CHROMELESS_PATHS` so the global SiteNav renders. Enrolled learners
  had no way back to the rest of the site.

### Copy accuracy sweep

- Foundation card on `/dashboard` no longer claims "8-week cohort",
  "video modules", "200+ reps", or "live calls" (none of which exist;
  Foundation is self-paced, modules are reading + activities, the
  rep library is ~15 reps and free for everyone, there is no cohort
  community).
- 4 dashboard "free resources" links repointed from non-existent
  `/resources/safe-rule-card`, `…/use-case-inventory`,
  `…/meeting-summary-prompt` to real published briefings.
- `/courses/foundation/program` H1 "Banking AI Foundation" → "AI Banking
  Foundation" (matches institute name).
- Combined two redundant hero paragraphs on the program page into one
  promise line in `course-config.ts` (shared by both `/program` and
  `/program/purchase`).
- Dropped the "AiBI-S/L launching soon" footer from `/purchase` —
  exposed roadmap to buyers with no link or date.

### `PREVIEW_AUTH_BYPASS` helper

`src/lib/auth/previewBypass.ts` lets us click into the gated
`/dashboard` and `/courses/foundation/program/*` surfaces on a Vercel
preview that doesn't have Supabase configured. Three-layer safety:

1. `VERCEL_ENV === 'production'` → hard-floor refuse (always).
2. `PREVIEW_AUTH_BYPASS=true` → explicit opt-in still honoured.
3. Otherwise auto-bypass when `NEXT_PUBLIC_SUPABASE_URL` isn't set —
   the auth gate would just redirect to a broken login page, so
   trapping the user serves no one.

Production is inert because it has Supabase configured (and the
hard-floor blocks even mis-scoped env vars). The bypass only unlocks
the route gate; API routes (`/api/dashboard/*`) still 401, but the
visual surface renders with empty data, which is what design QA needs.

## Decisions captured this session

- **5th "Account" tab dropped** — no `/account` route exists; adding
  one was scope creep for a UX session.
- **Foundation feature list rebuilt from real data**, not from the
  design's illustrative copy. The design said "200+ reps / 40 items /
  cohort community"; the codebase says 15 reps, 30 prompts, no cohort.
  Truth wins.
- **CourseShell chromeless removed** — preferring global nav stacked
  above the LMS sidebar/breadcrumb over leaving learners with no exit.
- **PreviewAuthBypass auto-fires when Supabase missing** rather than
  requiring an env var. Env var was added then removed when it became
  clear no one would remember to set it on every preview.

## Done criteria — all met

- [x] `/dashboard` renders the Ledger layout on production
- [x] In-Depth landing pushes the $99 with comparison context
- [x] No double brand mark on `/auth/*`
- [x] No desktop hamburger on `/courses/foundation/program/*`
- [x] Foundation card copy matches the actual product
- [x] All dashboard resource links resolve to real pages
- [x] Preview deploys are clickable without Supabase
- [x] Production push of all of the above (see commits below)

## Commits shipped

Merged via PR #123 (`feature/dashboard-ledger`) into `main` at
`764f13e`, plus follow-up direct-to-main fixes:

| Commit | Subject |
|--------|---------|
| `a7aabde` | feat(dashboard): rebuild /dashboard on the Ledger User Home design |
| `69b6f5a` | fix(dashboard): drop unused initials() helper |
| `f3ae71c` | feat(in-depth): refocus page on selling the $99 path |
| `5572a66` | fix(in-depth): wire all $99 CTAs to real Stripe checkout |
| `b9089f8` | fix(auth): drop internal LedgerSurface lockup |
| `ea49a12` | fix(in-depth): remove trust strip, plain anchor for #compare |
| `f96e4c5` | feat(auth): add PREVIEW_AUTH_BYPASS for preview/local testing |
| `ada8bb0` | fix(auth): auto-bypass when Supabase isn't configured |
| `018d87b` | fix(dashboard): refine Foundation copy + real links |
| `e8614d1` | feat(dashboard): expand activation ladder 4 → 7 steps |
| `edce52a` | fix(purchase): drop AiBI-S/L 'coming later' footer |
| `38d0c25` | fix(lms): hide hamburger on desktop |
| `764f13e` | Merge feature/dashboard-ledger into main |
| `3a6e26a` | fix(program): drop 'AiBI-S/L launching soon' footer line |
| `54033b3` | fix(layout): restore global SiteNav on /courses/foundation/program |
| `7418545` | fix: combine duplicate hero copy + 'Banking AI' → 'AI Banking' |

## What this plan did NOT do

- No backend changes to `/api/dashboard/*` — same auth contract, same
  401 behaviour.
- No Stripe / Supabase / MailerLite wiring changes.
- No homepage changes (the perf LCP commits on `main` were authored
  earlier and merged through cleanly).
- No new content — the four briefings linked from the dashboard
  already existed under `/resources/`.

## Follow-ups (not blocking)

- Toolkit page (`/courses/foundation/program/toolkit`) and Skill
  Builder still refer to "Banking AI Skill" — semantically defensible
  ("AI skill for banking") but worth a brand sweep next session.
- The 6 `/resources/*` briefings should probably surface in
  `/research` too — they're currently only reachable via the
  dashboard or direct URL.
- `PREVIEW_AUTH_BYPASS` makes API 401s very obvious on previews;
  consider a one-flag preview-mode that also short-circuits the
  learner / assessments API routes to mock data.
