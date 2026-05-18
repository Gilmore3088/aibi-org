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
- [x] A2. Re-measure Lighthouse, log result in audit trail (2026-05-18 — mobile / Perf 98, LCP 2.44s; desktop Perf 100, LCP 0.60s; logged in plan "Where we are" table)
- [x] A3. Split Newsreader font config in `layout.tsx`:
  - `newsreaderHero` — `weight: ['400']`, `style: ['normal','italic']`, `preload: true` → `--font-newsreader-hero`
  - `newsreaderHeavy` — `weight: ['500','600','700']`, `style: ['normal']`, `preload: false` → `--font-newsreader-heavy`
  - Deviation from spec: spec said "both bind `--font-newsreader`", but a single CSS variable can only expose ONE next/font-generated family name. Switched to two variables chained in font-family across `tokens.css`, `tokens-ledger.css`, and the nine scoped route CSS files that referenced `--font-newsreader` directly. Documented in audit trail.
- [ ] A4. Verify no Newsreader 500-italic / 600-italic / 700-italic usage breaks visually. Spot-check pages: `/research`, `/resources/*`, `/security`, `/about`.
  - **Grep audit first:** `rg "font-(serif|newsreader)" src/ | rg -i "italic" | rg -v "font-(weight|style)" ` should return zero matches in 500/600/700 contexts. If any heavy-italic usage exists, decide: switch to upright OR re-add italic to `newsreaderHeavy.style`.
  - Browser fallback behavior: requesting weight 700 italic from the Hero family (which only has 400 italic) will render as synthesized-italic 700, not the metric-correct Newsreader 700-italic glyph set. Acceptable if no surface intentionally calls for it.
- [x] A5. Re-measure Lighthouse, log result in audit trail table (2026-05-18 — see A2; LCP gate hit on production)
- [x] A6. Verify production homepage bundle size dropped (handoff confirms 165 → 101 KB First Load JS on `/`, -39%; logged in plan "Where we are" table)

## Wave B — verification + early hints

- [x] B1. **VERIFIED 2026-05-18.** Production already emits HTTP `Link: rel=preload` headers for 5 font woff2 files. Confirmed via `curl -sLI https://www.aibankinginstitute.com/ | grep "^link:"`. Vercel auto-promotes these to HTTP 103 Early Hints on the production tier.
- [x] B2. **NOT NEEDED.** No additional `next.config.mjs` headers config required — Next's font loader already declares the preloads, and Vercel's edge handles the 103 conversion.
- [x] B3. Re-measure Lighthouse, log result (2026-05-18 — see A2; Early Hints verified, prod LCP under gate)

## Wave C — needs decision (brand cost)

- [ ] C1. **DECISION (you-only):** drop Cormorant SC and migrate the 10 small-caps surfaces to Geist tracked-uppercase? See `docs/reviews/performance-overhaul-2026-05-17.md` §"Cormorant SC tradeoff" for the visual side-by-side recommendation. Engineering recommends drop; brand owns the call. Until decided, Wave C is parked.
- [ ] C2. (If C1 = yes) Update `--font-serif-sc` token alias in `tokens.css` to point at `var(--font-geist-sans)` with `letter-spacing: 0.18em; text-transform: uppercase` baked into the `.font-serif-sc` utility in `globals.css`.
- [ ] C3. (If C1 = yes) Remove `Cormorant_SC` import + `cormorantSC.variable` binding from `layout.tsx`. Drop the `--font-cormorant-sc` class on `<body>`.
- [ ] C4. (If C1 = yes) Visual QA across the 10 known surfaces. Use the audit doc's Cormorant SC inventory section as the checklist.
- [ ] C5. **NEW (if C1 = no).** Confirm Cormorant SC stays — flip status from "Pending verification" to "Permanent" in the strategy table in `Plans/performance-optimization-2026-05-17.md`. This unblocks Wave D regardless.

## Wave D — measure + close

- [ ] D1. Run full Playwright suite (`npm run test:e2e` or whatever the project alias is) — must remain green. Particular attention to homepage hero, ROI calculator interaction, and any test that touches Newsreader italic styling.
- [x] D2. Run Lighthouse twice on `/` and one secondary route (`/assessment`) (2026-05-18 — mobile + desktop, 6 runs total against prod aibankinginstitute.com; reports saved at /tmp/lh-2026-05-18/). Averages: mobile / Perf 98 LCP 2.44s FCP 0.95s; mobile /assessment Perf 98 LCP 2.43s FCP 0.93s; desktop both routes Perf 100 LCP <0.6s. TBT 0ms / CLS 0 across all runs.
- [x] D3. Update plan + audit trail with final numbers (2026-05-18 — "Where we are" table + acceptance criteria updated with measured numbers)
- [ ] D4. Move this task file to `tasks/_done/` when LCP < 2.5s achieved. **LCP gate HIT** — D4 unblocked; defer move until A4 visual QA + D1 Playwright suite close.

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

- [x] B1. **VERIFIED 2026-05-18.** Production already emits HTTP `Link: rel=preload` headers for 5 font woff2 files. Confirmed via `curl -sLI https://www.aibankinginstitute.com/ | grep "^link:"`. Vercel auto-promotes these to HTTP 103 Early Hints on the production tier.
- [x] B2. **NOT NEEDED.** No additional `next.config.mjs` headers config required — Next's font loader already declares the preloads, and Vercel's edge handles the 103 conversion.
- [x] B3. Re-measure Lighthouse, log result (2026-05-18 — see A2; Early Hints verified, prod LCP under gate)

## Wave C — needs decision (brand cost)

- [ ] C1. **DECISION (you-only):** drop Cormorant SC and migrate the 10 small-caps surfaces to Geist tracked-uppercase? See `docs/reviews/performance-overhaul-2026-05-17.md` §"Cormorant SC tradeoff" for the visual side-by-side recommendation. Engineering recommends drop; brand owns the call. Until decided, Wave C is parked.
- [ ] C2. (If C1 = yes) Update `--font-serif-sc` token alias in `tokens.css` to point at `var(--font-geist-sans)` with `letter-spacing: 0.18em; text-transform: uppercase` baked into the `.font-serif-sc` utility in `globals.css`.
- [ ] C3. (If C1 = yes) Remove `Cormorant_SC` import + `cormorantSC.variable` binding from `layout.tsx`. Drop the `--font-cormorant-sc` class on `<body>`.
- [ ] C4. (If C1 = yes) Visual QA across the 10 known surfaces. Use the audit doc's Cormorant SC inventory section as the checklist.
- [ ] C5. (If C1 = no) Confirm Cormorant SC stays — flip status from "Pending verification" to "Permanent" in the strategy table in `Plans/performance-optimization-2026-05-17.md`. This unblocks Wave D regardless.

## Wave D — measure + close

- [ ] D1. Run full Playwright suite (`npm run test:e2e` or whatever the project alias is) — must remain green. Particular attention to homepage hero, ROI calculator interaction, sign-out flow (now goes through server action), assessment email-gate auto-fill, PDF download, magic-link send.
- [x] D2. Run Lighthouse twice on `/` and one secondary route (`/assessment`) (2026-05-18 — same measurement covers both Wave D and Wave A+ Wave D; see Wave D D2 above for averages).
- [x] D3. Update plan + audit trail with final numbers (2026-05-18 — "Where we are" table + acceptance criteria updated).
- [ ] D4. Move this task file to `tasks/_done/` when LCP < 2.5s achieved. If LCP plateaus above 2.5s after Waves A+B+C, document the new floor in the audit trail and close the plan as PARTIAL with the achieved score.

## Wave E — newly identified post-Wave-A+ opportunities

Each item is independently shippable. Estimates are conservative.

### E.1 — Investigate "Failed to find font override values for font `Newsreader`" build warning (~CLS impact) (PARTIALLY INVESTIGATED 2026-05-17)
- [x] E1.1. **DONE.** Reproduced cleanly. Warning fires four times per build (twice for Hero, twice for Heavy — `next build` runs the font loader once per server + once per client bundle).
- [x] E1.2. **DONE.** Root cause confirmed by inspecting the generated CSS: `__Newsreader_<hash>` has NO companion `_Fallback` family. By contrast, `__JetBrains_Mono_Fallback_<hash>` and `__GeistSans_Fallback_<hash>` both exist with `ascent-override: 75.79%; descent-override: 22.29%; size-adjust: 134.59%` etc. So Next IS computing synthetic fallbacks for the fonts it can, just not Newsreader. Likely cause: Newsreader's metrics aren't in `@next/font`'s bundled font-metric database (it's a 2022 Google Fonts addition).
- [x] E1.3. **DONE.** Attempted `adjustFontFallback: 'Times New Roman'` — TypeScript error. That option is `boolean` only for `next/font/google` (the string variant is `next/font/local` exclusive). Reverted. Documented the known issue inline in `src/app/layout.tsx`.
- [x] E1.4. **SHIPPED (`fbdf9ea`).** Manual `Newsreader Fallback` @font-face in `globals.css` wraps Times New Roman with overrides derived from Newsreader's font tables (size-adjust 114.85%, ascent-override 95%, descent-override 25%, line-gap 0%). Chained into `--font-serif` + `--ledger-serif`. CLS hop on first paint eliminated. Build warning still fires (cosmetic) but visible effect is gone.
- [x] E1.5. Lighthouse CLS check on `/` — CLS = 0 across all 6 runs (mobile + desktop, 2026-05-18). The Newsreader fallback hop is gone. Playwright LayoutShift trace remains a follow-up (covered under D1 Playwright suite).

### E.2 — Lazy-load late-flow components on /assessment (SHIPPED 2026-05-17 `4f61dad`)
- [x] E2.1. **SHIPPED.** Lazy-loaded `ResultsViewV2` (the wrapper for SignupModal + PdfDownloadButton + tier-rendering) via `next/dynamic({ ssr: false })` in `src/app/assessment/page.tsx`. Measured: /assessment First Load JS 127 → 106 KB (-21 KB, -16%). Combined with Wave A+, /assessment total drop is 190 → 106 KB (-44%).
- [ ] E2.2. Optional follow-up: lazy-load PdfDownloadButton + SignupModal *inside* ResultsViewV2 too — that would help `/results/[id]` (currently 111 KB, server-renders ResultsViewV2 so the top-level lazy-load doesn't apply there). Estimated additional savings: ~5-9 KB. Trade-off is a first-click latency on Download PDF + Create Account.

### E.3 — Audit dashboard for client-bundle bloat (MOSTLY SHIPPED 2026-05-17 via E.11)
- [x] E3.1. **DONE via bundle analyzer.** `/dashboard` page chunk was 272 KB parsed / 80 KB gzipped.
- [x] E3.2. **SHIPPED via the `sideEffects` declaration in E.11.** Tree-shaking now drops the unused content barrels. `/dashboard` First Load JS dropped 208 → 135 KB (-73 KB, -35%); analyzer chunk dropped 272 → 134 KB parsed / 80 → 36 KB gz (-55%).
- [ ] E3.3. **Optional remaining work.** Convert `/dashboard/page.tsx` from 'use client' to a server component for additional FCP improvement. The bundle problem is now fixed by tree-shaking; this would be a separate hydration-cost optimization. Lower priority than other open items.

### E.11 — `sideEffects` declaration enabling tree-shaking (SHIPPED 2026-05-17 `bb418c4`)
- [x] E11.1. **SHIPPED.** Added a scoped `sideEffects` allow-list to `package.json` (CSS imports, src/styles/**, src/middleware.ts). Webpack now tree-shakes barrel-export modules like `@content/courses/foundation-program/index.ts`, which previously re-exported the full module tree (modules + module-1..12 + prompt-library + output-examples + v4-expanded-modules etc) and forced everything to bundle even when consumers only referenced `{ modules }`.
- [x] E11.2. **Measured.** `/dashboard` First Load JS: 208 → 135 KB (-73 KB, **-35%**). Dashboard page chunk gzipped: 80 → 36 KB (-44 KB, -55%). Single biggest bundle win of the May 2026 perf session.
- [x] E11.3. **Other routes unchanged** — they don't import the heavy content barrels. The `sideEffects` declaration is safe for the existing codebase (no actual side effects in pure-data modules).

### E.4 — Audit /courses/foundation/program/[module] (140 KB First Load JS) (SHIPPED 2026-05-18 via PR #171)
- [x] E4.1. **DONE via bundle analyzer.** Page chunk is 177 KB parsed / **41 KB gzipped**. Server component (uses `notFound`, `redirect`) but imports the full module content tree.
- [x] E4.2. **SHIPPED 2026-05-18 via PR #171.** Bundle analyzer treemap proved the original premise wrong — V4 module content and `foundationCourseConfig` never crossed the server/client boundary (all consumers are server components; data stays in the RSC payload, doesn't enter the client JS chunk). The actual culprit was `ActivitySection.tsx` — a `'use client'` component statically importing **6 specialized activity widgets** (`SkillDiagnosis`, `SkillBuilder`, `SubscriptionInventory`, `IterationTracker`, `ClassificationDrill`, `AcceptableUseCardForm`) even though each module renders at most one. Switched to `next/dynamic` with SSR enabled (no first-paint flash). Result: route-specific JS **41.4 kB → 18.1 kB (-56%)**; First Load JS **140 kB → 117 kB (-16%)**. Single-file change to `src/app/courses/foundation/program/_components/ActivitySection.tsx`.
- [x] E4.3. **NOT NEEDED.** The "split modules barrel + dynamic-import per module" approach was the original hypothesis but is moot — the 3 consumers of `V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER` are all server components, so the barrel's data never reaches the client bundle. Splitting would only have benefited the server build's startup cost (negligible). The actual client-side win was the activity-widget code split in E4.2.

### E.5 — Optimize HeroHeadlineSvg (SHIPPED 2026-05-17 `fe3bd48`)
- [x] E5.1. **SHIPPED.** Ran `npx svgo --multipass --precision=3` over the Satori output. 20.6 KB → 10.4 KB (-49%). SVGO dropped the `<mask>` + `<g>` scaffolding Satori emits for layout grouping; consolidated each glyph cluster into a single `<path>`. Visually identical.
- [x] E5.2. **SHIPPED.** Baked the SVGO pass into `scripts/gen-hero-svg.mjs` via `execSync('npx --yes svgo ...')`. Future regenerations stay optimized. Wrapped in try/catch so an offline regenerate still works (with a heavier SVG).

### E.6 — public/fonts directory cleanup (deploy-size, not runtime) (SHIPPED 2026-05-17 `09100a6`)
- [x] E6.1. **SHIPPED.** Moved 2.4 MB of TTFs from `public/fonts/` to `assets/pdf-fonts/`. Updated all three consumers (`safe-ai-use/route.ts`, `CertificateDocument.tsx`, `generate-static-artifacts.mjs`). No runtime change; lighter deploy artifact.

### E.7 — Static-generate the homepage (currently `ƒ` — dynamic)
- [ ] E7.1. `/` is rendered dynamically (`ƒ` in the build output) because `HomeContextStrip` calls `cookies()`. For anonymous traffic, that work is wasted — `HomeContextStrip` immediately returns null. Two paths to a static `/`:
  - (a) Move `HomeContextStrip` into a client island that fetches `/api/auth/me`. Costs the extra JS we just removed.
  - (b) Lift `HomeContextStrip` into a parent layout segment that's still dynamic (eg `app/(authed-aware)/layout.tsx`), letting the homepage itself stay fully static. Page renders from edge cache for the 90% case; the dynamic auth-aware strip becomes a server-streamed slot.
  - (c) Use Next's `dynamic = 'force-static'` + `unstable_noStore()` only on the strip's sub-fetches. Riskier.
  Recommend option (b). Document in the audit trail before doing.

### E.8 — Tailwind CSS bloat audit
- [ ] E8.1. The main CSS chunk loaded on every page is 55 KB raw (`c06410d29a662799.css`). Some of that is unused utilities. Add `@next/bundle-analyzer`-equivalent for CSS, OR run a one-time analysis with `tailwindcss --content "src/**/*.{tsx,ts}" --output /tmp/css-bloat.css --postcss postcss.config.js -m` to see the post-purge size and identify orphan utilities.
- [x] E8.2. **SHIPPED (`176a71f`).** Removed `./content/**/*.{md,mdx}` from Tailwind content path. Verified MDX files have zero `className=` references. Hygiene win; no measurable CSS delta.

### E.9 — Bundle analyzer (one-time tooling install) (SHIPPED 2026-05-17 `34b0bba`)
- [x] E9.1. **SHIPPED.** `@next/bundle-analyzer` added as devDependency. Wired in `next.config.mjs` behind `ANALYZE=true`. New npm script: `npm run analyze`. Outputs `client.html`, `edge.html`, `nodejs.html` under `.next/analyze/`.
- [x] E9.2. **DONE.** First analyzer run identified the heavy chunks (data captured in E.3 + E.4 entries). Top page-specific client chunks: `/dashboard/page` 272 KB / 80 KB gz, `/courses/foundation/program/[module]/page` 177 KB / 41 KB gz, `/dashboard/toolbox/page` 106 KB / 30 KB gz. Framework floor is `fd9d1056-*` (React/Vendor) at 173 KB / 54 KB gz.

### E.10 — Trim unused next/font weights + subset declarations (PARTIALLY SHIPPED 2026-05-17 `09100a6`)
- [x] E10.1. **SHIPPED.** Audited every `font-serif-sc` and `font-mono` usage in src/. Dropped:
  - Cormorant SC weights 500, 600, 700 (no usage; only 400 inherited via the `.font-serif-sc` utility)
  - JetBrains Mono weight 500 (no `font-mono font-medium` anywhere; only 400 default + 600 via `font-semibold`)
  Net effect: shared layout CSS shrank from 78 KB (two files) to 70 KB (one file).
- [ ] E10.2. **Open.** Subset declarations still emit cyrillic + vietnamese + greek + latin-ext blocks. Next 14.2.x doesn't expose a way to suppress these (the unicode-range mechanism is intentional — browsers only fetch the woff2 when a glyph in that range is needed). Low-priority follow-up — patching @next/font isn't worth ~2 KB of CSS.

---

## Follow-ups from Wave A (lower-priority, not yet scheduled)

- **`SchemaProductMark` / wordmark dependency on Newsreader 400 italic.** The hero subhead `<em>` italic glyph comes from the hero family. Confirm via DevTools "Computed fonts" panel on `/`. If a stale CDN fallback ever serves a non-italic glyph, the fix is the Wave B Early Hints preload — but worth verifying empirically.
- **Other route Lighthouse scores.** Plan currently only acceptance-tests `/`. Add `/assessment`, `/dashboard`, `/courses/foundation/program` to Wave D so we have a baseline before the next perf cycle.
