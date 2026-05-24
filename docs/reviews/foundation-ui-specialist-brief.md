# Foundation UI Specialist — Role Brief

**Hired:** 2026-05-24 (`feature/addie-v1`).
**Scope:** ongoing UI review of every page in the AiBI Foundation Course (ADDIE rebuild). One specialist instance per page, dispatched on demand by the engineer. Each dispatch produces a per-page report at `docs/reviews/foundation-ui-specialist-<surface>-YYYY-MM-DD.md`.

This brief is the contract the specialist works to. When a new foundation page is built or materially changed, dispatch a specialist with this brief and the target route — that is the entire engagement protocol. Existing per-page reports are appended-not-overwritten so the review history is auditable.

## Working directory

`/Users/jgmbp/Projects/TheAiBankingInstitute/.worktrees/addie-v1`. Dev server runs at `http://localhost:3000`. If `curl -sI http://localhost:3000/<route>` ≠ 200, that is finding #1; do not speculate beyond it.

## Authoritative rules (the bar)

1. **Branch-scoped CLAUDE.md** — read the "BRANCH-SCOPED — Foundation Course rebuild on ADDIE" section. The five explicit deviations from `main` (no credential v1, course-name shorthand, route reauthoring, assessment reconciliation, team SKU) override everything else.
2. **Ledger tokens only** — `var(--ledger-*)`. No `text-stone-*`, `text-gray-*`, `bg-white`, no raw hex outside the four exempt contexts (Satori OG image, static favicon `.svg`, vanilla-JS chart constants, server-generated downloads).
3. **Typography** — Newsreader serif (display) · Geist sans (body, UI) · JetBrains Mono (kickers, metadata, numbers). Italics retired globally — flag every `<em>`, `italic`, `not-italic`, `italic-off`.
4. **WCAG 2.1 AA** — 4.5:1 text/background contrast; body text never on `--ledger-parch`; `<img>` needs `alt`; heading order must not skip.
5. **Radii** — 2px buttons/inputs/chips · 3px cards · 4px hero cards. Flag any other literal.
6. **One shadow** — `--ledger-shadow` on hero/feature cards only. Flag every `shadow-[…rgba…]` literal and every shadow on a button/chip/non-hero card.
7. **Motion** — almost none. 120ms UI / 200ms page transitions. Hover = border darken. Flag `group-hover:scale-*`, `group-hover:-translate-y-*`, parallax, scroll-jacking, spring physics.
8. **Voice + banned words** — "AI-powered", "users", "supercharge", "unlock", "revolutionize", "leverage", "synergy". No exclamation points. No emoji.
9. **Credential policy (branch-scoped)** — Foundation Course has NO credential / NO certificate on this branch. Flag every "Specialist (AiBI-S) credential", "Foundations Certificate", "the harder version ships with AiBI-S/…".
10. **Statistics** — every number carries a named source.

## How a single dispatch works

1. **Confirm the route.** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<route>`.
2. **Locate the source.** Grep + Glob to find the page + components it mounts. Read each top-to-bottom — don't keyword-grep alone.
3. **Pull the rendered HTML** for copy cross-check. `curl -s http://localhost:3000/<route> | head -400`.
4. **Ground every finding in `file:line`.** Quote the offending code. If you can't point at a line, the finding doesn't go in.

## Output format (every dispatch produces this)

Write `docs/reviews/foundation-ui-specialist-<surface-slug>-YYYY-MM-DD.md`:

```markdown
# Foundation UI Specialist — <surface> (YYYY-MM-DD)

**Route:** `<route>` · **HTTP:** <code> · **Source:** `<file>`

## Findings

### F1 — <title>
- **Severity:** <BLOCKER|HIGH|MEDIUM|LOW>
- **Rule:** <numbered rule violated>
- **File:** `<path>:<line>`
- **What's wrong:** <1–2 sentences>
- **Evidence:**
  ```tsx
  <quoted code>
  ```
- **Fix:** <concrete change — token name, prop, copy>

(repeat)

## Verdict
<one sentence: ship / fix-then-ship / blocker>
```

Return message: report path, finding count by severity, verdict.

## Engagement registry

Active per-page reports live alongside this brief in `docs/reviews/`. Each filename names its surface + date. To re-review a page after fixes land, dispatch a fresh specialist; do not edit the prior report.

| Date | Surface | Report |
| --- | --- | --- |
| 2026-05-24 | Whole-course audit (one-shot) | [`foundation-ui-specialist-audit-2026-05-24.md`](./foundation-ui-specialist-audit-2026-05-24.md) |
| 2026-05-24 | Fix log | [`foundation-ui-specialist-fix-log-2026-05-24.md`](./foundation-ui-specialist-fix-log-2026-05-24.md) |
| 2026-05-24 | Per-page sweep — `/foundation` | (this session) |
| 2026-05-24 | Per-page sweep — `/foundation/gate` | (this session) |
| 2026-05-24 | Per-page sweep — `/foundation/m0` | (this session) |
| 2026-05-24 | Per-page sweep — `/foundation/m3` | (this session) |
| 2026-05-24 | Per-page sweep — `/foundation/m4` | (this session) |
| 2026-05-24 | Per-page sweep — `/foundation/dashboard` | (this session) |
