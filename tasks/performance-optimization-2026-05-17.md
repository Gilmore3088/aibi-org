# Tasks — Performance Optimization (Plans/performance-optimization-2026-05-17.md)

Companion task list for the perf overhaul plan. Track open work here.
When all boxes check, move this file to `tasks/_done/`.

## Already done (session 2026-05-17)

- [x] D1. Audit page weight breakdown (Lighthouse + network panel)
- [x] D2. Identify LCP element via Playwright PerformanceObserver
- [x] D3. Remove 3 unused font families (Cormorant Garamond, DM Sans, DM Mono)
- [x] D4. Drop Newsreader weight 300 (zero references)
- [x] D5. Test `display: optional` on Newsreader (reverted — no benefit)
- [x] D6. Inline-SVG homepage H1 via Satori (kept — permanent fix for that element)
- [x] D7. Inline-SVG lede paragraph (reverted — added 20 KB inline, no LCP gain)
- [x] D8. Inline-SVG combined hero block (reverted — FCP regressed)
- [x] D9. Document audit trail in `docs/reviews/performance-overhaul-2026-05-17.md`

## Wave A — autonomous, ~30 min total

- [x] A1. Code-split `<ROIDossier>` with `next/dynamic({ ssr: false })` on the homepage. Verify the calculator still works.
  - Implementation note: Next 14.2 disallows `ssr: false` inside server components, so the lazy import lives in a thin client wrapper at `src/components/sections/ROIDossierLazy.tsx`. The homepage imports the wrapper instead of `<ROIDossier>` directly.
- [ ] A2. Re-measure Lighthouse, log result in audit trail
- [x] A3. Split Newsreader font config in `layout.tsx`:
  - `newsreaderHero` — `weight: ['400']`, `style: ['normal','italic']`, `preload: true` → `--font-newsreader-hero`
  - `newsreaderHeavy` — `weight: ['500','600','700']`, `style: ['normal']`, `preload: false` → `--font-newsreader-heavy`
  - Deviation from spec: spec said "both bind `--font-newsreader`", but a single CSS variable can only expose ONE next/font-generated family name. Switched to two variables chained in font-family across `tokens.css`, `tokens-ledger.css`, and the nine scoped route CSS files that referenced `--font-newsreader` directly. Documented in audit trail.
- [ ] A4. Verify no Newsreader 500-italic / 600-italic / 700-italic usage breaks visually. Spot-check pages: `/research`, `/resources/*`, `/security`, `/about`
- [ ] A5. Re-measure Lighthouse, log result

## Wave B — verification + early hints

- [ ] B1. Verify Vercel emits Early Hints (HTTP 103) for the preloaded Newsreader 400 woff2. `curl -I` and check for `link` header.
- [ ] B2. If not, configure via `next.config.mjs` headers or Vercel edge config
- [ ] B3. Re-measure Lighthouse, log result

## Wave C — needs decision (brand cost)

- [ ] C1. **DECISION:** drop Cormorant SC and migrate the 10 small-caps surfaces to Geist tracked-uppercase? See `docs/reviews/performance-overhaul-2026-05-17.md` §"Cormorant SC tradeoff" for the visual side-by-side recommendation.
- [ ] C2. (If C1 = yes) Update `--font-serif-sc` token alias in `tokens.css`
- [ ] C3. (If C1 = yes) Remove `Cormorant_SC` import from `layout.tsx`
- [ ] C4. (If C1 = yes) Visual QA across the 10 known surfaces

## Wave D — measure + close

- [ ] D1. Run full Playwright suite — must remain green
- [ ] D2. Run Lighthouse twice on `/` and one secondary route (`/assessment`)
- [ ] D3. Update plan + audit trail with final numbers
- [ ] D4. Move this task file to `tasks/_done/` when LCP < 2.5s achieved
