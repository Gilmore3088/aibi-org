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
- [ ] A4. Verify no Newsreader 500-italic / 600-italic / 700-italic usage breaks visually. Spot-check pages: `/research`, `/resources/*`, `/security`, `/about`.
  - **Grep audit first:** `rg "font-(serif|newsreader)" src/ | rg -i "italic" | rg -v "font-(weight|style)" ` should return zero matches in 500/600/700 contexts. If any heavy-italic usage exists, decide: switch to upright OR re-add italic to `newsreaderHeavy.style`.
  - Browser fallback behavior: requesting weight 700 italic from the Hero family (which only has 400 italic) will render as synthesized-italic 700, not the metric-correct Newsreader 700-italic glyph set. Acceptable if no surface intentionally calls for it.
- [ ] A5. Re-measure Lighthouse, log result in audit trail table. Build must be clean before measuring — the parallel commit `13e7f65` shipped the InDepthRunner fix so this is now unblocked.
- [ ] A6. **NEW.** Verify production homepage bundle size dropped by re-running `npm run build` and comparing the `/` route's First Load JS line against the audit trail's pre-Wave-A baseline (508 KiB total page weight). Append delta to the metrics table.

## Wave B — verification + early hints

- [ ] B1. Verify Vercel emits Early Hints (HTTP 103) for the preloaded Newsreader 400 woff2. `curl -I https://aibankinginstitute.com/ | grep -i "^link:"` — look for `</...Newsreader...woff2>; rel=preload; as=font`. Repeat on a Vercel preview URL to confirm parity.
- [ ] B2. If not, configure via `next.config.mjs` headers or Vercel edge config. Reference: Next.js `headers()` returning a `Link` header with `rel=preload` survives Vercel's edge proxy and gets promoted to HTTP 103 Early Hints in production tier.
- [ ] B3. Re-measure Lighthouse, log result

## Wave C — needs decision (brand cost)

- [ ] C1. **DECISION (you-only):** drop Cormorant SC and migrate the 10 small-caps surfaces to Geist tracked-uppercase? See `docs/reviews/performance-overhaul-2026-05-17.md` §"Cormorant SC tradeoff" for the visual side-by-side recommendation. Engineering recommends drop; brand owns the call. Until decided, Wave C is parked.
- [ ] C2. (If C1 = yes) Update `--font-serif-sc` token alias in `tokens.css` to point at `var(--font-geist-sans)` with `letter-spacing: 0.18em; text-transform: uppercase` baked into the `.font-serif-sc` utility in `globals.css`.
- [ ] C3. (If C1 = yes) Remove `Cormorant_SC` import + `cormorantSC.variable` binding from `layout.tsx`. Drop the `--font-cormorant-sc` class on `<body>`.
- [ ] C4. (If C1 = yes) Visual QA across the 10 known surfaces. Use the audit doc's Cormorant SC inventory section as the checklist.
- [ ] C5. **NEW (if C1 = no).** Confirm Cormorant SC stays — flip status from "Pending verification" to "Permanent" in the strategy table in `Plans/performance-optimization-2026-05-17.md`. This unblocks Wave D regardless.

## Wave D — measure + close

- [ ] D1. Run full Playwright suite (`npm run test:e2e` or whatever the project alias is) — must remain green. Particular attention to homepage hero, ROI calculator interaction, and any test that touches Newsreader italic styling.
- [ ] D2. Run Lighthouse twice on `/` and one secondary route (`/assessment`). Average the two runs per metric (Performance, LCP, FCP, TBT, CLS, total weight).
- [ ] D3. Update plan + audit trail with final numbers. Refresh the "Where we are" table in the plan with new "Current" column dated 2026-05-1X.
- [ ] D4. Move this task file to `tasks/_done/` when LCP < 2.5s achieved. If LCP plateaus above 2.5s after Waves A+B+C, document the new floor in the audit trail and close the plan as PARTIAL with the achieved score; don't keep grinding indefinitely.

---

## Follow-ups surfaced during Wave A (not yet scheduled)

- **`SchemaProductMark` / wordmark dependency on Newsreader 400 italic.** The hero subhead `<em>` italic glyph comes from the hero family. Confirm via DevTools "Computed fonts" panel on `/`. If a stale CDN fallback ever serves a non-italic glyph, the fix is the Wave B Early Hints preload — but worth verifying empirically.
- **Other route Lighthouse scores.** Plan currently only acceptance-tests `/`. Add `/assessment`, `/dashboard`, `/courses/foundation/program` to Wave D so we have a baseline before the next perf cycle.
- **Bundle visualizer.** No tooling currently breaks down the homepage's JS chunks by package. Consider `@next/bundle-analyzer` as a one-time `dev`-dependency add to confirm ROIDossier's chunk landed in a separately-fetched `_next/static/chunks/sections-ROIDossier-*.js` (or similar). Out of scope for this plan; capture as a separate ticket if useful.
