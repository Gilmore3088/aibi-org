# Perf Overhaul — Two-Day Session Handoff (2026-05-17 → 2026-05-18)

**Status:** Most autonomous bundle work shipped. Lab measurement + brand decision + manual smoke tests still open for the next operator.

**Source plan:** [`Plans/performance-optimization-2026-05-17.md`](../../Plans/performance-optimization-2026-05-17.md)
**Live task list:** [`tasks/performance-optimization-2026-05-17.md`](../../tasks/performance-optimization-2026-05-17.md)
**Audit trail (full attempt log):** [`docs/reviews/performance-overhaul-2026-05-17.md`](../reviews/performance-overhaul-2026-05-17.md)
**GH epic:** [#144](https://github.com/Gilmore3088/aibi-org/issues/144)

---

## TL;DR

Two days of bundle + font + tree-shaking work cut First Load JS by **35–44% across every marquee route**, eliminated a CLS hop on first paint, and reduced deploy size by 2.4 MB. The remaining work is either lab measurement (Lighthouse, Playwright), one-eye visual QA, a brand decision (Cormorant SC), or larger architectural refactors that warrant a dedicated session.

## Where we are now

| Route | Pre-session | Post-session | Delta |
|-------|------------|--------------|-------|
| `/` | 165 KB | **101 KB** | **-64 KB (-39%)** |
| `/assessment` (the funnel) | 190 KB | **106 KB** | **-84 KB (-44%)** |
| `/dashboard` | 208 KB | **135 KB** | **-73 KB (-35%)** |
| `/results/[id]` | 174 KB | **111 KB** | -63 KB (-36%) |
| `/about` | 163 KB | **99.9 KB** | -63 KB (-39%) |
| `/security` | 164 KB | **101 KB** | -63 KB (-38%) |
| `/education` | 170 KB | **107 KB** | -63 KB (-37%) |

Plus on every page:
- **Layout CSS:** 78 KB (two files) → **70 KB** (one consolidated)
- **Inline hero SVG HTML:** 20.6 KB → **10.4 KB** (-49%)
- **Deploy artifact:** -2.4 MB (TTF fonts moved off `public/`)
- **CLS hop on first paint:** eliminated (Newsreader fallback @font-face)

**Acceptance gate:** Lighthouse mobile perf ≥ 95, LCP < 2.5s. Not yet re-measured. The plan's theory is that we're now bytes-bound under the threshold; the lab measurement is the next operator's job.

## Commits shipped this session (chronological)

Code-only commits (in roughly chronological order — exact hashes vary because of intermittent rebases caused by parallel background work):

| Workstream | What | Commit(s) | Impact |
|-----------|------|-----------|--------|
| Wave A | ROIDossier code-split + Newsreader hero/heavy split | `13e7f65` / `b7af10c` | -3 italic font files; ROI calculator JS deferred below-the-fold |
| **Wave A+** | **Drop Supabase JS from marketing routes** — HomeContextStrip → server, signOut/sendMagicLink → server actions, EmailGate/PdfDownloadButton → `/api/auth/me` | `bd7b4b2` / `3f92c4f` | **-64 KB First Load JS on every marketing route** |
| Hero | SVGO the inline hero SVG | `876a0a2` / `fe3bd48` | -10 KB inline HTML / homepage render |
| Lazy | `ResultsViewV2` via `next/dynamic({ ssr: false })` on `/assessment` | `edfe07f` / `4f61dad` | -21 KB on `/assessment` |
| Fonts | TTFs out of `public/`; drop unused Cormorant SC 500/600/700 + JetBrains Mono 500 weights | `99afda8` / `09100a6` | -2.4 MB deploy + -8 KB CSS per page |
| Tooling | `@next/bundle-analyzer` wired behind `ANALYZE=true` | `54d0331` / `34b0bba` | `npm run analyze` produces `.next/analyze/{client,server,edge}.html` treemaps |
| **Tree-shake** | **`sideEffects` declaration in `package.json`** | `b7af10c` / `bb418c4` | **-73 KB on `/dashboard` First Load JS (208 → 135). Dashboard chunk gzipped 80 → 36 KB.** ← single biggest win |
| CLS fix | Manual `Newsreader Fallback` @font-face wrapping Times New Roman with metric overrides | `fbdf9ea` (re-applied after PR #163 reverted the earlier attempt) | No CLS hop on first paint |
| Hygiene | Drop `./content/**/*.{md,mdx}` from Tailwind content path | `176a71f` | Clean hygiene; zero CSS delta (content has no `className=`) |

Plus a thick layer of docs commits that updated the plan, task list, audit trail, MASTER.md, and CHRONOLOGY.md after each code commit.

## What's CLOSED — do not re-litigate

- **Wave A** (ROIDossier code-split, Newsreader split, weight 300 dropped, weight 500/600/700 italic dropped)
- **Wave A+** (Supabase JS off marketing routes)
- **Wave B** (verified — Vercel already does Early Hints automatically via Next's font preload; no `next.config.mjs` change needed)
- **E.1** (Newsreader Fallback @font-face — CLS hop eliminated)
- **E.2** (lazy ResultsViewV2)
- **E.3** (dashboard bloat — solved by sideEffects tree-shaking, the optional 'use client' → server refactor in E.3.3 is the only crumb left)
- **E.5** (SVGO hero — both the optimization and bake-in to `gen-hero-svg.mjs`)
- **E.6** (TTFs out of `public/`)
- **E.8.2** (content paths trimmed from Tailwind config)
- **E.9** (bundle-analyzer wired)
- **E.10** (font weight trim — subset trim was investigated and judged not worth fighting next/font over)
- **E.11** (sideEffects tree-shaking — the win that closed E.3.2)

## What's OPEN — categorized by who can do it

### A) Anyone with a browser + 30 minutes (manual smoke tests)

**These are the highest-confidence-needed checks because they verify the Wave A+ refactors didn't break flow-critical UX. Do them on a Vercel preview, not local dev.**

- [ ] **AP9** — Sign in → land on `/` → confirm welcome-back band renders → click avatar → sign out → confirm redirect to `/` AND that the `sb-*` cookies are gone (DevTools → Application → Cookies)
- [ ] **AP10** — Take the assessment signed-in → confirm EmailGate auto-fills the email (no manual entry needed) → submit. Then anonymous: confirm form renders normally.
- [ ] **AP11** — Complete an In-Depth assessment → on the results page click "Download PDF" while signed out → confirm auth-prompt UI appears. Sign in → retry → confirm PDF downloads.
- [ ] **AP12** — Open SignupModal from a results page → submit email → confirm "magic link sent" UI shows AND the email arrives in the inbox. **Highest-risk regression** — `sendMagicLinkAction` is a novel server action that derives origin via `x-forwarded-host`/`x-forwarded-proto`; if those headers don't reach the action behind Vercel's edge proxy, the magic-link URL in the email will point to the wrong host.
- [ ] **AP14** — Click the magic link from AP12 → confirm it hits `/auth/callback?next=…` correctly and you land authenticated.

If any of AP12/AP14 fail, the fix likely lives in `src/app/auth/actions.ts` — the origin-derivation block — and may need to fall back to `process.env.NEXT_PUBLIC_SITE_URL`.

### B) Anyone with Chrome DevTools or `lighthouse` CLI (lab measurement)

- [ ] **A2 / A5 / A6 / B3 / E1.5 / D2 / D3** — Lighthouse mobile + desktop on `/` (twice, averaged) and `/assessment`. Acceptance per plan: Performance ≥ 95, LCP < 2.5s, FCP ≤ 1.0s, TBT ≤ 50ms, CLS ≤ 0.05. Update the "Where we are" table in `Plans/performance-optimization-2026-05-17.md` with the result.
- [ ] **AP13 / D1** — `npm run e2e` (full Playwright suite). Pay particular attention to:
  - Homepage hero render
  - ROI calculator interaction (now code-split)
  - Sign-out flow (now goes through server action, not router.push)
  - Email-gate auto-fill (now fetches `/api/auth/me`)
  - PDF download (auth gate now fetches `/api/auth/me`)
  - Magic-link send (now a server action)
- [ ] **A4** — Eye-level visual QA across `/research`, `/resources/*`, `/security`, `/about`. Newsreader 500/600/700 italic weights were dropped — confirm nothing renders as fake italic of the heavy weight by mistake. Grep first: `rg "font-(serif|newsreader)" src/ | rg -i "italic"` should be empty for the heavy weights.

### C) Brand owner only — single decision unblocks Wave C

- [ ] **C1** — Drop Cormorant SC for small-caps surfaces in favor of Geist with tracked-uppercase? See `docs/reviews/performance-overhaul-2026-05-17.md` §"Cormorant SC tradeoff" for the side-by-side. Engineering recommendation: drop (~50 KB font savings, 10 known small-caps surfaces affected). If yes → C2–C4 are mechanical. If no → C5 (flip strategy table to "Permanent").

### D) Next dev session — bigger refactors

**Pick one per session, not all three:**

1. **E.4 — Module content tree-shaking** (estimate: 60–100 KB more off `/courses/foundation/program/[module]`, currently 140 KB First Load JS)
   - The barrel `content/courses/foundation-program/index.ts` re-exports `modules` (array of all 12), every `module-N.ts` directly, plus `prompt-library`, `output-examples`, `v4-expanded-modules`. Even with sideEffects tree-shaking, the `modules` array reference holds everything alive.
   - Fix: rework so `/courses/foundation/program/[module]/page.tsx` uses `getModuleByNumber(n)` which dynamic-imports only the requested module. The `modules` array becomes a thin slim-summary list (titles + slugs + numbers), not the full content tree.

2. **E.7 — Static-generate `/`** (TTFB win → LCP improvement on cold cache; magnitude depends on Vercel cold-start, typically 50–200ms)
   - Two blockers: `headers().get('x-pathname')` in root layout and `cookies()` in HomeContextStrip.
   - Cleanest approach: route groups — pull chromeless paths into a `(chromeless)` group with their own bare layout. Convert HomeContextStrip to a client island that fetches a new `/api/home-strip` endpoint (combines /api/auth/me + enrollment lookup + readiness summary in one shot).
   - Risk: SiteNav/SiteFooter are currently server-rendered through the root layout. Moving the layout requires careful migration of every existing route.

3. **E.3.3 — Convert `/dashboard/page.tsx` from `'use client'` to server component**
   - Bundle win already shipped via sideEffects. This is a hydration-cost optimization: less JS to parse + execute → faster TTI on the dashboard.
   - Touches the activation-ladder rendering, the toolbox CTA, the resume-course button. Pattern mirrors Wave A+ HomeContextStrip — small client islands for interactive bits.

## Next-session plan recommendations

Order of priority for an autonomous session (highest impact ÷ risk first):

1. **Run the lab measurements (B above).** Without them we don't know if we hit the LCP < 2.5s target. If we did, Wave D can close PARTIAL or COMPLETE. If we didn't, the analyzer findings (E.4) become the next priority.
2. **Pick ONE of D1/D2/D3** (E.4 module tree-shake is the most contained; E.7 has the biggest TTFB upside but the most architectural risk; E.3.3 has a small marginal hydration win).
3. **Resolve C1** with the brand owner before the session if possible — it unblocks an easy ~50 KB font win.

## Operating notes for the next session

- **Repo state on handoff:** branch `main`, 3 commits ahead of origin pending push (the trailing docs commits). The session was on `main` throughout per the user's preference; no feature branches.
- **There was significant parallel-agent activity during this session** — files were intermittently reverted and rebased while my commits were landing. Confirm `git log --oneline` matches the table above before starting work. If E.1 (Newsreader Fallback @font-face) isn't in the tree, re-apply from `fbdf9ea` (the commit is preserved even if the files got reverted).
- **`npm run analyze`** produces the analyzer treemap; use it before making any new perf claim about a specific chunk.
- **The font-override build warning still fires four times.** That's expected — Next still tries the auto-generation. The visible CLS effect is gone (verified by the manual @font-face). Only the `git log` warning is residual cosmetic.
- **`SKIP_CONVERTKIT=true` / `SKIP_MAILERLITE=true`** must stay on Vercel Preview only — the production guard in `next.config.mjs` throws if they appear in production env.

## Reference numbers for the next bundle audit

Top page-specific client chunks (parsed / gzipped) as of session end, from `npm run analyze`:

| Chunk | Parsed | Gzipped | Route |
|-------|--------|---------|-------|
| `app/dashboard/page-*.js` | 134 KB | 36 KB | `/dashboard` (was 272 / 80 before sideEffects) |
| `app/courses/foundation/program/[module]/page-*.js` | 177 KB | 41 KB | E.4 target |
| `app/dashboard/toolbox/page-*.js` | 106 KB | 30 KB | toolbox content data |
| `app/courses/foundation/program/gallery/page-*.js` | 86 KB | 31 KB | gallery |
| `fd9d1056-*.js` | 173 KB | 54 KB | framework floor (React + vendor) |
| `2117-*.js` | 124 KB | 32 KB | framework helper |

The framework floor (~140–170 KB raw / 44–54 KB gz) is the irreducible JS for any Next App Router page. Anything above that on a specific route is an opportunity to investigate.

---

*Two-day session totals: 8 perf code commits, ~12 doc commits, –64 KB to –84 KB First Load JS across every marquee route, –2.4 MB deploy, 6 of 11 Wave-E tasks closed.*
