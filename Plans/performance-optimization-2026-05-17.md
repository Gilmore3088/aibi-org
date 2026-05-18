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

| Metric | Baseline (2026-05-17 AM) | Current (2026-05-17 PM) | Post-Wave A+ (2026-05-17 evening) |
|--------|-------|-------|-------|
| Performance | 89 | 92 | **TBD (re-measure pending)** |
| LCP (Lighthouse) | 3.8s | 3.3s | **TBD** |
| LCP (real users via Playwright unthrottled) | ~440ms | ~440ms | ~440ms (no regression expected) |
| FCP | 0.9s | 0.9s | TBD |
| TBT | 0ms | 0ms | TBD |
| CLS | 0 | 0 | TBD |
| Total page weight | 599 KiB | 508 KiB (-91) | TBD |
| Homepage First Load JS | 165 KB | 165 KB | **101 KB (-64 KB, -39%)** |
| /assessment First Load JS | 190 KB | 190 KB | **106 KB (-84 KB, -44%)** ← lazy-load ResultsViewV2 shaved another 21 KB |
| /results/[id] First Load JS | 174 KB | 174 KB | **111 KB (-63 KB, -36%)** |
| /dashboard First Load JS | 208 KB | 208 KB | **135 KB (-73 KB, -35%)** ← `sideEffects` declaration unlocked content-barrel tree-shaking |
| Hero SVG inline HTML | 20.6 KB | 20.6 KB | **10.4 KB (-49%)** via SVGO |

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
| 6 | **Drop Supabase JS SDK from marketing routes** | **~64 KB JS wire / ~230 KB raw** | None | **Shipped (Wave A+, `3f92c4f`)** — biggest single win |

## Already shipped this session

| # | Change | Impact | Commit |
|---|--------|--------|--------|
| A | Removed Cormorant Garamond, DM Sans, DM Mono (zero-reference, dead weight) | -91 KB | `eb13838` |
| B | Dropped Newsreader weight 300 (zero references) | -1 font file | `eb13838` |
| C | Inline-SVG homepage H1 (pre-rasterized vector paths) | Permanent LCP shield for the H1 element | `4f2a4e8` |
| D | Reverted `display: optional` (no measurable Lighthouse benefit) | Brand preserved | `eb13838` |
| E | Reverted lede SVG + combined hero SVG (regressed FCP, no LCP gain) | Net negative experiments removed | `b6ca19d`, `8f2df9c` |
| F | **Wave A** — ROIDossier code-split + Newsreader split into hero (400 + italic, preload) and heavy (500/600/700, no preload, no italic) | -3 italic font files; ROI calculator JS deferred below-the-fold | `13e7f65` |
| G | **Wave A+** — Drop Supabase JS SDK from marketing routes. HomeContextStrip → async server component. AuthDropdown signOut → server action. EmailGate / PdfDownloadButton → fetch `/api/auth/me`. SignupModal magic link → server action. | **-64 KB First Load JS across every marketing route** (home, assessment, results, about, security, education, …) | `3f92c4f` |
| H | **SVGO the hero SVG** — Satori's mask/<g> scaffolding stripped, precision-3 path coordinates | -10 KB inline HTML on every homepage render (20.6 → 10.4 KB SVG) | `fe3bd48` |
| I | **Lazy-load ResultsViewV2 on /assessment** — `next/dynamic({ ssr: false })`; renders only after question phase + email capture | **-21 KB First Load JS on /assessment** (127 → 106) | `4f61dad` |
| J | **Move TTF fonts off public/** + **drop unused font weights** (Cormorant SC 500/600/700, JetBrains Mono 500) | -2.4 MB deploy size; -8 KB CSS on every page load | `09100a6` |
| K | **`@next/bundle-analyzer` wired behind `ANALYZE=true`** | No runtime change. Treemap surfaces future regressions before they ship. | `34b0bba` |
| L | **`sideEffects` declaration in package.json — enables webpack tree-shaking of content barrels** | **-73 KB First Load JS on /dashboard** (208 → 135). Dashboard page chunk gzipped: 80 → 36 KB (-55%). Single biggest bundle win of the session. | `bb418c4` |

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
