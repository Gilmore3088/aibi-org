---
title: Ledger redesign — handoff
branch: feature/redesign-v3-cd
base: feature/brand-refresh
date: 2026-05-10
status: visually complete via token remap, manual QA + decisions pending
---

# Handoff — `feature/redesign-v3-cd`

For: anyone resuming this work in a future session (you, or the next agent).

## TL;DR

Every production route on the AiBI site now renders in the **Ledger** brand
(parchment + gold + cool navy + Newsreader/Geist/JetBrains Mono). Got there
via two parallel paths:

1. **9 new internal routes** that mount pixel-faithful translations of the
   claude.ai/design bundles (the "preview" surfaces — `/design-system`,
   `/user-home`, `/my-toolbox`, `/playground`, `/faq`, `/preview-home`,
   `/lms-preview`, `/briefing-preview`, `/courses/foundation-preview`).
2. **A single token remap** in `src/styles/tokens.css` that points every
   legacy `--color-*` and `--font-*` to the corresponding Ledger value.
   This means every component that already uses tokens (and that's most
   of `src/components/system/*`, the dashboard, the assessment flow,
   the course pages, etc.) auto-Ledger-ified without per-page rewrite.

On top of those two, **9 production surfaces got direct Ledger primitive
treatment** (auth × 4, legal × 3, verify cert, homepage chrome via
SiteNav + SiteFooter).

The branch is **24 commits** ahead of `feature/brand-refresh`. Type-check
clean. Reviewable in dev via the interactive checklist at
`/redesign-checklist`.

## Where things live

| Thing | Path |
|---|---|
| Worktree | `~/Projects/aibi-redesign-v3-cd` |
| Branch | `feature/redesign-v3-cd` |
| Base | `feature/brand-refresh` (which is on top of `main`) |
| Dev server | Was running on `localhost:3001` (port 3000 was occupied by another worktree of yours) |
| Bundle source | `docs/brand-refresh-2026-05-09/bundles/0{1,2,3,4}-…` |
| Ledger React primitives | `src/components/ledger/{index.tsx, ledger.css}` |
| CSS scoper script | `/tmp/scope-css.mjs` (copy somewhere durable if you want to re-use) |
| Bundle link rewriter | `src/lib/redesign/bundle-links.ts` |
| Interactive QA | `src/app/redesign-checklist/{page.tsx, NoteEditor.tsx, storage.ts, data.ts}` |

## Resume in a future session

```bash
# 1. Cwd into the worktree
cd ~/Projects/aibi-redesign-v3-cd

# 2. Confirm branch
git status                          # → feature/redesign-v3-cd, clean

# 3. Confirm worktrees (so you don't clash)
git -C ~/Projects/TheAiBankingInstitute worktree list

# 4. Start dev server
npm run dev                         # likely lands on :3001 if :3000 is busy

# 5. Open the QA checklist to see status
open http://localhost:3001/redesign-checklist
```

## What's done

### 9 bundle-translated routes (commits `6fea5d8`–`dd76266`)

Each follows the same pipeline:
1. Fetch the claude.ai/design URL (returns gzipped tar)
2. Extract to `docs/brand-refresh-2026-05-09/bundles/NN-name-hash/`
3. Read the mockup HTML, split into `_body.html` (markup) + `_script.js`
   (interactive JS) + scoped CSS via `/tmp/scope-css.mjs`
4. Render via `<div className="xx-page" dangerouslySetInnerHTML>` plus
   `<Script strategy="afterInteractive">` for the JS
5. Add to `CHROMELESS_PATHS` in `src/app/layout.tsx` so the bundle's own
   nav doesn't double up with the global header
6. Add to `COMING_SOON_BYPASS_PREFIXES` in `src/middleware.ts`
7. Map the bundle filename to the new route in `src/lib/redesign/bundle-links.ts`

| Route | Bundle | Source file | Notes |
|---|---|---|---|
| `/design-system` | 01 | Design System.html | 21-section reference, no JS |
| `/user-home` | 02 | User Home.html | Static |
| `/my-toolbox` | 03 | My Toolbox.html | ~220 lines of JS for filter chips, modal, drawer, search, pinning |
| `/preview-home` | 01 | AI Banking Institute.html | ROI calculator interactive |
| `/lms-preview` | 01 | LMS Prototype.html | Iframed because of CDN React + Babel-in-browser |
| `/playground` | 02 | Playground.html | ~545 lines of JS for multi-model fake responder |
| `/faq` | 01 | FAQ.html | Accordion + scroll-spy nav |
| `/briefing-preview` | 01 | AI Readiness Briefing.html | Score ring + count-up; data-* attrs control variants |
| `/courses/foundation-preview` | 04 | courses/foundation.html | Static |

### Direct Ledger primitive conversions

Use the React component library at `src/components/ledger/`:

| Route | Components |
|---|---|
| `/auth/login` | LedgerSurface, LedgerCard, LedgerToggle, LedgerField, LedgerButton, LedgerAlert |
| `/auth/signup` | + native checkbox for terms |
| `/auth/forgot-password` | sent-state branch |
| `/auth/reset-password` | password + confirm |
| `/privacy`, `/terms`, `/ai-use-disclaimer` | LedgerArticle (eyebrow + h1 + .ledger-prose body) |
| `/verify/[id]` | Server component with two LedgerSurface branches (verified / not-found) |

### Global chrome touch-ups

- `src/components/system/SiteNav.tsx` — replaced `AibiSeal` SVG + serif title with the canonical two-line Geist 700 uppercase lockup
- `src/components/system/SiteFooter.tsx` — same lockup treatment in the brand column; tagline switched to mono terra eyebrow

### Token remap (commit `d1836b6` — the high-leverage one)

Every legacy `--color-*` token in `src/styles/tokens.css` now resolves
to a Ledger value via `var(--ledger-X, fallback)`:

| Legacy | Was | Now |
|---|---|---|
| `--color-terra` | `#b5512e` (rust) | `#B5862A` (gold) |
| `--color-ink` | `#1e1a14` (warm) | `#0E1B2D` (cool navy) |
| `--color-linen` | `#f9f6f0` | `#ECE9DF` (Ledger bg) |
| `--color-parch` | `#f5f0e6` | `#F4F1E7` (Ledger paper) |
| `--color-cobalt` | `#2d4a7a` | `#1E3A5F` |
| `--color-slate` | `#6b6355` | `#5C6B82` |

Same for `--font-serif/sans/mono` → Newsreader / Geist / JetBrains Mono.

This single commit cascades through every component in `src/components/system/`,
every dashboard page, every course page, every assessment surface, etc.
**To revert the entire visual change at once: `git revert d1836b6`.**

### Plausible eliminated (commit `518a3ed`)

Per user direction, all Plausible references removed. `trackEvent` is now
a no-op stub in `src/lib/analytics/plausible.ts` so callsites still
compile; the `plausible.d.ts` type, queue init, and external script tag
were deleted; direct `window.plausible(...)` calls scrubbed from 4
component files.

### Interactive QA checklist (commits `1bd99a8`, `e4cd3a1`, `753c481`)

`/redesign-checklist` — 67-route inventory with per-item:
- checkbox (state in localStorage)
- expandable note panel (textarea, debounced auto-save)
- photo upload (file picker + Cmd+V paste; canvas-compressed JPEG to fit localStorage)
- thumbnail grid + lightbox
- filter (All / Unchecked / Checked / With notes)
- export to JSON file (timestamped) + import (merge or replace)
- progress bar with running tally + storage footprint

Edit the route list in `src/app/redesign-checklist/data.ts`.

## What's NOT done

| | Item | Why |
|---|---|---|
| 1 | **DECISION**: which preview routes promote to legacy URLs (e.g. `/user-home` → `/dashboard`, `/preview-home` → `/`, `/my-toolbox` → `/dashboard/toolbox`, `/courses/foundation-preview` → `/courses/foundations/purchase`) | These are visible to existing users — needs explicit user go-ahead per surface. |
| 2 | **Bundle 5+** | User said 6+ bundles total, 4 received. More to come. |
| 3 | **Custom assessment subcomponents** (`QuestionCard`, `ScoreRing`, `EmailGate`, `ResultsViewV2`, `PdfDownloadButton`) — they auto-remap colors but their layouts may want tightening for Ledger | Deferred — deep refactor, would benefit from a dedicated bundle from claude.ai/design first. |
| 4 | **Per-page polish** on auto-remapped marketing pages (`/about`, `/education`, `/for-institutions`, `/research`, `/security`) | Auto-remap got them 80% there. Final polish needs the user's eyes (use `/redesign-checklist` to flag). |
| 5 | **CLAUDE.md updates** to reflect Ledger branding, retired Plausible, etc. | User is editing `plans/refactor-aibi-p-to-foundation-migration.md` separately; flagged as "don't touch" for this branch. |
| 6 | **Promote** the dev-bypass list cleanup once `COMING_SOON` flips to `false` on prod | Most marketing routes were added to `COMING_SOON_BYPASS_PREFIXES` for visual review under the existing dev `COMING_SOON=true`. They'll work fine in prod either way; the list just becomes redundant. |

## Known issues / gotchas

### `.env.local` is missing Supabase env vars

After my mistake on 2026-05-10 (saved to memory: `feedback_no_sed_i_on_env_files.md`),
`.env.local` was restored from `vercel env pull`. The pull only included:

```
COMING_SOON="true"
VERCEL_OIDC_TOKEN="..."
```

Missing: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, and presumably most of the rest.

**Symptom**: `/auth/signup` and `/auth/login` throw "Auth is not configured.
Set Supabase environment variables." Same for any server route that hits
Supabase.

**Fix** (user does this themselves; do NOT touch `.env.local` with sed):
- Either add the Supabase vars to **Vercel Development** scope and re-run
  `vercel env pull .env.local`, OR
- Pull from Production: `vercel env pull --environment=production .env.local --yes`
  (but be aware production `COMING_SOON` may be `true`, requiring another flip)

### `COMING_SOON=true` in `.env.local`

The redesign branch's middleware bypass list is stuffed with most production
routes specifically to make them reachable in dev under `COMING_SOON=true`.
If the user flips `COMING_SOON` to `false` (per saved memory
`project_coming_soon_dev_override.md`), the bypass list becomes redundant
but not harmful.

### Two dev servers

User has another `next dev` running from `~/Projects/TheAiBankingInstitute`
on port `3000`. The redesign worktree's dev server lands on `3001` because
3000 is taken. Don't kill the user's :3000 server.

### Dev server has died several times this session

Each time, just restart with `npm run dev` from the worktree. State is on
disk; nothing's lost.

### CSS scoper limitations

`/tmp/scope-css.mjs` mostly just works but:
- It assumes the bundle ships exactly one `<style>` block in `<head>`
- It needs balanced braces in `@keyframes` (regex-based, no full parser)
- It renames keyframes to `<wrapper>-name` and tries to update `animation:`
  refs — verify after generating

## Reversibility

Every commit is small and atomic. To roll back the visual change:

```bash
# Revert just the token remap (keeps everything else)
git revert d1836b6

# Or roll the whole branch back to brand-refresh state
git reset --hard feature/brand-refresh   # destructive; only if you're sure
```

To remove a single bundle-translated route, delete its `src/app/<route>/`
directory and remove the entry from `CHROMELESS_PATHS` and
`COMING_SOON_BYPASS_PREFIXES`.

## Suggested next session prompt

```
We're on feature/redesign-v3-cd in ~/Projects/aibi-redesign-v3-cd. Read
docs/brand-refresh-2026-05-09/HANDOFF.md for context. The interactive
QA checklist is at /redesign-checklist — I've imported my notes via
the Import button. Walk the items I flagged and propose fixes.
```

## Commit log on this branch (newest first)

```
753c481 feat(redesign-checklist): export + import to JSON file
e4cd3a1 feat(redesign-checklist): per-item notes + screenshot uploads
1bd99a8 feat(redesign): interactive QA checklist at /redesign-checklist
4a283f5 chore(middleware): expand dev bypass to assessment + practice + prompt-cards + cert exam + results
12ec144 fix(footer): switch brand line to Ledger lockup + mono tagline
0d3ccab fix(nav): use Ledger lockup wordmark instead of AiBI seal + serif title
df91b9e chore(middleware): special-case '/' so the homepage bypasses coming-soon
29427bc chore(middleware): expand dev bypass list for redesign preview
d1836b6 feat(redesign): remap legacy --color-* and --font-* tokens to Ledger
50c8f61 feat(redesign): /ai-use-disclaimer + /verify/[id] in Ledger
f54e9bd feat(redesign): /privacy + /terms in Ledger + LedgerArticle/Prose primitives
4365a2a feat(redesign): /auth/signup, /auth/forgot-password, /auth/reset-password
7427dfd feat(redesign): Ledger component library + /auth/login redesign
518a3ed chore(analytics): eliminate Plausible
dd76266 feat(redesign): Slice 9 — /courses/foundation-preview + Bundle 4 import
29ec65c feat(redesign): Slice 5 — /lms-preview (LMS prototype, iframed)
70e5be4 feat(redesign): Slice 8 — /briefing-preview (assessment results)
eb18f1f feat(redesign): Slice 4 — /preview-home (marketing landing)
9980f65 feat(redesign): Slice 7 — /faq
0a17861 feat(redesign): Slice 6 — /playground (interactive)
5d9b877 fix(redesign): rewrite cross-bundle filename links to real Next routes
3491e4e feat(redesign): Slice 3 — /my-toolbox + Bundle 3 import (interactive)
88326f2 feat(redesign): Slice 2 — /user-home + Bundle 2 import
3d74e46 fix(redesign): bypass global chrome on /design-system
6fea5d8 feat(redesign): Slice 1 — /design-system reference route
```
