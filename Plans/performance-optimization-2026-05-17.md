---
status: active
created: 2026-05-17
owner-tasks: tasks/performance-optimization-2026-05-17.md
audit-trail: docs/reviews/performance-overhaul-2026-05-17.md
---

# Performance Optimization — May 2026

## Goal

Lighthouse Performance ≥ 95, LCP < 2.5s on the homepage, while
preserving the Newsreader + Cormorant SC + Geist + JetBrains Mono
brand stack.

## Where we are (start of plan)

| Metric | Baseline (2026-05-17 AM) | Current (2026-05-17 PM) |
|--------|-------|-------|
| Performance | 89 | **92** |
| LCP (Lighthouse) | 3.8s | **3.3s** |
| LCP (real users via Playwright unthrottled) | ~440ms | ~440ms |
| FCP | 0.9s | 0.9s |
| TBT | 0ms | 0ms |
| CLS | 0 | 0 |
| Total page weight | 599 KiB | 508 KiB (-91) |

Real-user LCP is already great. Lighthouse synthetic 4G shows 3.3s
because **the page is network-bound at simulated bandwidth** — 508 KB
takes ~3s to deliver on Lighthouse's Slow 4G profile.

## Strategy

Lighthouse LCP cannot drop below ~3s while the page weight stays at
508 KB on throttled 4G. Adding inline content (we tried SVG hero
blocks) makes FCP worse without helping LCP. **The only path to
< 2.5s is reducing total bytes**, primarily by trimming font payload.

Five workstreams, ranked by impact ÷ risk:

| # | Change | Bytes saved | Brand cost | Status |
|---|--------|-------------|------------|--------|
| 1 | Code-split ROIDossier (next/dynamic) | ~10-30 KB JS | None | **Shipped (Wave A, `13e7f65`)** |
| 2 | Drop italic from Newsreader 500/600/700 | ~90 KB fonts | Heavy-weight `<em>` becomes synthesized italic OR upright | **Shipped (Wave A, `13e7f65`)** — done via the hero/heavy split below |
| 3 | Drop Cormorant SC, use Geist tracked-uppercase | ~50 KB fonts | Small-caps surfaces become tracked sans | **Deferred** (Wave C — brand decision) |
| 4 | `preload: false` on heavy Newsreader weights | 0 KB on disk; frees critical path | None | **Shipped (Wave A, `13e7f65`)** |
| 5 | Vercel Early Hints for Newsreader 400 woff2 | 100-300ms latency | None | **Pending verification** (Wave B) |

## Already shipped this session

| # | Change | Impact | Commit |
|---|--------|--------|--------|
| A | Removed Cormorant Garamond, DM Sans, DM Mono (zero-reference, dead weight) | -91 KB | `eb13838` |
| B | Dropped Newsreader weight 300 (zero references) | -1 font file | `eb13838` |
| C | Inline-SVG homepage H1 (pre-rasterized vector paths) | Permanent LCP shield for the H1 element | `4f2a4e8` |
| D | Reverted `display: optional` (no measurable Lighthouse benefit) | Brand preserved | `eb13838` |
| E | Reverted lede SVG + combined hero SVG (regressed FCP, no LCP gain) | Net negative experiments removed | `b6ca19d`, `8f2df9c` |
| F | **Wave A** — ROIDossier code-split + Newsreader split into hero (400 + italic, preload) and heavy (500/600/700, no preload, no italic) | -3 italic font files; ROI calculator JS deferred below-the-fold | `13e7f65` |

Five Lighthouse audit reports document each attempt — see
[`docs/reviews/performance-overhaul-2026-05-17.md`](../docs/reviews/performance-overhaul-2026-05-17.md)
for the full audit trail with metrics.

## Acceptance criteria

- Lighthouse Performance ≥ 95 on `/`
- LCP < 2.5s on Lighthouse Slow 4G simulation
- FCP not worse than 1.0s
- TBT ≤ 50ms, CLS ≤ 0.05
- No visual regression on the Ledger brand (Newsreader headlines,
  Cormorant SC small caps for those decisions kept, Geist body)
- Full Playwright suite still 106+ passing

## Out of scope

- LCP optimization on routes other than `/` (re-measure post-launch)
- WebP / AVIF image conversion (no rasters above the fold)
- Service worker / PWA (separate spec)
- HTTP/3 (Vercel handles)
