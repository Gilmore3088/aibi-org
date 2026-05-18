---
status: active
created: 2026-05-17
plan: Plans/performance-optimization-2026-05-17.md
tasks: tasks/performance-optimization-2026-05-17.md
---

# Performance Overhaul — Audit Trail (2026-05-17)

Companion audit to [`Plans/performance-optimization-2026-05-17.md`](../../Plans/performance-optimization-2026-05-17.md).
Every LCP optimization attempt this session, with before/after metrics,
commits, and what was kept vs reverted.

## TL;DR

- Baseline: Lighthouse Perf **89**, LCP **3.8s**, page weight **599 KiB**.
- After this session: Lighthouse Perf **92**, LCP **3.3s**, page weight **508 KiB** (-91).
- Real-user LCP (Playwright unthrottled) is already **~440ms** — the page
  is fast for real users. The Lighthouse number is a *synthetic Slow 4G*
  number, gated by total bytes delivered over throttled bandwidth.
- The remaining gap to **<2.5s LCP** is network-bound. The only path
  forward is reducing total payload — primarily fonts (~241 KB).

## Goal

Lighthouse Performance ≥ 95 and LCP < 2.5s on `/`, while preserving the
Ledger brand stack (Newsreader display, Cormorant SC small caps,
Geist body, JetBrains Mono metadata).

## Method

For each candidate change: implement → run Lighthouse twice (cold + warm)
→ record metrics → diff against previous run → keep or revert based on
LCP and FCP impact. Playwright PerformanceObserver used to confirm the
LCP element on every run.

## Metrics table

| # | Change | Perf | LCP (s) | FCP (s) | Weight (KiB) | Verdict |
|---|--------|------|---------|---------|--------------|---------|
| 0 | Baseline (start of session) | 89 | 3.8 | 0.9 | 599 | — |
| 1 | Remove Cormorant Garamond, DM Sans, DM Mono | 90 | 3.6 | 0.9 | 522 | **Kept** |
| 2 | Drop Newsreader weight 300 | 90 | 3.6 | 0.9 | 514 | **Kept** |
| 3 | `display: optional` on Newsreader | 90 | 3.6 | 1.0 | 514 | Reverted — no benefit, FCP slipped |
| 4 | Inline-SVG homepage H1 (Satori) | 92 | 3.3 | 0.9 | 514 | **Kept** — permanent LCP shield on H1 |
| 5 | Inline-SVG lede paragraph too | 91 | 3.3 | 1.1 | 534 | Reverted — added 20 KB inline, no LCP gain, FCP +200ms |
| 6 | Inline-SVG combined hero block (H1 + lede in one SVG) | 90 | 3.4 | 1.2 | 538 | Reverted — FCP regressed further |
| 7 | Hero PNG path (raster fallback) | — | — | — | — | Reverted — eslint disable directive broke build |

End of session: **92 / 3.3s / 0.9s / 508 KiB**.

## Why LCP is stuck near 3.3s

Lighthouse uses a Slow 4G throttling profile (~1.6 Mbps effective). At
508 KiB total, delivering the full critical path takes ~2.5–3.0s before
any element can paint. We can prove this is network-bound, not
element-bound, because:

1. Every time we removed the LCP candidate (H1) by inlining it, the
   *next* element (lede) became the LCP — and clocked the same ~3.3s.
2. Inlining the lede made the eyebrow the LCP — same ~3.3s.
3. Real-user LCP (no throttling) is **376–644ms**. The element renders
   instantly when bytes arrive instantly.

This is whack-a-mole. The LCP element doesn't matter when the limit is
how long it takes to deliver bytes.

## What we kept

| Item | Commit | Why |
|------|--------|-----|
| Removed Cormorant Garamond, DM Sans, DM Mono imports | `eb13838` | Zero references in the codebase — dead weight |
| Dropped Newsreader 300 | `eb13838` | Zero references |
| Inline-SVG H1 via Satori (`scripts/gen-hero-svg.mjs` → `src/components/_generated/HeroHeadlineSvg.tsx`) | `4f2a4e8` | Permanent perf shield on the H1 element — even if it's not the bottleneck today, future text changes won't regress it |

## What we reverted (and why)

| Attempt | Commit | Revert | Reason |
|---------|--------|--------|--------|
| `display: optional` on Newsreader | — | `eb13838` | FCP slipped 100ms with zero LCP improvement — Lighthouse penalized the swap delay |
| Lede SVG | `812e68f` | `b6ca19d` | +20 KB inline, FCP +200ms, LCP unchanged. The lede ceased to be the LCP, but the next element took the same ~3.3s |
| Combined hero block SVG | `828b5d0` | `8f2df9c` | FCP regressed further to 1.2s. Same LCP. Confirmed bytes-bound |
| Hero PNG path | — | `6b55297` | Required an eslint-disable that didn't work as a JSX block comment; reverted before measuring |

Lessons captured in the revert commit bodies; nothing salvageable for now.

## Cormorant SC tradeoff

Cormorant SC contributes roughly **~50 KB** to the font payload and is
used on **10 small-caps surfaces** (section eyebrows, footnotes, the
wordmark line, decision-card kickers).

| Option | Bytes saved | Brand impact |
|--------|-------------|--------------|
| Keep Cormorant SC | 0 | None — current state |
| Replace with Geist tracked-uppercase (`text-transform: uppercase` + `letter-spacing: 0.18em`) | ~50 KB | Loses the editorial small-caps voice on those 10 surfaces. The mono kicker style would absorb most of those slots without a brand identity loss; the wordmark line is the only place that visibly changes |
| Subset Cormorant SC to Latin-only `unicode-range` | ~15 KB | None — but Newsreader/Cormorant Google subsets are already Latin |

**Recommendation:** if we're still above 2.5s after Wave A and Wave B
ship, drop Cormorant SC. The wordmark line is the only surface that
takes a real hit, and the Geist tracked alternative is acceptable.
See Wave C in the task file for the toggleable decision.

## Newsreader italic tradeoff

The Newsreader 500/600/700 italics together ship **~90 KB** and are
referenced in body copy on `<em>` and in a handful of pullquotes. Two
options:

| Option | Bytes saved | Brand impact |
|--------|-------------|--------------|
| Keep all italics | 0 | None — current state |
| Drop italic from 500/600/700, keep 400 italic | ~90 KB | Bold-italic combinations fall back to synthesized italic (browser skews the upright); aesthetically acceptable for the few surfaces that combine bold + italic. Most italics in body copy are weight 400 and unaffected |
| Drop all italics | ~120 KB | Italic voice in ledes and pullquotes lost — too heavy a brand cost |

**Recommendation:** the middle option (Wave A, task A3). 400-italic
stays preloaded for ledes and pullquotes; heavy weights serve normal
only. If anything looks visibly wrong on a heavy-italic surface, we
either swap to weight 400 italic or accept the synthesized italic.

## Path forward

Five workstreams ranked by impact ÷ risk. Tracked in
[`tasks/performance-optimization-2026-05-17.md`](../../tasks/performance-optimization-2026-05-17.md).

| # | Change | Bytes saved | Brand cost | Wave |
|---|--------|-------------|------------|------|
| 1 | Code-split `<ROIDossier>` via `next/dynamic({ ssr: false })` | ~10-30 KB JS | None | A |
| 2 | Split Newsreader font config: hero (400 ±italic, preload) + heavy (500/600/700 normal, no preload) | ~90 KB fonts | Synthesized italic on bold+italic combos | A |
| 3 | Verify Vercel Early Hints (HTTP 103) for the Newsreader 400 woff2 | 100–300ms latency | None | B |
| 4 | Drop Cormorant SC, migrate 10 small-caps surfaces to Geist tracked-uppercase | ~50 KB fonts | Wordmark line + a few eyebrows change | C — needs decision |
| 5 | (Implicit in #2) `preload: false` on heavy Newsreader weights | Frees critical path | None | A |

Acceptance: Perf ≥ 95, LCP < 2.5s on `/`, FCP ≤ 1.0s, full Playwright
suite green.

## Verification protocol

Each wave closes with:

1. `npm run build` — zero TypeScript errors
2. `npx playwright test` — full suite green
3. Lighthouse twice on `/` (cold + warm), once on `/assessment`
4. Append a row to the metrics table above with the new numbers
5. Tick the wave's boxes in the task file; decrement open count in `tasks/MASTER.md`

When LCP < 2.5s is achieved on `/`:

- Update plan frontmatter to `status: shipped`
- Move `tasks/performance-optimization-2026-05-17.md` → `tasks/_done/`
- Move `Plans/performance-optimization-2026-05-17.md` → `Plans/_archive/`
- Flip the row in `tasks/MASTER.md` to COMPLETE
- Append a closing entry to `CHRONOLOGY.md`

## Wave A — code changes (2026-05-17, post-audit)

### A1 — ROIDossier code-split

The calculator at `src/components/sections/ROIDossier.tsx` is a client component (`"use client"`, useState/useMemo) sitting below the fold on `/`. It was eagerly bundled into the homepage's client JS even though no user above the fold needs it.

Next 14.2 disallows `next/dynamic({ ssr: false })` from server components. Workaround: a thin client wrapper at `src/components/sections/ROIDossierLazy.tsx` does the dynamic import. The homepage server component imports the wrapper; the underlying ROIDossier chunk is fetched on-demand.

Expected effect: smaller homepage First Load JS, faster TTI on mobile, no impact on FCP/LCP (calculator is below the fold). The wrapper itself is microscopic (a single dynamic call).

### A3 — Newsreader split

Layout previously declared a single `Newsreader({ weight: ['400','500','600','700'], style: ['normal','italic'] })` call bound to `--font-newsreader`. That preloaded eight font files even though the LCP element is now inline-SVG (HeroHeadlineSvg) and only body lede + a handful of section pulls need the heavier weights.

New split:

| Config | Weights | Styles | Preload | Variable |
|--------|---------|--------|---------|----------|
| `newsreaderHero` | 400 | normal, italic | ✓ | `--font-newsreader-hero` |
| `newsreaderHeavy` | 500, 600, 700 | normal | ✗ | `--font-newsreader-heavy` |

**Deviation from spec.** The task said "Both bind `--font-newsreader`". This is impossible with next/font: each `Newsreader({...})` call generates a unique internal family name (e.g. `__Newsreader_abc123`), and the `.variable` className assigns that internal name to the CSS variable. If two configs share a variable, the latter overrides — only one family is reachable. We switched to two distinct variables and chain them in `font-family`:

```css
--ledger-serif: var(--font-newsreader-hero), var(--font-newsreader-heavy), "Iowan Old Style", Georgia, serif;
```

The browser uses `newsreaderHero`'s family for weights 400/400-italic, falls through to `newsreaderHeavy` for 500/600/700, then to system fallbacks. Italic weights 500/600/700 are dropped intentionally — they had zero references in `src/` per grep, and the savings (3 font files) are why the split matters.

### Files touched in Wave A

- `src/app/page.tsx` — import wrapper, replace `<ROIDossier />` with `<ROIDossierLazy />`
- `src/app/layout.tsx` — split Newsreader into two configs, apply both `.variable` classes to body
- `src/components/sections/ROIDossierLazy.tsx` — NEW; thin client wrapper
- `src/styles/tokens.css`, `src/styles/tokens-ledger.css` — chain hero + heavy variables
- Nine scoped route CSS files referencing `--font-newsreader` directly:
  `src/app/research/research.css`, `src/app/user-home/user-home.css`,
  `src/app/playground/playground.css`, `src/app/faq/faq.css`,
  `src/app/preview-home/preview-home.css`,
  `src/app/courses/foundation-preview/foundation-preview.css`,
  `src/app/design-system/design-system.css`, `src/app/my-toolbox/my-toolbox.css`,
  `src/components/ledger/ledger.css`

### Wave A blocked from clean build

`npm run build` is currently failing on `src/app/assessment/in-depth/take/_components/InDepthRunner.tsx` — `'RoleIcon' is not defined` (uncommitted WIP, not in our scope). `npx tsc --noEmit` is clean. `npx next lint` against the Wave A files is clean. Lighthouse re-measure (A2 + A5) is gated on the unrelated InDepthRunner fix landing OR a temporary stash.

## Commit references

| Commit | Description |
|--------|-------------|
| `eb13838` | Removed Cormorant Garamond, DM Sans, DM Mono; dropped Newsreader 300; reverted display:optional |
| `4f2a4e8` | Inline-SVG H1 via Satori (kept) |
| `812e68f` | Lede SVG (reverted) |
| `b6ca19d` | Revert "perf(hero): SVG the lede paragraph too" |
| `828b5d0` | Combined hero block SVG (reverted) |
| `8f2df9c` | Revert "perf(hero): bake entire hero text block to inline SVG" |
| `6b55297` | Revert hero PNG eslint-disable path |
| `54033b3` | Restore global SiteNav on /courses/foundation/program |
| `7418545` | Combine duplicate hero copy + brand fixes on Foundation pages |

## Files touched this session (perf scope)

- `src/app/layout.tsx` — font imports trimmed; comment documents `display:optional` revert
- `src/app/page.tsx` — uses `HeroHeadlineSvg` for H1; lede returned to HTML
- `src/components/system/templates/MarketingPage.tsx` — `titleNode?: ReactNode` prop in `MarketingHero`
- `src/components/_generated/HeroHeadlineSvg.tsx` — Satori-generated SVG component (kept)
- `scripts/gen-hero-svg.mjs` — build helper that regenerates the SVG component
- `src/app/courses/foundation/program/layout.tsx` — auth gate restored; not perf but touched in same session

## Open questions

- **Early Hints:** does Vercel emit HTTP 103 for our preloaded font today? Wave B verifies via `curl -I`.
- **ROIDossier code-split:** the calculator component is ~12 KB JS — confirm it isn't on the critical path post-split (it's below the fold, so `ssr: false` should be safe).
- **Cormorant SC:** stakeholder sign-off needed on the wordmark line change before dropping the family. The recommendation above is the engineer's read; brand owns the decision.
