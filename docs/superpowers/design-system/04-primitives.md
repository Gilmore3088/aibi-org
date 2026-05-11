# 04 — Primitives & Composites

**Date:** 2026-05-07
**Branch:** `design-2.0`
**Files:** `src/components/system/*` + `src/components/system/index.ts` (barrel).

This document is the catalog. Every reusable visual component the site composes from lives here. The rule for adding a primitive: **does at least one other primitive or template need it?** If not, it's not a primitive yet — keep it inlined where it lives until the second use case appears.

---

## Import contract

```ts
// Always import from the barrel.
import {
  Section,
  SectionHeader,
  KPIRibbon,
  PillarCard,
  DefinitionList,
  TrustStrip,
  Marginalia,
  EditorialQuote,
  ScoreRing,
  EssayMeta,
  Cta,
  TransformationArc,
  CertificationLadder,
  DimensionGrid,
  EssayArchive,
  NewsletterCard,
  SiteNav,
  SiteFooter,
} from "@/components/system";
```

Never `import { Section } from "@/components/system/Section"` directly. The barrel is the contract surface.

---

## 1. Atomic primitives (10)

### `<Section>` — page-section primitive

The most-used primitive. Wraps content in a horizontally padded, optionally bg-tinted band with hairline dividers.

| Prop | Values | Default |
|---|---|---|
| `variant` | `linen` / `parch` / `parchDark` / `dark` | `linen` |
| `divider` | `hairline` / `strong` / `none` | `hairline` |
| `container` | `narrow` / `default` / `wide` / `full` | `default` |
| `padding` | `tight` / `default` / `hero` / `none` | `default` |
| `bleed` | bool — when true, no centered max-width wrapper | `false` |

Use `bleed` for full-width grids (KPI ribbons, ladders) where children own the row. Use `container` to constrain reading-width on essays.

### `<SectionHeader>` — `§ NN · LABEL` opener

The canonical section opener. Mono section number + label, serif H2, optional italic subhead.

| Prop | Notes |
|---|---|
| `number` | `"01"`, `"02"`, etc. |
| `label` | Editorial category — `"Diagnostic"`, `"Curriculum"` |
| `title` | The actual headline (ReactNode) |
| `subtitle` | Italic subhead, restrained — one sentence |
| `as` | `h1` / `h2` / `h3` (default `h2`) |
| `tone` | `terra` (default) or `dark` for use on ink bands |

### `<KPIRibbon>` — sourced data band

The defining content shape. 2–6 cells with mono numbers, sourced citations.

```tsx
<KPIRibbon items={[
  { label: "Curriculum", value: "9 modules", delta: "~12 hrs", desc: "From AI literacy to a working portfolio" },
  { label: "Frameworks aligned", value: "4", delta: "SR 11-7 · TPRM · ECOA · AIEOG", desc: "Examiner-ready by design" },
]} />
```

By default bleeds; pass `padded` to constrain. `source` field renders mono caption in dust.

### `<PillarCard>` — pillar-color stripe card

Top stripe + content slots. Used in cert ladder, transformation arc, engagement tiers.

```tsx
<PillarCard pillar="application" stripe>
  <PillarCard.Eyebrow>01 · Foundational</PillarCard.Eyebrow>
  <PillarCard.Title>AiBI Foundations</PillarCard.Title>
  <PillarCard.Designation>Banking AI Foundations · The Institute</PillarCard.Designation>
  <PillarCard.Body>...</PillarCard.Body>
</PillarCard>
```

Pillar discipline applies — `pillar="awareness"` paints the stripe sage, etc.

### `<DefinitionList>` — labeled key-value rows

Used in cert tiles, ROI input panels, program fact sheets. 2-column grid; label width customizable; value is sans by default, mono via `mono: true` per row.

### `<TrustStrip>` — regulatory citation row

Single source of truth for the regulator list. Reads from `content/regulations/index.ts`. Two surface tones (`parch-warm`, `ink`).

### `<Marginalia>` — terra-left-rule annotation

The "footnote in the margin" pattern. Used for sidebar quotes, founder cards, supporting points. Pillar accent options (terra default, sage/cobalt/amber).

### `<EditorialQuote>` — pull quote

Two variants — `light` (inline) and `dark` (on ink surface). Curly quotes drawn in terra (or amber-light on dark). Optional `attribution` line in mono.

### `<ScoreRing>` — SVG score circle

Used on the assessment results page. Score `12–48` (V2 scale). Tier color resolved from score via `tierForScore()`. Mono number inside; `font-variant-numeric: tabular-nums`. Accessible: full announcement in `aria-label`. Spring easing on the dashoffset transition (the only spring use in the system).

### `<EssayMeta>` — date · category · read-time row

Mono metadata strip. Single source of truth for how publication metadata is presented on every essay.

### `<Cta>` — button-as-link

Two visual treatments — `primary` (solid terra fill) and `secondary` (text + terra underline). `tone="dark"` inverts for use on ink bands. Routes via Next `<Link>` for internal hrefs, plain `<a>` for external. **Never** style `<button>` for navigation.

---

## 2. Composites (5)

### `<TransformationArc>` — three-stage banker → builder

Replaces the homepage "How it works" feature grid. Each stage: stage label, serif title, body, attribute list. Arrow connectors only render on `lg:` and up.

### `<CertificationLadder>` — 3-tile credential ladder

Composes `<PillarCard>` × N + `<DefinitionList>`. Each rung shows level, code, designation, facts table, blurb, and "program detail" link. Pillar discipline applies per rung.

### `<DimensionGrid>` — 8-cell scored dimension grid

The signature view of the assessment results page. Each cell: dimension name, score (mono x/4), pillar-colored bar, diagnostic comment, optional `act-first` / `strength` tag chiplet.

### `<EssayArchive>` — newspaper-archive list

Replaces card grids on `/research`. Each row: date | category | serif headline | dek | mono read-time | arrow. Categorization is content-driven; the archive doesn't filter — consuming page passes pre-filtered items.

### `<NewsletterCard>` — Brief subscribe form

Compact subscribe surface on parch-dark. Submits to `/api/subscribe-newsletter` (preserved server route). Client component. Inline status announcement via `aria-live="polite"`.

---

## 3. Site chrome (2)

### `<SiteNav>` — top header

Replaces `src/components/Header.tsx`. AibiSeal + serif-SC wordmark, editorial nav links, persistent terra Take Assessment CTA visible from `md:`, AuthButton, MobileNav. Active route announced via `aria-current="page"` + 1px ink underline.

Reads pathname server-side via `next/headers` — works with the existing `x-pathname` middleware shim.

### `<SiteFooter>` — bottom footer

Replaces `src/components/Footer.tsx`. Composes `<TrustStrip>` + brand-line + 3 link groups + optional `<NewsletterCard>` + mono copyright row.

`showNewsletter` prop lets the footer omit the card on pages where it would duplicate (e.g. `/research` itself).

---

## 4. Pillar discipline — codified

`PILLAR_COLORS` in `src/lib/design-system/tokens.ts` is the single map. Components that accept a `pillar?: Pillar` prop read from this map. **Components never accept a free-form color.**

When a primitive needs a pillar-driven color, it imports `PILLAR_COLORS` and reads by pillar slug. When a primitive needs a tier-driven color (assessment results), it calls `tierColor(score)`.

The result: violating the pillar discipline rule is *physically harder* than honoring it. There is no "pass terra explicitly" escape hatch.

---

## 5. What's not in this layer (yet)

Specialized primitives still to build, scheduled for Phase 05 templates:

- `<ProgressStrip>` — the dark course-bar with progress %, resume link. Belongs to LMSPage template.
- `<ModuleNavigator>` — left rail with module status / current / locked. Belongs to LMSPage.
- `<LessonResources>` — right rail with tools mini-card, file list, citation block. Belongs to LMSPage.
- `<QuestionFrame>` — assessment Q-and-4-answers + sidebar Why. Belongs to DiagnosticPage.

These don't appear outside their respective templates, so they live with the templates rather than as system-wide primitives. The rule of two applies — they become primitives if and when they're needed in two places.

---

## 6. Type-check guarantee

`npx tsc --noEmit` is clean against Phase 04 as committed. Adding a new primitive must not introduce type errors; the barrel export must be updated; this document must be updated.

---

## 7. Migration note

The existing `src/components/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `JourneyBanner.tsx` are NOT yet deleted. They remain because the live pages still import them. Phase 07 (migration) replaces those imports with `@/components/system` and removes the old chrome files in the same commit chain.

`AibiSeal.tsx`, `AuthButton.tsx`, `AuthDropdown.tsx`, `MobileNav.tsx` are dependencies of the new chrome and stay where they are.
