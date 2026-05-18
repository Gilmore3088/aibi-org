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

## Wave A+ — Supabase JS SDK off the marketing critical path (SHIPPED 2026-05-17 `3f92c4f`)

- [x] AP1. Convert `HomeContextStrip` from `'use client'` to async server component. Read Supabase session via `cookies()` + `createServerClientWithCookies`. Return `null` for anonymous users so no client JS ships at all.
- [x] AP2. Add `signOutAction` server action in `src/app/auth/actions.ts`. Clears every `sb-*` cookie directly + redirects to `/`. Does not import `@/lib/supabase` so the action stays free of SDK code.
- [x] AP3. Rewire `AuthDropdown` to call `signOutAction` instead of `signOut()`. Drop the now-unused `useRouter`.
- [x] AP4. Add `sendMagicLinkAction` server action. Reads origin from request headers, calls `supabase.auth.signInWithOtp` server-side.
- [x] AP5. Rewire `SignupModal` to call `sendMagicLinkAction` instead of `signInWithMagicLink`.
- [x] AP6. Rewire `EmailGate`'s auto-fill-from-session path to `fetch('/api/auth/me')` instead of `createBrowserClient()`.
- [x] AP7. Rewire `PdfDownloadButton`'s "is signed in?" gate to `fetch('/api/auth/me')` instead of `createBrowserClient()`.
- [x] AP8. Measure: First Load JS for `/`, `/assessment`, `/results/[id]`, `/about` from build output. **All four dropped ~64 KB.**

### Wave A+ post-ship validation (open)

- [ ] AP9. Manual smoke test on a Vercel preview: sign in → land on `/` → confirm the welcome-back band renders → click avatar → sign out → confirm redirect to `/` AND that the auth cookie is gone (DevTools → Application → Cookies, the `sb-*` entries should be cleared).
- [ ] AP10. Manual smoke test: take the assessment as a signed-in user → confirm `EmailGate` auto-fills email and skips the form. As anonymous user, confirm the form still renders normally.
- [ ] AP11. Manual smoke test: complete an In-Depth assessment → on the results page, click "Download PDF" while signed out → confirm the auth-prompt UI appears. Sign in → retry → confirm the PDF downloads.
- [ ] AP12. Manual smoke test: open the SignupModal from a result page → submit email → confirm "magic link sent" UI shows AND that the email arrives in the inbox. (`sendMagicLinkAction` is the most novel change — magic-link delivery is the highest-risk regression.)
- [ ] AP13. Playwright suite: run the full e2e against `npm run dev` locally and on a Vercel preview. The auth tests are the failure mode here — they cover sign-up → sign-in → sign-out and may need updating if they relied on the old `signOut()` client behavior (router.push vs. server redirect).
- [ ] AP14. Look at the auth callback flow on `/auth/callback`: confirm magic link from `sendMagicLinkAction` still hits the same callback URL and exchanges correctly. The action derives origin from `x-forwarded-host` + proto headers; verify behind Vercel's edge proxy this still produces the right URL (not the internal Vercel proxy hostname).

## Wave B — verification + early hints

- [ ] B1. Verify Vercel emits Early Hints (HTTP 103) for the preloaded Newsreader 400 woff2. `curl -I https://aibankinginstitute.com/ | grep -i "^link:"` — look for `</...Newsreader...woff2>; rel=preload; as=font`. Repeat on a Vercel preview URL to confirm parity.
- [ ] B2. If not, configure via `next.config.mjs` headers or Vercel edge config. Reference: Next.js `headers()` returning a `Link` header with `rel=preload` survives Vercel's edge proxy and gets promoted to HTTP 103 Early Hints in production tier.
- [ ] B3. Re-measure Lighthouse, log result

## Wave C — needs decision (brand cost)

- [ ] C1. **DECISION (you-only):** drop Cormorant SC and migrate the 10 small-caps surfaces to Geist tracked-uppercase? See `docs/reviews/performance-overhaul-2026-05-17.md` §"Cormorant SC tradeoff" for the visual side-by-side recommendation. Engineering recommends drop; brand owns the call. Until decided, Wave C is parked.
- [ ] C2. (If C1 = yes) Update `--font-serif-sc` token alias in `tokens.css` to point at `var(--font-geist-sans)` with `letter-spacing: 0.18em; text-transform: uppercase` baked into the `.font-serif-sc` utility in `globals.css`.
- [ ] C3. (If C1 = yes) Remove `Cormorant_SC` import + `cormorantSC.variable` binding from `layout.tsx`. Drop the `--font-cormorant-sc` class on `<body>`.
- [ ] C4. (If C1 = yes) Visual QA across the 10 known surfaces. Use the audit doc's Cormorant SC inventory section as the checklist.
- [ ] C5. (If C1 = no) Confirm Cormorant SC stays — flip status from "Pending verification" to "Permanent" in the strategy table in `Plans/performance-optimization-2026-05-17.md`. This unblocks Wave D regardless.

## Wave D — measure + close

- [ ] D1. Run full Playwright suite (`npm run test:e2e` or whatever the project alias is) — must remain green. Particular attention to homepage hero, ROI calculator interaction, sign-out flow (now goes through server action), assessment email-gate auto-fill, PDF download, magic-link send.
- [ ] D2. Run Lighthouse twice on `/` and one secondary route (`/assessment`). Average the two runs per metric (Performance, LCP, FCP, TBT, CLS, total weight). Compare to the pre-Wave-A+ baseline (165 / 190 KB → 101 / 127 KB).
- [ ] D3. Update plan + audit trail with final numbers. Refresh the "Where we are" table in the plan with new "Current" column dated 2026-05-1X.
- [ ] D4. Move this task file to `tasks/_done/` when LCP < 2.5s achieved. If LCP plateaus above 2.5s after Waves A+B+C, document the new floor in the audit trail and close the plan as PARTIAL with the achieved score.

## Wave E — newly identified post-Wave-A+ opportunities

Each item is independently shippable. Estimates are conservative.

### E.1 — Investigate "Failed to find font override values for font `Newsreader`" build warning (~CLS impact)
- [ ] E1.1. Reproduce: clean build, capture stderr alongside stdout (`npm run build 2>&1 > log` then check for the warning). The warning appears four times — once per route bundle that uses Newsreader.
- [ ] E1.2. Root-cause: when Next can't compute a size-adjusted fallback metric for a custom font, it skips the fallback `font-family` override. Result: the unstyled fallback (Iowan / Georgia) doesn't get sized to match Newsreader, so when Newsreader loads there's a layout shift. Confirm by checking if `--font-newsreader-hero-fallback` and `--font-newsreader-heavy-fallback` CSS rules are missing in the generated stylesheet.
- [ ] E1.3. Fix candidates: (a) ensure `adjustFontFallback` defaults to `true` (it should — but the warning suggests Next failed to find the source font's ascent/descent metrics for the synthetic fallback). (b) pin the `next` minor version since this changed in 14.2.x. (c) supply explicit `adjustFontFallback: 'Times New Roman'` to nudge Next toward a known metric source.
- [ ] E1.4. Verify post-fix: CLS score on `/` stays at 0 (Lighthouse). Run Playwright with `chromium --enable-features=LayoutInstabilityAPI` and trace the LayoutShift events on hero render.

### E.2 — Lazy-load SignupModal + PdfDownloadButton on /assessment
- [ ] E2.1. These two components only render late in the assessment flow (after results, after email capture). Wrap them in `next/dynamic({ ssr: false })` from the results-view file. Expected savings: another ~5-10 KB First Load JS off `/assessment` since the React import graph stops eagerly bundling them.

### E.3 — Audit dashboard for client-Supabase footguns
- [ ] E3.1. `/dashboard` is 208 KB First Load JS. The Supabase chunk does NOT load anymore (Wave A+ removed eager imports), so the 208 KB is something else. Run `cat .next/app-build-manifest.json | jq '.pages["/dashboard/page"]'` and identify the biggest unique chunk(s).
- [ ] E3.2. Likely culprit: `marked` (markdown renderer in chunk 8458, ~77 KB). Confirm and decide if it's needed eagerly or can be code-split / replaced with a lighter renderer (`marked-async`, `mdast-util-to-html`, or inline server-rendered HTML).
- [ ] E3.3. Also check `5861` chunk (10 KB, includes `query` — possibly @tanstack/react-query?). If unused on dashboard, drop the dep entirely.

### E.4 — Audit /courses/foundation/program/[module] (140 KB First Load JS)
- [ ] E4.1. This route ships 41 KB of page-specific JS plus the framework. Profile it: which components/imports are pulling weight? CourseShell, the post-assessment widget, the practice rep player?
- [ ] E4.2. If `marked` is used here too, same code-split decision applies.

### E.5 — Optimize HeroHeadlineSvg
- [ ] E5.1. The inline SVG is 21.7 KB (one giant `path d=` of 20.6 KB). Run SVGO (`npx svgo src/components/_generated/hero-headline.svg --multipass`) and check the diff. Many path-coordinate decimals can usually be reduced from 4 to 2 digits with no visual loss.
- [ ] E5.2. Decide: re-generate via `node scripts/gen-hero-svg.mjs` with an SVGO post-process step baked in, OR commit the SVGO'd output directly and add a note to the generator.

### E.6 — public/fonts directory cleanup (deploy-size, not runtime)
- [ ] E6.1. `public/fonts/` is 2.4 MB of Cormorant + DM Sans TTF files used by `react-pdf` for PDF certificates (server-side only). Move to a non-public path (e.g. `assets/pdf-fonts/` at the repo root, or `src/lib/pdf/fonts/`) and update the route handler's `path.join` to read from there. Cuts the deployed bundle size by 2 MB, doesn't change runtime.

### E.7 — Static-generate the homepage (currently `ƒ` — dynamic)
- [ ] E7.1. `/` is rendered dynamically (`ƒ` in the build output) because `HomeContextStrip` calls `cookies()`. For anonymous traffic, that work is wasted — `HomeContextStrip` immediately returns null. Two paths to a static `/`:
  - (a) Move `HomeContextStrip` into a client island that fetches `/api/auth/me`. Costs the extra JS we just removed.
  - (b) Lift `HomeContextStrip` into a parent layout segment that's still dynamic (eg `app/(authed-aware)/layout.tsx`), letting the homepage itself stay fully static. Page renders from edge cache for the 90% case; the dynamic auth-aware strip becomes a server-streamed slot.
  - (c) Use Next's `dynamic = 'force-static'` + `unstable_noStore()` only on the strip's sub-fetches. Riskier.
  Recommend option (b). Document in the audit trail before doing.

### E.8 — Tailwind CSS bloat audit
- [ ] E8.1. The main CSS chunk loaded on every page is 55 KB raw (`c06410d29a662799.css`). Some of that is unused utilities. Add `@next/bundle-analyzer`-equivalent for CSS, OR run a one-time analysis with `tailwindcss --content "src/**/*.{tsx,ts}" --output /tmp/css-bloat.css --postcss postcss.config.js -m` to see the post-purge size and identify orphan utilities.
- [ ] E8.2. Decision: consider removing the `./content/**/*.{md,mdx}` content path from `tailwind.config.ts` if no MDX file actually emits Tailwind class names. Currently it scans every markdown file and could be padding the utility list.

### E.9 — Bundle analyzer (one-time tooling install)
- [ ] E9.1. Add `@next/bundle-analyzer` as a dev dependency. Wire it into `next.config.mjs` behind `ANALYZE=true`. Run `ANALYZE=true npm run build` to get treemap of the framework + page chunks.
- [ ] E9.2. Investigate any module larger than 30 KB in the homepage chunk tree. Document findings; create follow-up tasks per significant offender.

### E.10 — Remove unused next/font subset declarations
- [ ] E10.1. The Cormorant SC @font-face block emits cyrillic + vietnamese + greek + latin-ext subsets even though we declared `subsets: ['latin']`. The woff2 files for those subsets ARE only fetched when needed (good), but the @font-face declarations themselves bloat the CSS bundle. Inspect generated CSS, decide if `next/font/google` can be configured to emit only the latin block.

---

## Follow-ups from Wave A (lower-priority, not yet scheduled)

- **`SchemaProductMark` / wordmark dependency on Newsreader 400 italic.** The hero subhead `<em>` italic glyph comes from the hero family. Confirm via DevTools "Computed fonts" panel on `/`. If a stale CDN fallback ever serves a non-italic glyph, the fix is the Wave B Early Hints preload — but worth verifying empirically.
- **Other route Lighthouse scores.** Plan currently only acceptance-tests `/`. Add `/assessment`, `/dashboard`, `/courses/foundation/program` to Wave D so we have a baseline before the next perf cycle.
