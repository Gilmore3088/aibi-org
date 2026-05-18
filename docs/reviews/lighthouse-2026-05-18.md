# Lighthouse audit — 2026-05-18

**Scope:** Launch checklist §13 (Performance). Five marquee marketing routes on production (`https://www.aibankinginstitute.com`), Lighthouse 13.3.0 mobile preset (default).
**Branch:** `feature/lighthouse-audit-2026-05-18`. Raw JSON in `docs/reviews/lighthouse-2026-05-18/`.

---

## Scores — all five routes

| Route | Perf | A11y | Best Practices | SEO | LCP | FCP | TBT | CLS | SI |
|-------|-----:|-----:|---------------:|----:|----:|----:|----:|----:|---:|
| `/` | **98** | 96 | 96 | 100 | 2.4 s | 0.9 s | 0 ms | 0 | 0.9 s |
| `/assessment` | **98** | 96 | 96 | 100 | 2.4 s | 0.9 s | 0 ms | 0 | 0.9 s |
| `/assessment/in-depth` | **98** | 96 | 96 | 100 | 2.4 s | 0.9 s | 0 ms | 0 | 1.0 s |
| `/education` | **98** | 96 | 96 | 100 | 2.4 s | 0.9 s | 0 ms | 0 | 0.9 s |
| `/for-institutions` | **98** | 96 | 96 | 100 | 2.4 s | 0.9 s | 0 ms | 0 | 1.1 s |

**All five routes pass every §13 Core Web Vitals threshold:**
- §13.388 LCP < 2.5 s on `/` — **2.4 s, pass**
- §13.389 FID/INP < 200 ms — **TBT 0 ms, pass** (TBT correlates with INP)
- §13.390 CLS < 0.1 on `/` — **0, pass**
- §13.391 CWV on `/assessment` — **pass**
- §13.400 Lighthouse mobile > 85 — **98, pass with 13-point margin**

The marquee marketing routes are essentially identical in score because they share the same layout, font stack, and CSS bundle. Route-specific JS is small. The recent Wave A–E perf work (font trimming, Tailwind JIT scan, sideEffects tree-shaking, ResultsViewV2 lazy load, hero SVGO) is fully landed and validated.

---

## Failed audits — what costs the missing points

### Accessibility (-4) — color contrast + label mismatch

| Audit | Selector | Why |
|-------|----------|-----|
| `color-contrast` | `header > a > span.font-sans.text-dust` (wordmark) | `text-dust` (legacy Terra-era muted) on linen field below contrast threshold |
| `color-contrast` | `.font-mono.text-terra` and `.font-serif-sc.text-terra` (kicker labels) | `--color-terra` `#b5512e` on parchment fails contrast for small caps text |
| `color-contrast` | `a.inline-block.bg-terra…` (primary CTA) | Same Terra failure on button label |
| `label-content-name-mismatch` | Wordmark `<a aria-label="The AI Banking Institute — Home">` | aria-label includes "Home" but the visible text doesn't — fails accessible-name principle |

**Root cause:** the brand refresh (Ledger tokens) is partially complete. Terra-era classes (`text-terra`, `bg-terra`, `text-dust`) are still present on the live homepage. The Ledger refresh spec migrates these to `--ledger-accent` (`#B5862A` gold) and `--ledger-ink` — both of which pass contrast on Linen/Paper.

**Fix shape:** complete the Ledger migration on `/` (and the other marketing pages). Plans already exist; this is a known migration thread.

### Best Practices (-4) — console errors

| Issue | Impact |
|-------|--------|
| `GET /verify?_rsc=19zvn → 404` | Real bug — `SiteFooter.tsx:35` links to `/verify` but only `/verify/[certificateId]` exists. Browser console error on every page that renders the footer (so: every page) |
| `CSP 'upgrade-insecure-requests' ignored in report-only` | CSP is in `Content-Security-Policy-Report-Only` mode pending enforce flip (§16.436 noted this is intentional) |

**Fix shape — `/verify` link:** the simplest fix is removing the link (third parties verify with a URL that includes the credential ID — no general landing needed). If a landing page is wanted, that is product work.

### Performance (-2) — LCP and TTI

LCP at 2.4 s is below the 2.5 s threshold but only barely. Lighthouse trace says the LCP element is the H1 served via Newsreader. Cormorant SC for the small-caps surfaces was retained (per Wave A+ decision). Further headroom would require:
- Subset fonts to Latin Extended-A only (currently full Latin)
- Preload the Newsreader font-face explicitly (currently `display: swap`)
- Inline critical CSS for above-the-fold (currently external stylesheet)

These are not launch blockers given current scores.

### bf-cache disabled

Pages with `Cache-Control: no-store` cannot enter the browser's back/forward cache. The `force-dynamic` routes (`/assessment/in-depth` with auth-aware rendering) set this intentionally. Affects perceived navigation speed when users hit Back, but is correct behavior for routes that depend on session.

---

## Outstanding `/verify` 404 — recommended PR

Open `SiteFooter.tsx:35`. Either:
1. Remove the footer link — third parties verify via the URL they were given which includes the credential ID
2. Build a minimal landing page that takes a credential ID input

Option 1 is the conservative no-product-decision fix. This audit recommends option 1; the verify-from-input flow can be a follow-up if learners ask for it.

---

## Recommendations

- [ ] **High** — Complete Ledger token migration on marquee pages (closes color-contrast a11y findings)
- [ ] **High** — Remove or fix the `/verify` footer link (closes BP console-error finding)
- [ ] **Medium** — Subset Newsreader to Latin Extended-A (squeezes LCP under 2 s on slower 4G)
- [ ] **Low** — Flip CSP from report-only to enforce after preview validation (§16.436)

None of these block launch. Current scores are well above the §13 thresholds.

---

## Sign-off

This audit closes `§13` items 388, 389, 390, 391, 392, 400 on the launch
checklist. 393 (bundle analyzer) is handled by the active performance
plan. 394–402 are code-shape items separate from runtime measurement.

The full Lighthouse JSON for each route is in
`docs/reviews/lighthouse-2026-05-18/` — open with the Chrome DevTools
"Audits" panel for the interactive report (Performance → Open custom
report → load JSON).
