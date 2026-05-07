# 03 — Design Tokens (DESIGN.md)

**Date:** 2026-05-07
**Branch:** `design-2.0`
**Format:** Stitch DESIGN.md — every token records its *intent*, not just its value. Agents (Claude or otherwise) reference this file as the single source of truth for what each token is *for*.

**Implementation files:**
- `src/styles/tokens.css` — CSS custom properties (the source of truth at runtime)
- `src/lib/design-system/tokens.ts` — typed TypeScript exports for component code
- `tailwind.config.ts` — Tailwind theme bound to tokens

**Rule:** Components never use hex values. Pages never use hex values. Tokens propagate by name.

---

## 1. Brand intent (the why)

The AI Banking Institute is an **education company for community banks and credit unions** with the posture of an **industry research shop crossed with a certification ladder.** The visual system supports that posture through editorial restraint, sourced data discipline, hairline-rule density, and a small terra-cotta accent set against parchment surfaces.

The system is not a SaaS tool. It is not a magazine. It is the printed face of a research institute that also runs courses. Tokens encode that posture.

Reference brands for visual posture: IBISWorld industry profiles (data-density, sourced numbers), Corporate Finance Institute (certification-ladder clarity), The Economist (editorial typography), Federal Reserve research papers (institutional gravity). Reference brands for what we are *not*: Linear, Stripe, OpenAI consumer products, generic AI startups.

---

## 2. Color tokens

### 2.1 Pillar colors — discipline rule (non-negotiable)

The institute teaches **four pillars of AI proficiency**: Awareness, Understanding, Creation, Application. Each pillar owns one color. Pillar colors **never** appear outside their pillar context except where Pillar D (Application = terra) doubles as the brand signal.

| Token | Hex | Pillar | Intent |
|---|---|---|---|
| `--color-terra` | `#b5512e` | **D · Application** + brand signal | Primary brand mark. CTAs. Editorial accents on display type. The only color allowed for general UI emphasis (links, eyebrows, focus rings, hover glow). |
| `--color-terra-light` | `#c96a43` | hover state for terra | Hover and active states for any terra surface. Also: terra accents on dark backgrounds (where pure terra reads too brown). |
| `--color-terra-pale` | `#f0c4ab` | quiet terra surface | Background tint for terra-themed cards. Use sparingly. |
| `--color-sage` | `#4a6741` | **A · Awareness** *only* | Pillar A pages, Pillar A cards, Pillar A progress bars. **Forbidden** outside Pillar A context. |
| `--color-sage-pale` | `#d8e8d5` | Pillar A bg tint | Pillar A card background. |
| `--color-cobalt` | `#2d4a7a` | **B · Understanding** *only* (and security contexts) | Pillar B pages, Pillar B cards. Also the security/risk semantic where the page is about boundaries and safety. **Forbidden** outside those contexts. |
| `--color-cobalt-pale` | `#dce6f5` | Pillar B bg tint | Pillar B card background. |
| `--color-amber` | `#c48820` | **C · Creation** *only* | Pillar C pages, Pillar C cards. The "build" pillar. **Forbidden** outside Pillar C context. |
| `--color-amber-light` | `#d4a032` | hover for amber | Hover state for Pillar C surfaces. |

**Rationale for the discipline rule:** The four pillars are the institute's curriculum spine. If the colors interchange in the UI, the curriculum's visual logic dissolves. Pillar A (Awareness) is sage forever. Pillar D (Application) doubles as the brand because Application is *what bankers go do with what they learned* — that's the brand promise.

### 2.2 Surface colors

| Token | Hex | Intent |
|---|---|---|
| `--color-linen` | `#f9f6f0` | **Page background.** The default surface every page renders on. |
| `--color-parch` | `#f5f0e6` | **Card / soft band background.** One step warmer than linen. Used for in-page surfaces that need to recede into "card." |
| `--color-parch-dark` | `#ede6d8` | **KPI ribbon and editorial band background.** Two steps warmer than linen. Used for the KPI ribbon, the value-prop band, the trust-strip context. The "section change" tone. |
| `--color-ink` | `#1e1a14` | **Dark band surface.** Primary text color. Used inverted as the surface for emphasis sections (ROI, capstone, contact, founder pull-quote). |

### 2.3 Text colors

| Token | Hex | Contrast on linen | Intent |
|---|---|---|---|
| `--color-ink` | `#1e1a14` | 17:1 | Primary text. Headlines, body copy, default. |
| `--color-slate` | `#6b6355` | 4.8:1 (WCAG AA) | Secondary text. Subheads, body de-emphasis, captions. |
| `--color-dust` | `#9b9085` | 2.8:1 | Tertiary. **Large text only.** Metadata, mono labels, source citations under stats. |
| `--color-bone` | `#e8dec8` | inverse — used on dark | Body text on `--color-ink` dark band. |
| `--color-cream` | `#c9b889` | inverse — used on dark | Secondary text on `--color-ink` dark band. |

### 2.4 Semantic colors

| Token | Hex | Intent |
|---|---|---|
| `--color-error` | `#9b2226` | **Error / Starting Point tier.** Validation errors, form errors, the lowest assessment-result tier ("Starting Point"). |
| `--color-success` | `#4a6741` | **Success.** *Aliased to sage.* Used for completed-module checkmarks, success banners, and pillar-agnostic success state. |
| `--color-warning` | `#c48820` | **Warning.** *Aliased to amber.* Used for warnings outside the Pillar C context. |

### 2.5 Hairline / divider tokens

| Token | Value | Intent |
|---|---|---|
| `--divider-hairline` | `rgba(30, 26, 20, 0.10)` | **The divider rule.** 1px solid. Every section edge, card edge, table row edge. Equivalent to `--color-ink` at 10% opacity. |
| `--divider-strong` | `var(--color-ink)` | **The strong divider.** 1px solid ink. Used between *sections of different posture* (above the KPI ribbon, between the LMS course bar and the lesson body). Stronger than hairline; reserved for major posture shifts. |
| `--divider-pillar` | varies by pillar | **Pillar stripe.** 3–4px solid in the appropriate pillar color, sitting at the top edge of credential cards and program tiles. The only "thick" line in the system. |

---

## 3. Typography tokens

### 3.1 Type families

Loaded once in `src/app/layout.tsx` as Google Fonts with `display: swap`.

| Token | Family | Loaded weights | Intent |
|---|---|---|---|
| `--font-serif` | Cormorant Garamond | 400, 500, 600, 700 | **Display type.** All H1, H2, H3, H4. Editorial pull quotes. Card titles. Designation lines (italic). **Weight 400 is canonical;** 500 for emphasis; 600/700 used only in dense small-cap label contexts. *Italic is the warmth lever* — used for tagline emphasis ("Turning bankers into *builders.*"). Never bold. |
| `--font-serif-sc` | Cormorant SC | 400, 500, 600, 700 | **Editorial labels.** Small-cap eyebrows ("§ 01 · CURRICULUM"), nav links, designations after credential names. Always uppercase, always tracked (`letter-spacing: 0.18em` typical). |
| `--font-sans` | DM Sans | 400, 500, 700 | **Body and UI.** Paragraph copy, ledes, button labels, link text, form fields, breadcrumbs. **Weight 400 is canonical;** 500 for UI emphasis; 700 reserved for the few CTA pills. |
| `--font-mono` | DM Mono | 400, 500 | **Numbers, codes, mono accents.** All numerics across the site (KPIs, scores, prices, dates, file types, percentages, counts). Section numbers (`§ 01`). Module/unit/session prefixes. Citations under stats. Tabular figures via `font-variant-numeric: tabular-nums`. |

### 3.2 Type scale (rem-relative; 1rem = 16px)

The institute prefers a *narrow* scale with strong contrast at the display end. Editorial publications never have 12 type sizes.

| Token | Value | Use |
|---|---|---|
| `--text-display-xl` | `4rem` (64px) | Hero H1 on /about, /education, /research. Once per page. |
| `--text-display-lg` | `3.25rem` (52px) | Hero H1 default (homepage, /for-institutions). Once per page. |
| `--text-display-md` | `2.5rem` (40px) | Section H2. Many per page. |
| `--text-display-sm` | `1.875rem` (30px) | Card title, sub-section H3. |
| `--text-display-xs` | `1.375rem` (22px) | Card title small, list-item title. |
| `--text-body-lg` | `1.0625rem` (17px) | Hero lede. The first paragraph after a hero H1. |
| `--text-body-md` | `0.9375rem` (15px) | Body copy default. |
| `--text-body-sm` | `0.8125rem` (13px) | Secondary body. Card descriptions. Footnotes. |
| `--text-mono-md` | `0.875rem` (14px) | Number display in KPIs, scores, prices. |
| `--text-mono-sm` | `0.75rem` (12px) | Citation lines under stats. Section numbers. Mono breadcrumbs. |
| `--text-label-md` | `0.6875rem` (11px) | Eyebrow labels in serif-SC, uppercase, tracked. |
| `--text-label-sm` | `0.625rem` (10px) | Mono labels above values in dl pairs. KPI ribbon "Sector / Skills gap" labels. |

### 3.3 Line height

| Token | Value | Use |
|---|---|---|
| `--leading-tight` | `1.05` | Display type. |
| `--leading-snug` | `1.15` | Card titles, list headlines. |
| `--leading-normal` | `1.5` | Body copy default. |
| `--leading-relaxed` | `1.6` | Lede paragraphs, longer body sections. |

### 3.4 Letter spacing

| Token | Value | Use |
|---|---|---|
| `--tracking-tight` | `-0.01em` | Display headlines (H1, H2). |
| `--tracking-normal` | `0` | Body copy. |
| `--tracking-wide` | `0.06em` | Mono labels. |
| `--tracking-wider` | `0.12em` | Editorial breadcrumbs, dl labels. |
| `--tracking-widest` | `0.18em` | Eyebrow labels (serif-SC uppercase). |

### 3.5 Forbidden type patterns

- **Italic on DM Sans** — body copy never goes italic; only Cormorant carries italic warmth.
- **Bold on Cormorant in body context** — display type is 400 weight by default. The few 600/700 uses are the in serif-SC context only.
- **Mixing serif and serif-SC in the same line** — they have different optical sizes; pairing them in-line reads broken.
- **Mono numbers in serif body** — numbers in body copy stay in DM Sans with `font-variant-numeric: tabular-nums`. Mono is reserved for *display numbers* (KPI ribbons, scores) and metadata (citations, dates).

---

## 4. Spacing tokens

A 4px-base linear scale. Used for padding, margins, gaps. Page-level horizontal padding is consistent at `--space-7` (28px) across all primitives.

| Token | Value | Use |
|---|---|---|
| `--space-1` | `4px` | Micro gap (between dl rows). |
| `--space-2` | `8px` | Tight gap (within a meta line). |
| `--space-3` | `12px` | Default tight padding. |
| `--space-4` | `16px` | Default card padding small. |
| `--space-5` | `20px` | Default card padding. |
| `--space-6` | `24px` | Card padding generous. Inter-section gap small. |
| `--space-7` | `28px` | **Section horizontal padding.** Canonical. |
| `--space-8` | `32px` | Section vertical padding compact. |
| `--space-9` | `36px` | Section vertical padding default. |
| `--space-10` | `44px` | Hero vertical padding compact. |
| `--space-12` | `56px` | Hero vertical padding default. |
| `--space-16` | `72px` | Mega hero vertical padding. |

### Container widths

| Token | Value | Use |
|---|---|---|
| `--container-narrow` | `42rem` (672px) | Long-form essays, single-column reading. |
| `--container-default` | `64rem` (1024px) | Most pages, hero + section content. |
| `--container-wide` | `72rem` (1152px) | Multi-column layouts (LMS 3-rail, dashboard). |

---

## 5. Radius and shape tokens

The system uses a *near-zero radius* discipline. Sharp edges are the institutional signal; pillowy roundness is the SaaS signal.

| Token | Value | Use |
|---|---|---|
| `--radius-none` | `0` | Most surfaces. Default. |
| `--radius-hairline` | `1px` | Reserved; almost never used (visually identical to 0 at standard viewing distance). |
| `--radius-sharp` | `2px` | **Maximum radius.** CTAs, form fields, file-type badges, status pills. **Anything larger is forbidden.** |
| `--radius-circle` | `999px` | Score ring stroke caps, the brand seal, dot indicators. The only "round" allowed. |

---

## 6. Shadow tokens

The system has **no drop shadows.** This is a deliberate brand discipline.

| Token | Value | Use |
|---|---|---|
| `--shadow-none` | `none` | All non-floating UI. |

Shadows imply depth. The institute's aesthetic is flat, ruled, editorial. Where elevation matters (a sticky header, a modal), use a hairline rule, not a shadow.

The only exception is a `--shadow-focus` token used by the focus-ring system — but that's an outline, not a `box-shadow`.

---

## 7. Motion tokens

Motion is restrained. The institute is not a motion-forward brand. Animations exist to communicate state change, not delight.

| Token | Value | Use |
|---|---|---|
| `--motion-instant` | `0ms` | Reduced-motion users. |
| `--motion-fast` | `120ms` | Hover state changes, link underline transitions, focus ring on. |
| `--motion-medium` | `240ms` | Modal open/close, drawer slide-in. |
| `--motion-slow` | `400ms` | Score ring fill, progress bar fill on first paint. |

| Easing token | Value | Use |
|---|---|---|
| `--ease-default` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions. Smooth-out. |
| `--ease-spring` | `cubic-bezier(0.5, 1.5, 0.5, 1)` | Reserved; use only for the score-ring fill on results. |

All motion respects `prefers-reduced-motion: reduce`. Tokens degrade to `--motion-instant` automatically.

---

## 8. Z-index scale

A small, named scale. No magic numbers in components.

| Token | Value | Use |
|---|---|---|
| `--z-base` | `0` | Default in-flow content. |
| `--z-sticky` | `30` | Sticky header. |
| `--z-overlay` | `40` | Mobile nav drawer overlay. |
| `--z-modal` | `50` | Modals, popovers. |
| `--z-skip` | `100` | Skip-to-content link. |

---

## 9. Focus token

| Token | Value | Intent |
|---|---|---|
| `--focus-ring` | `2px solid var(--color-terra)` | The visible focus ring. Always terra. Always 2px. Always 2px offset. |
| `--focus-offset` | `2px` | Standard offset. |

---

## 10. Forbidden tokens (and patterns)

These exist nowhere in the system and adding them is a violation:

- **Gradients of any kind** — no `linear-gradient`, no `radial-gradient` outside the `<ScoreRing>` SVG primitive (which uses a single solid stroke, no gradient).
- **Drop shadows** — no `box-shadow`. (Outline-based focus rings are not shadows.)
- **Backdrop blur** — no `backdrop-filter`.
- **Hex literals** in components or pages — only via `var(--color-*)`.
- **Tailwind default colors** — `red-500`, `blue-600`, `slate-700` etc. are forbidden. The Tailwind theme is bound to brand tokens; defaults are unmapped.
- **Inter, Roboto, Arial, SF Pro** — only the four declared families. The browser's `system-ui` is forbidden as a *primary* family but allowed as a *fallback* in font stacks.
- **Border-radius greater than 2px** — except `--radius-circle` for genuinely circular elements.
- **Animations on opacity-only transitions** longer than `--motion-fast` — the page should never feel like it's "loading in" with theatrical fades.
- **`!important`** — except in the print stylesheet where it's unavoidable.

---

## 11. Tailwind binding

The Tailwind theme in `tailwind.config.ts` extends with token-mapped utilities so component code reads naturally:

```tsx
<div className="bg-linen text-ink p-7">
<h2 className="font-serif text-display-md">
<span className="font-mono text-mono-sm text-slate">
<button className="bg-terra hover:bg-terra-light rounded-sharp">
```

Anything not in the token system has no Tailwind class. Writing `bg-blue-500` in a component will not compile to a styled element. This is enforcement.

The arbitrary-value syntax `bg-[#abcdef]` is **forbidden in this codebase**. PRs that introduce arbitrary hex values get rejected.

---

## 12. Token versioning

When a token *value* changes (e.g., `--color-terra` shade adjusted) but its *intent* stays the same, no migration is needed.

When a token *intent* changes (e.g., `--color-cobalt` is rebound from "Pillar B only" to "general accent"), the discipline rule changes. That's a **brand change**, not a token change, and requires updating this document, audit-grepping all uses, and a brand committee review (the user, in our case).

Tokens are added freely. Tokens are removed with care — search the codebase for usage first, migrate, then delete.

---

## 13. Implementation file map

| File | Role |
|---|---|
| `src/styles/tokens.css` | CSS custom properties — single source of truth at runtime |
| `src/styles/base.css` | html/body resets, focus rings, skip link |
| `src/styles/print.css` | Print stylesheet |
| `src/lib/design-system/tokens.ts` | Typed TS exports for component code |
| `src/app/globals.css` | Imports tokens.css + base.css + print.css; Tailwind directives |
| `tailwind.config.ts` | Maps tokens to Tailwind utility classes |

This document (`03-tokens.md`) is the *intent contract*. The CSS, TS, and Tailwind config are the *implementation*. They MUST stay in sync; agents should not drift one without updating the others.
