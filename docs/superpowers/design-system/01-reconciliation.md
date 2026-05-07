# 01 — Reconciliation: Current State vs. Target System

**Date:** 2026-05-06
**Branch:** `design-2.0`
**Purpose:** Catalog what's already shipping, name the drift, and decide what to *keep, refactor, replace,* or *delete* before designing the new system. The goal is to build on the parts of the current app that already match the target brand and surgically remove the parts that don't.

---

## Headline finding

**The brand foundation is already in place. The drift is in composition.**

The live app has Cormorant Garamond + Cormorant SC + DM Sans + DM Mono loaded as font tokens, a complete intent-bound color palette in CSS variables (terra / sage / cobalt / amber / ink / parch / linen / slate / dust), accessibility primitives (skip link, focus rings, reduced-motion respect), a print stylesheet, hairline-divider patterns, mono tabular numbers, and sourced-citation discipline already used in the homepage stats band.

What's wrong is that page-level *composition* drifted — too much SaaS centering, too many CTA bands, too much "icon-card grid" treatment, missing the editorial structures we agreed on (transformation arc, certification ladder, trust strip pattern, definition lists, KPI ribbon).

This means we are **not rebuilding from zero**. We're consolidating an emergent system into an explicit one, deleting drift, and adding the missing primitives.

---

## What's already shipping that matches the target

### Tokens — keep

`src/app/globals.css` lines 5–28 already contain a more refined palette than my v4 mockups proposed:

| Token | Value | Status |
|---|---|---|
| `--color-terra` | `#b5512e` | Keep — brand signal |
| `--color-terra-light` | `#c96a43` | Keep — hover |
| `--color-terra-pale` | `#f0c4ab` | Keep — bg tint |
| `--color-sage` | `#4a6741` | Keep — Pillar A only |
| `--color-sage-pale` | `#d8e8d5` | Keep — bg tint |
| `--color-cobalt` | `#2d4a7a` | Keep — Pillar B only |
| `--color-cobalt-pale` | `#dce6f5` | Keep — bg tint |
| `--color-amber` | `#c48820` | Keep — Pillar D ("Creation") |
| `--color-amber-light` | `#d4a032` | Keep |
| `--color-ink` | `#1e1a14` | Keep — primary text |
| `--color-slate` | `#6b6355` | Keep — secondary text (WCAG AA on linen, 4.8:1) |
| `--color-dust` | `#9b9085` | Keep — captions, large text only |
| `--color-parch` | `#f5f0e6` | Keep — card bg |
| `--color-parch-dark` | `#ede6d8` | Keep — section band |
| `--color-linen` | `#f9f6f0` | Keep — page bg |
| `--color-error` | `#9b2226` | Keep — Starting Point tier |

**My mockups introduced ad-hoc tones (`#f3ebd8`, `#ede4cf`, `#f0e8d4`) that aren't in the system.** The reconciliation: use `--color-parch-dark` (`#ede6d8`) as the KPI ribbon background and the band tone. No new colors.

I also forgot a fourth pillar: **`--color-amber` is the "Creation" pillar**. The pillar discipline rule must extend: terra = brand/Pillar C, sage = Pillar A only, cobalt = Pillar B/security only, amber = Pillar D (Creation) only. I previously documented only three.

### Typography — keep

`src/app/layout.tsx` lines 31–57 already load the four typefaces, declared with semantic CSS variables:

```ts
--font-cormorant      → --font-serif      (display)
--font-cormorant-sc   → --font-serif-sc   (labels, eyebrows)
--font-dm-sans        → --font-sans       (body, UI)
--font-dm-mono        → --font-mono       (numbers, mono accents)
```

`globals.css` line 42 sets `h1, h2, h3` to `font-serif` with `letter-spacing: -0.01em` by default. Tight, correct.

The pattern `font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)]` for editorial eyebrows already exists in `src/app/page.tsx` line 48 — and it's exactly the "terra eyebrow label" treatment in every v4 mockup. **This is the canonical eyebrow.**

### Accessibility primitives — keep

- Skip-link (lines 67–82, `globals.css`) — keyboard accessible, terra background
- Focus ring (lines 47–51) — 2px terra, 2px offset, all interactive elements
- Reduced motion (lines 174–184) — respects `prefers-reduced-motion`
- Print stylesheet (lines 112–172) — strips chrome, disables animations, brand footer
- Plausible deferred queue (lines 25–29 of `layout.tsx`) — matches CLAUDE.md guidance

### Hairline divider pattern — keep

`border-b border-[color:var(--color-ink)]/10` is the canonical hairline used across `Header.tsx`, `Footer.tsx`, and homepage sections. Equals `--color-ink` at 10% alpha. **This is the design contract for dividers** — every primitive must use this, never `gray-200` or arbitrary alphas.

### Header — refactor

`src/components/Header.tsx`:

- ✓ Brand mark: `<AibiSeal>` + serif-SC wordmark — clean
- ✓ Nav uses font-serif-sc uppercase tracking — correct
- ✓ Terra CTA pill — correct
- ✗ "Take Assessment" pill is `xl:inline-block` only — invisible at md and lg breakpoints (the most common laptop sizes)
- ✗ No active-route indication — the user can't tell where they are
- ✗ Sticky + `backdrop-blur-sm` — the blur is a tiny SaaS tic; should be solid `linen/97`

**Refactor target:** replace with `<SiteNav>` primitive that takes a `nav` config and an `activeHref`. Active route gets the underline-from-v4 treatment. CTA visible from `md:` up.

### Footer — refactor

`src/components/Footer.tsx`:

- ✓ Three-column "Start here / Programs / Institute" IA — correct
- ✓ Terra tagline "Turning Bankers into Builders" — correct
- ✓ Mono copyright line — correct
- ✗ The regulator citation is buried in body copy; should be the explicit **trust strip** primitive from v4
- ✗ No newsletter / Brief signup — the brand says "research shop" but the footer doesn't surface the publication

**Refactor target:** `<SiteFooter>` with composable slots: `<TrustStrip>` row, link-group grid, brand-line, optional `<NewsletterCard>` slot.

### AibiSeal — keep

`src/components/AibiSeal.tsx` is 33 lines, SVG, `currentColor`, accessible, configurable size. Already perfect. **No changes.**

### Stats band — keep, generalize

`page.tsx` lines 102–141 — three sourced stats with mono number, serif body, mono citation. **This is the KPI ribbon primitive in everything but name.** Refactor target: extract as `<KPIRibbon>` primitive with a typed `items` array, used on homepage, /for-institutions, /education, and any new program landing.

### Trust-points block — keep, rename

`page.tsx` lines 143–160 — terra left-border list of trust points. **This is the marginalia primitive in everything but name.** Refactor as `<MarginaliaList>` and use it everywhere a side-rail of supporting points appears (currently inlined ad-hoc on `/about`, `/for-institutions`, etc.).

---

## What's drift — replace or delete

### Hero composition — replace

`page.tsx` lines 46–70: centered hero, single-axis stack (eyebrow → H1 → tagline → body → CTA), max-w-4xl mx-auto. This is the "centered SaaS landing" pattern, not the editorial left-aligned hero from v4. **Replace** with a left-aligned editorial hero in the new template.

### "How it works" icon-card grid — delete

`page.tsx` lines 72–96: 4-card grid of `Assess / Learn / Practice / Apply` with simple line-icon SVGs. The icons are restrained but the format is "feature grid card" SaaS. The v4 transformation arc (`The banker → The practitioner → The builder`) replaces this with a 3-stage editorial structure that names the *journey*, not the *features*.

**Delete** the StepIcon function. **Replace** the section with `<TransformationArc>` primitive composed from `<PillarCard>` × 3 with editorial copy.

### Three CTA bands — collapse to one

The current homepage has CTA pills in:
- The hero (line 62)
- The terra full-bleed final section (line 175)
- The Header (line 46)

That's three "Take the Assessment" CTAs in roughly 200 vertical rems of page. **One in the hero + the persistent header CTA is enough.** Delete the closing terra-bleed section; replace with a quieter close (the trust strip + maybe a "begin" link).

### Plain `border-l-2` ad-hoc styling — formalize

Lines 152: `border-l-2 border-[color:var(--color-terra)] pl-4` — this is the marginalia pattern, but inlined. Each instance across pages re-implements it slightly differently. Formalize as `<Marginalia>` primitive.

### `border-y` band rhythm — formalize

Sections alternate `bg-[color:var(--color-linen)]` and `bg-[color:var(--color-parch)]` with `border-y` 1px-ink/10 hairlines. The pattern is right; the implementation is per-section ad-hoc. Formalize as `<Section variant="linen|parch|dark">` primitive.

### `HomeContextStrip` — investigate

`src/components/sections/HomeContextStrip.tsx` is imported above the hero. Need to read its content and decide: is it the v4 utility strip we explicitly killed, or something different?

### `InteractiveSkillsPreview` — investigate

Imported on the homepage. 5+ KB component (need to read). Likely a featured demo. Decide whether it lives on the homepage or in `/education`.

### `ROICalculator` — keep, restyle

The ROI calculator was named as a must-keep. The current implementation likely uses a SaaS-y "calculator UI." The v4 ROI section was a dark-band editorial frame with the same logic underneath. **Refactor target:** keep the math (`src/components/sections/ROICalculatorBody.tsx`), wrap in the new `<DarkBand>` + `<DefinitionList>` primitives.

---

## What's missing entirely — build

These v4 primitives don't exist anywhere in the live app:

| Missing | Where it lands |
|---|---|
| **`<TrustStrip>`** — regulator citation row (SR 11-7 / TPRM / ECOA / AIEOG) on parch-dark band | Footer slot, plus inline on /education, /for-institutions, /assessment, all program pages |
| **`<TransformationArc>`** — three-stage banker → practitioner → builder | Homepage replacement for "How it works" |
| **`<CertificationLadder>`** — 3-tile credential ladder with pillar stripes | Homepage, /education |
| **`<DefinitionList>`** — labeled mono key/value rows used in cert tiles, ROI inputs, program facts | All program pages, results page |
| **`<DarkBand>`** — ink-on-linen dark editorial section | ROI, Capstone, Pilot CTA, About contact |
| **`<EditorialQuote>`** — terra-quote pull quote, dark or light variants | About, essays, results |
| **`<ScoreRing>`** — SVG score circle with mono number | Results page |
| **`<DimensionGrid>`** — 8-cell scored dimension grid with bars | Results page (dimensional breakdown) |
| **`<SectionHeader>`** — `§ NN · category` mono prefix + serif H2 + italic subhead | Every section, every page |
| **`<PillarCard>`** — top pillar-color stripe + serif title + dl + body | Cert ladder, transformation arc, engagement tiers |
| **`<EssayMeta>`** — date · category · read-time row in mono | Every /resources article |
| **`<EssayArchive>`** — newspaper-archive list (date · topic · headline · readtime · arrow) | /resources index |
| **`<KPIRibbon>` (formalized)** — 4-cell ribbon with label / num / delta / desc | Homepage, /education, program pages, /for-institutions |
| **`<NewsletterCard>`** — subscribe-card primitive | Footer, /resources, /about |
| **`<ProgressStrip>`** — dark course-bar with progress %, resume link | LMS chrome |
| **`<ModuleNavigator>`** — left rail with module status / current / locked | LMS interior |
| **`<LessonResources>`** — right rail with tools mini-card, file list, citation block | LMS interior |
| **`<QuestionFrame>`** — assessment Q-and-4-answers + sidebar Why | Assessment in-flow |

Roughly **18 primitives** to build.

---

## Inventory of section components — keep / refactor / delete

`src/components/sections/`:

| File | Status | Action |
|---|---|---|
| `HomeContextStrip.tsx` | Need to read | Investigate, then keep / refactor / delete |
| `ROICalculator.tsx` | Keep (logic) | Wrap in new dark-band template; logic is sound |
| `ROICalculatorBody.tsx` | Keep | Pure math, no styling concerns |
| `InteractiveSkillsPreview.tsx` | Need to read | Investigate, then keep / refactor / move |
| `SampleQuestion.tsx` | Need to read | Investigate, likely keep, possibly extract as primitive |

`src/components/`:

| File | Status | Action |
|---|---|---|
| `Header.tsx` | Refactor | Replace with `<SiteNav>` primitive |
| `Footer.tsx` | Refactor | Replace with `<SiteFooter>` primitive |
| `MobileNav.tsx` | Refactor | Compose into `<SiteNav>` responsive behavior |
| `AibiSeal.tsx` | Keep | Already correct |
| `JourneyBanner.tsx` | Need to read | Cross-page funnel banner — likely keep, restyle |
| `AuthButton.tsx` | Keep | Functional auth chrome |
| `AuthDropdown.tsx` | Keep | Functional auth chrome |
| `CourseTabs.tsx` | Need to read | Likely refactor into `<TabNav>` primitive for LMS |
| `AIPracticeSandbox.tsx` | Need to read | Practice surface — keep, possibly restyle |

---

## Drift catalog — patterns to remove on sight

The list of costume tics to grep out of the codebase wholesale during migration:

1. **Centered max-w-4xl heroes** — replace with editorial left-aligned heroes
2. **Backdrop-blur on the header** — solid 97% linen instead
3. **Step-card icon grids** ("How it works" pattern) — replace with editorial structures
4. **Multiple terra-bleed CTA sections** on the same page — one is enough
5. **Inline `border-l-2 border-...-terra`** — use `<Marginalia>` primitive
6. **Inline KPI-style stat cards** — use `<KPIRibbon>` primitive
7. **Ad-hoc parch tones** (`#f3ebd8`, `#ede4cf`) — use `--color-parch-dark`
8. **Marketing voice** ("Discover", "unlock", "your journey") — replace with editorial voice
9. **Unsourced numbers** — every figure must carry a citation
10. **Vol. NN / masthead / datestamp utility strips** — never
11. **Gradient text and backgrounds** — never
12. **AI-powered / sparkle badges** — never
13. **Soft pill buttons with shadows** — sharp 2px-radius rect, no shadow
14. **Inter / Roboto / generic sans** — only the four declared font families
15. **Hardcoded hex** — only via `var(--color-*)` tokens
16. **Rounded corners > 2px** — no
17. **Drop shadows of any kind** — no

---

## Decision: keep / refactor / replace summary

| Layer | Action |
|---|---|
| Token CSS vars | **Keep** — already strong; will be promoted to a documented contract in Phase 03 |
| Font loading | **Keep** — already correct |
| Skip link, focus rings, reduced motion, print | **Keep** — already correct |
| Hairline divider pattern | **Keep** — promote to documented rule |
| `<AibiSeal>` | **Keep** unchanged |
| `<Header>` | **Refactor** into `<SiteNav>` |
| `<Footer>` | **Refactor** into `<SiteFooter>` with `<TrustStrip>` slot |
| `<MobileNav>` | **Fold into** `<SiteNav>` responsive behavior |
| `<HomeContextStrip>` | **Investigate** then decide |
| `<ROICalculator>` (logic) | **Keep**; wrap in new template |
| `<ROICalculator>` (styling) | **Replace** with `<DarkBand>` + `<DefinitionList>` |
| Homepage sections (hero, how-it-works, stats, trust, CTA) | **Replace** wholesale with composition of new primitives |
| Page-level ad-hoc styling | **Delete**; everything composes from primitives |
| All ~63 routes' bespoke code | **Migrate** onto new templates per Phase 07 |

---

## What to read next (informs Phase 02 IA + Phase 04 primitives)

Before writing the IA proposal, I need to read:

1. `src/components/sections/HomeContextStrip.tsx`
2. `src/components/sections/InteractiveSkillsPreview.tsx`
3. `src/components/sections/SampleQuestion.tsx`
4. `src/components/sections/ROICalculator.tsx` + `ROICalculatorBody.tsx`
5. `src/components/JourneyBanner.tsx`
6. `src/components/CourseTabs.tsx`
7. `src/app/education/page.tsx` (the hub that merged courses + certifications)
8. `src/app/courses/aibi-p/page.tsx` (program detail)
9. `src/app/courses/aibi-p/[module]/page.tsx` (LMS interior)
10. `src/app/resources/page.tsx` (essay archive)
11. `src/app/for-institutions/page.tsx`
12. `src/app/results/[id]/page.tsx`
13. `src/app/assessment/page.tsx`

These are the load-bearing pages for the system. The IA and primitive design has to fit them.

---

## Recommendation for Phase 02

The IA pass should:

1. Read the 13 files above
2. Catalog every existing route's actual purpose (vs. the route name's implication)
3. Propose a clean route tree where:
   - Programs collapse under one prefix that scales (`/programs/<slug>`, replacing `/courses/aibi-p` etc.)
   - Essays collapse under one prefix (`/research/<slug>`, replacing `/resources/<slug>`)
   - The funnel is shorter and named consistently
   - Member-only surfaces are clearly nested under `/dashboard`
   - The LMS routing follows a single nested pattern that adds new courses with config, not new files

Then write Phase 03 (tokens), Phase 04 (primitives), Phase 05 (templates), Phase 06 (content model), and Phase 07 (migration plan).
