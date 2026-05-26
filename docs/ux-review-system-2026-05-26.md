---
reviewer: Design-systems & IA critic (independent)
date: 2026-05-26
branch: feature/redesign-mockup-system
---

# Review — Design system lens

## Executive summary

- **Three brand systems are visibly coexisting on the same shell, not two.** The global `SiteHeader` still renders entirely on Ledger tokens (`text-ink`, `bg-linen`, `text-dust`, `font-serif-sc`, `rounded-sharp`, `--gold`/`--color-ink`) while the page bodies on `/`, `/assessment`, `/education`, `/for-institutions`, `/about`, `/security` are on the new mockup system (`mk-*`, `--ink`, `--cream`, `--gold` `#C8A24A`). The header is the most-seen surface in the product and it is the wrong system. This will read as "mock-up retrofitted onto an old site" until the chrome ports.
- **No mobile navigation exists below 1180px on mockup-system pages.** `_mockup.css` hides `.nav` at `<1180px` and the production header doesn't appear to render a hamburger fallback on home mobile (only the gold "Start Free" CTA is visible). That's a BLOCKER for the assessment-funnel-on-mobile mandate in CLAUDE.md.
- **`/research` is a separate visual world.** It uses bespoke `aibi-research`/`ticker`/`dot`/`strip` classes from `src/app/research/research.css`, renders without the standard container, and the captured screenshot is a 1440 × 31,865 px sliver — meaning the layout has no `max-width` cap and the body content is collapsed to a single narrow column. This is the surprising finding.
- **`/courses/foundation/program/purchase` is fully Ledger-skinned** (`lms-shell`, `lms-topbar`, `font-mono text-[color:var(--ledger-muted)]`, italics, the small-caps "PILLAR OF AWARENESS" eyebrow). The flagship $295 purchase page is the highest-friction surface on the funnel and it is the one that does not match the new system at all. HIGH-impact gap.
- **Eyebrow / kicker patterns are not standardized.** At least four eyebrow treatments are live: mockup `.mk-eyebrow` pill (gold-on-dark, hero), unstyled `<div class="k">` (section heads, gold-deep mono caps), Ledger `font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]` (research article), and the brand wordmark second line (`text-dust` slate). Same visual concept, four implementations.

## Per-page findings

### `/` — Home (the anchor)
Verdict: **Strong** as the system reference. Hero, three-place "command center", "clear path", "show the artifact", workflow Review Packet, Practice Lab, and CTA all land. Cards, eyebrows, ink hero, gold accent — disciplined two-tone restraint.

- **MEDIUM — Header is on the wrong system.** Source shows `bg-linen`, `font-serif-sc text-mono-sm uppercase tracking-widest`, `rounded-sharp`, `text-ink/75`. Mockup-system header in `_mockup.css` is `.shell-header { background: rgba(247,243,234,0.92); backdrop-filter: …; }` with Inter weights, `.nav` pill, `.brand .seal` 40×40. The screenshot's nav pills look mockup-ish but the underlying markup is Ledger.
- **HIGH — No mobile nav.** `_mockup.css` declares `.nav-mobile` and shows it below 1180px on the sketch, but the production header doesn't emit one (markup is `font-serif-sc … hidden lg:inline` for each link). Result: on phones the user sees seal + name + "Start Free" only — no `/assessment`, `/education`, `/for-institutions`, `/about`, `/security`, `/research` entry points. BLOCKER for assessment-first mandate.
- **LOW** — The hero "Readiness Snapshot" right card uses a gold tabular score (62). On the home it reads correctly as the lede artifact; the same card pattern reappears on `/assessment` and `/for-institutions` and is the strongest reusable component in the set. Extract it.

### `/assessment`
Verdict: **Strong**. Hero card, dimension list with progress bars, three-tier card row, eight-dimension grid, four-step strip, dark CTA. Cleanest information-architecture page on the site.

- **MEDIUM — Three-tier card row is the right pattern but the price card hierarchy is off.** "Readiness Baseline $0 / In-Depth Report $99 / Team View Custom" — the $99 middle card has a gold top stripe + gold ribbon, which is correct emphasis, but the $0 card and the Custom card use identical chrome. The Custom card has no price, no tagline weight differentiator; visually it reads as throwaway. Either differentiate (different shadow, navy fill, or "Talk to us" treatment) or pull it into a separate band.
- **MEDIUM — Eight-dimension grid uses gold square icons.** They're decorative — all eight glyphs are visually identical squares. Gold token discipline says "emphasis only, never decoration." Either replace with kicker numbers (01–08) or drop the gold square entirely.
- **LOW** — "Four steps" strip at the bottom is the only step-strip pattern on the site. Worth extracting as a shared `<NumberedStrip />` component before /education or /security build their own.

### `/education`
Verdict: **Acceptable**. Hero + two assessment cards + Foundation course card + "AiBI-S and AiBI-L" mention + dark CTA.

- **MEDIUM — The two assessment cards use a different chrome than the three-tier cards on `/assessment`.** Same conceptual cards (free vs $99), but here they're white cards with a thin gold top rule and the in-depth one has a small gold pill. On `/assessment` the same products are presented as ribbon-topped cards with a gold band. Same product, different cards. Pick one and use it everywhere.
- **LOW — The "Foundation course" card adds a small `is-active`-looking gold side-rule.** That rule pattern doesn't appear anywhere else in the system. Either codify it as a "highlighted tier" pattern or drop it.

### `/for-institutions`
Verdict: **Acceptable**. The hero composite (left ink text, right gold-bar dimensional card) is a system high point.

- **HIGH — "Readiness, by department, in plain language" bar chart strip uses inline-styled progress bars with raw widths.** The visual scale of those bars (`72`, `66`, `54`, etc.) is read as percent but the legend doesn't say what they represent. The same data appears as the right-hand "Readiness Snapshot" card on `/` with score-out-of-100 — pick one quantification and use it consistently.
- **MEDIUM — The "ROI Calculator" infographic ("145 / $145") is the only place on the site that uses a vertical-rule bar chart.** Once-only chart pattern. Either generalize the component or replace with the standard infobox.
- **LOW** — "Two ways to work with us" repeats the two-up tier-card structure from `/assessment` with a third visual treatment. Same product structure, three different card chromes across home/assessment/education/for-institutions.

### `/about`
Verdict: **Strong**. Hero + mission infobox + six-principle grid + CTA. The six-principle grid is the cleanest application of `card-cream` on the site.

- **LOW — The "8,400" stat card pinned to the hero right rail is a different shape than the home "62" card and the assessment "62" card.** All three are hero-right artifacts; they don't share a component.

### `/security`
Verdict: **Acceptable**. Hero + form on right + six-chapter grid + dark CTA.

- **MEDIUM — Inline form chrome (`The Safe AI Use Guide.` block) doesn't match the assessment email gate.** Form on dark hero; on `/assessment` and the homepage CTAs the form pattern is different (no inline guide block). Form components should be one component.
- **LOW — Six-chapter grid is functionally the same as the "Eight dimensions" grid on `/assessment` and the "Six principles" grid on `/about`** — three 3-up/4-up grids of titled paragraphs. All three are hand-styled. Extract `<TitledGrid />`.

### `/research` (archive)
Verdict: **BLOCKER**. This page is broken at the system level.

- **BLOCKER — No container width cap.** The captured screenshot is 1440 × 31,865 pixels with the content rendered as a thin vertical strip in the centre and giant icon glyphs (the cross, the bullseye, the gavel, the shield, the SR-11-7 / TPRM / FFIIT / AI-EOG / EC-OA / GL-BA seals) stacked one per viewport. The mockup container is `.container { max-width: 1280px; }` — this page bypasses it entirely.
- **HIGH — Bespoke design language.** The page is on `aibi-research`/`strip`/`row`/`ticker`/`ticker-track`/`dot` classes that don't exist anywhere else in the codebase. The SR-11-7 / TPRM / etc. ringed-seal medallions are a once-only component. They're attractive but they're not in the system.
- **HIGH — Gold is decorative here, not emphasis.** The medallion rings are pure gold and they carry no semantic weight — they're page furniture. That violates "gold for emphasis only, never decoration."

### `/research/the-widening-ai-gap`
Verdict: **Known legacy** (intentional per scope), but flag for systemic record.

- **HIGH (deferred)** — Page uses `font-serif`, `font-serif-sc`, `text-display-xs`, `parch-dark`, italics (`leading-relaxed italic`), `--color-ink`, `--ledger-muted`. Three retired token families on one page. When this surface ports, the italics need to be stripped at the source (the mockup system retires italics; current page leans on them for the lede).
- **MEDIUM — Inline `text-[color:var(--gold)]` and `text-[color:var(--ledger-muted)]` arbitrary-value classes.** That's not just legacy tokens, it's bypassing the design-token utility scale. When porting, replace with token-only Tailwind classes.

### `/my-toolbox`
Verdict: **Strong**. Dark hero + categories card, "Six categories" filterable grid, the inside-a-prompt card pair, six dark playbook tiles, CTA.

- **MEDIUM — Six dark playbook tiles use a different ink fill than the rest of the dark surfaces.** They appear to be navy with gold rule corners; the dark hero band uses `--ink` flat. Two different "ink" treatments. Token-discipline question: which is canonical?
- **LOW — Category counters (`5 prompts`, `5 prompts`, …) repeat a "label/value" infobox treatment that is implemented inline. Same as `.infobox .k / .infobox .v` from `_mockup.css`. Extract.**

### `/courses/foundation/program/purchase`
Verdict: **BLOCKER**. Wrong system end-to-end.

- **BLOCKER — Entire page is on Ledger chrome.** Markup shows `lms-shell`, `lms-topbar`, `font-mono text-[color:var(--ledger-muted)]`, `font-serif`, italics, "PILLAR OF AWARENESS / PILLAR OF UNDERSTANDING / PILLAR OF CREATION / PILLAR OF APPLICATION" sidebar headings. The 4-pillar visual grammar is retired per CLAUDE.md ("Pillar color discipline is retired"). The page also uses a left-rail sidebar that no other marketing surface has.
- **BLOCKER — Branding lockup at the top-left is "THE AI BANKING / INSTITUTE" stacked, with no seal, in `font-sans uppercase`** — that's the Ledger lockup, not the mockup wordmark (seal + two-line text). Different brand on the same site.
- **HIGH — `<div class="mockup-scope">` wrapper is present in markup**, suggesting the page started a port and stopped. The wrapper exists but the page above it (header, sidebar) is unchanged.
- **HIGH — Pricing block ($295) does not use tabular-nums, sits in a bespoke navy band with a gold "ADD TO CART" pill** — close to the mockup CTA but the rest of the page chrome contradicts it.
- **MEDIUM — Body italics on "In less than two weeks, every community banking employee can write better, summarize faster, think clearer…"** — italics are banned site-wide per CLAUDE.md (`*{font-style:normal!important}` in `base.css`). Either the global kill rule has been broken on this page or this surface predates it.

## System-wide patterns

These are component- or token-level fixes, not page-level.

1. **SiteHeader is the single biggest systemic gap.** It's Ledger-skinned on every page. Port it to the mockup `shell-header` + `.brand` + `.nav` + `.nav-mobile` from `_mockup.css` (also add the missing `.nav-mobile` rendering so phones see navigation). This single change makes the whole site visually coherent.

2. **Three card chromes for the same product trio (free / $99 / team).** `/assessment`, `/education`, `/for-institutions` all show free-vs-paid-vs-team cards with different shadows, top rules, and ribbon treatments. Extract one `<PricingTierCard variant="default | featured | custom" />` and route every page through it.

3. **Four eyebrow patterns.** `mk-eyebrow` pill, `<div class="k">` (mono caps gold-deep), `font-serif-sc text-xs uppercase` (research article), and the brand wordmark second line. Canonicalize to two: pill (`.mk-eyebrow`, used on dark surfaces, pre-hero) and inline kicker (`.section-head .k`, used above section heads).

4. **Three "hero-right artifact" cards** (`/`, `/assessment`, `/about`) — Readiness Snapshot 62, Sample Score 62, "8,400 community banks". Same role (hero anchor), three sizes/treatments. Should be one component with a `variant` prop.

5. **Three "titled grid" patterns** (six chapters, eight dimensions, six principles) — all 3-up/4-up titled paragraph grids. Different gutter, different card backgrounds, different rule treatments. Extract `<TitledGrid />`.

6. **Tabular-nums not applied consistently.** The `$295` on purchase, `$99` on assessment, `$0` on baseline, `145` on the ROI calculator, scores `62`, `8,400` — these need `font-variant-numeric: tabular-nums` site-wide for any numeric metric. Currently only the home Readiness Snapshot and the Sample Score on `/assessment` appear to use it.

7. **`mk-*` class namespace versus Tailwind tokens.** The mockup pages use raw CSS classes (`mk-hero`, `mk-eyebrow`, `mk-btn`); the Ledger/legacy surfaces use Tailwind utility classes (`bg-linen`, `text-ink`). Two component-authoring conventions in one project. Pick one. If the mockup CSS wins, port it through Tailwind's `@layer components` so the rest of the team writes utility-first.

8. **Ribbon (sketch label) is on the production build.** `_mockup.css` ships a `.ribbon` rule (fixed bottom-right "SKETCH"). I didn't see it firing in the screenshots, but the CSS is loaded into the bundle. Verify it's tree-shaken or gated behind a `process.env.NODE_ENV !== 'production'` check before launch.

9. **Inline arbitrary Tailwind colors (`text-[color:var(--gold)]`, `text-[color:var(--ledger-muted)]`, `bg-[color:var(--color-parch)]`) are widespread on legacy surfaces.** These bypass the token theme. When porting, every arbitrary-value class should resolve to a named theme color.

## Accessibility findings

- **WCAG 1.4.3 (BLOCKER on `/research`)** — Gold-on-cream body text appears on the medallion captions (e.g., "AT THE CORE OF" / "SR / 11-7"). Gold `#C8A24A` on cream `#F7F3EA` is approximately 1.95:1 — far below 4.5:1 for body text and 3:1 for large text. CLAUDE.md flags this explicitly ("gold on cream does NOT pass for body text — reserve gold-on-cream for kickers/metadata/headlines only").
- **WCAG 1.3.1 / 2.4.6 (HIGH, site-wide)** — Eyebrows are implemented as `<div>`s, not as actual headings or with `role`. They precede every section but screen readers will read them as plain text, breaking the heading map. Use `<p class="eyebrow">` semantically before the `<h2>` and ensure heading order on each page (`/research` jumps from H1 to grids of paragraphs without H2/H3 anchoring).
- **WCAG 2.4.7 (MEDIUM)** — Focus rings on the `mk-*` button system are not visible in the `_mockup.css` source (`transition: background .12s, border-color .12s, transform .12s;` — no `:focus-visible` outline). Verify keyboard focus is visible on every primary CTA.
- **WCAG 2.5.5 (MEDIUM)** — Mockup nav links are `padding: 8px 16px` ≈ 32px tall. WCAG 2.5.5 AAA target is 44×44; minimum AA target-spacing should be respected. Mobile menu (when it exists) should be 44px tap targets.
- **WCAG 2.4.1 (MEDIUM)** — Skip link is present (`absolute left-[-9999px]` in research article markup) but the home/assessment/etc. markup snapshot doesn't surface one. Verify skip-to-main on every page.
- **HIGH — Mobile navigation absent on `/` (and presumably all mockup-system pages).** This is a 2.4.5 "Multiple Ways" failure and also a usability blocker, not just a-11y.

## Top 5 highest-impact fixes

| Rank | Fix | Severity | Effort | Why |
|---|---|---|---|---|
| 1 | **Port `SiteHeader` to the mockup `shell-header` + add `.nav-mobile` rendering** | BLOCKER | M (1–2 days) | Single most-seen surface, currently the wrong system; also fixes mobile-nav blocker. Highest leverage change in the project. |
| 2 | **Re-render `/research` archive on the mockup container + retire bespoke medallion components, OR move it to `_archive/` until ported** | BLOCKER | M (1–2 days) | Page is broken layout-wise (no max-width cap) and uses decorative gold (WCAG fail). Either fix the chrome or hide the page until rebuilt. |
| 3 | **Port `/courses/foundation/program/purchase` to mockup chrome** | BLOCKER | L (3–5 days) | $295 purchase page, the conversion endpoint. Currently full Ledger with retired pillar grammar and banned italics. Highest revenue-impact surface still on the old system. |
| 4 | **Extract three shared components — `<PricingTierCard>`, `<TitledGrid>`, `<HeroArtifactCard>`** | HIGH | M (2–3 days, total) | Each appears 3+ times in different chromes. Centralizing them collapses three card-family inconsistencies in one stroke and prevents the next page from inventing a fourth. |
| 5 | **Standardize eyebrows to two patterns (pill on dark, kicker on light) and ship them as a single `<Kicker variant>` component** | MEDIUM | S (half day) | Cheap, highly visible. Currently four eyebrow treatments; the eye reads them as "this site has different sections built by different people." Two patterns, one component. |

Also worth doing (not top 5 but cheap): apply `font-variant-numeric: tabular-nums` to every numeric span in pricing/metrics; gate the `.ribbon` SKETCH chip behind `NODE_ENV`; sweep arbitrary-value Tailwind color classes (`text-[color:var(...)]`) and resolve them to named tokens.
