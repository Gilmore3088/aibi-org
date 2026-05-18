# Handoff — 2026-05-17 (Dashboard Ledger session)

## Where we are

All work from this session is **shipped to production** (`main`).
PR #123 (`feature/dashboard-ledger`) was merged into `main` at
`764f13e` and Vercel auto-deployed; three follow-up fixes were pushed
direct to `main` (`3a6e26a`, `54033b3`, `7418545`). The feature
branch and worktree are deleted.

`www.aibankinginstitute.com` now serves the Ledger dashboard, the
refocused In-Depth landing, the chrome-fixed auth surfaces, the
desktop-clean LMS shell, and the trimmed Foundation program page.

## What was done

Strategy doc: [`Plans/dashboard-ledger-redesign.md`](../../Plans/dashboard-ledger-redesign.md).
Task tally: [`tasks/_done/dashboard-ledger-redesign.md`](../../tasks/_done/dashboard-ledger-redesign.md).
Decisions captured: [`DECISIONS.md`](../../DECISIONS.md) — 2026-05-17 entries.

## State of the repo

- `main`: clean. Latest commit `7418545`.
- No open feature branches from this session.
- One untracked file pre-existing the session: `docs/foundation-content-inventory-2026-05-17.md`. Not touched.
- `playwright.config.ts` had unrelated edits at session start; left as-is.

## What to watch next session

- The `PREVIEW_AUTH_BYPASS` helper makes API 401s very visible on
  preview deploys. If preview QA gets noisy, consider mocking the
  `/api/dashboard/*` responses behind the same flag.
- Toolkit / SkillBuilder copy still uses "Banking AI Skill" — brand
  sweep candidate, not blocking.
- The 6 published `/resources/*` briefings only surface from the
  dashboard. Worth surfacing in `/research` too.
- Worktree cleanup audit still pending — there are ~9 older worktrees
  in `~/Projects/aibi-*`. User asked to defer.

## Production verification done at end of session

- `/dashboard` — Ledger redesign live, 7-step ladder rendering
- `/assessment/in-depth` — three $99 buttons all trigger Stripe checkout
- `/auth/*` — single brand mark (global SiteNav only)
- `/courses/foundation/program` — global nav restored, H1 reads "AI Banking Foundation", combined hero paragraph
- `/courses/foundation/program/purchase` — no AiBI-S/L footer

Build was clean (`npm run build` zero errors) before each production push.
