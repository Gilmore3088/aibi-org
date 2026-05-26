# The AI Banking Institute — Brand Guide

**Status:** Canonical. This file is the single source of truth for brand,
voice, copy rules, and design tokens. Other files (skills, audit reports,
new components) cite this file by section.

**Supersedes:** `.impeccable.md` (pre-Ledger), `Plans/aibi-designer-brief.html`
(archive). If those still exist, the Ledger system here wins.

**Source documents this consolidates:**
- `CLAUDE.md` § Brand & Copy Rules, § Design Context
- `src/styles/tokens-ledger.css` (the live token contract)
- `docs/brand-refresh-2026-05-09/project/Design System.html` (original bundle)

---

## 1. Identity

**Full name (use in prose):** The AI Banking Institute
**Informal reference:** the Institute
**Brand nickname:** AiBI — reserved for credentials, the wordmark, and
compound program names. **Not** for body copy.
**Pronunciation:** AI-bee.
**Tagline:** Turning Bankers into Builders (as of 2026-04-15).
**Domains:** AIBankingInstitute.com (primary), .org (registered).

### Never write

- "AiBI helps..." or "the AiBI approach..." in prose → use "The AI Banking
  Institute helps..." or "our approach..."
- `AiBi` or `AIBI` — only `AiBI`.

### Program & credential names

| Element | Correct |
|---|---|
| Foundation course | AiBI-Foundation |
| Foundation credential | AiBI-Foundation (course and credential share the name) |
| Specialist cert | AiBI-S (variants: AiBI-S/Ops, AiBI-S/Lending, etc.) |
| Leader cert | AiBI-L |
| Credential display format | `AiBI-Foundation · The AI Banking Institute` |
| Advisory engagement | Leadership Advisory (describe as "fractional Chief AI Officer" when shape matters) |

`AiBI-P` and `aibi-p` are **legacy internal identifiers only** — route slug,
DB `product='aibi-p'`, file path `public/AiBI-P/`, certificate ID prefix
`AIBIP-`. Must not appear in public copy. The course is AiBI-Foundation.

---

## 2. Voice

**Authoritative. Grounded. Human.**

- **Authoritative.** Speaks with the confidence of someone who has read the
  regulations, run the numbers, and delivered the results. Never hedges.
- **Grounded.** Every claim traces to a named source. Every recommendation
  assumes a regulated institution.
- **Human.** Behind the frameworks and the data, there is a teller on a
  Tuesday morning. The mission is giving people who care about their work
  a new set of tools.

**Register:** Declarative, specific, institutional. Not academic, not
casual, not startup.

**Editorial first, promotional never.** Lead with the artifact, not the
tool. Specific over clever. No exclamation points. No emoji (unless
quoting someone using one).

### Emotional goals

1. **Authority + Trust** — like walking into a well-run boardroom.
2. **Aspiration + Pride** — "my institution can lead on this."

---

## 3. Banned phrases & words

### Banned phrases

| Never use | Use instead |
|---|---|
| `FFIEC-aware training` | "Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon" |
| `AI-enabled peers at 58.1%` | "Community bank median ~65% efficiency ratio (FDIC); industry-wide ~55.7% (Q4 2024)" |
| `BAI-P / BAI-S / BAI-L` | `AiBI-Foundation / AiBI-S / AiBI-L` |
| `AiBI-Practitioner` / `AiBI-P` / `AiBI Foundations` (plural) / `Banking AI Practitioner` in user-facing copy | `AiBI-Foundation` (singular) |
| `AiBi` | `AiBI` |
| Any unsourced statistic | Named source + year + publication |

### Banned words

`supercharge`, `unlock`, `revolutionize`, `leverage`, `synergy`,
`AI-powered`, `users` (use "you"), `smart` / `intelligent` as badge
language, `seamlessly`, `delve`, `navigate the complexities`, `in today's
fast-paced world`.

### Citations are non-negotiable

No unsourced statistics in any user-facing copy. Every figure traces to a
named publication.

### Sourced statistics — copy from here

| Statistic | Source |
|---|---|
| 66% of banks discussing AI budget | Bank Director 2024 Technology Survey (via Jack Henry) |
| 57% of FIs struggle with AI skill gaps | Gartner Peer Community (via Jack Henry) |
| 55% have no AI governance framework yet | Gartner (via Jack Henry) |
| 48% lack clarity on AI business impacts | Gartner (via Jack Henry) |
| Community bank median efficiency ratio ~65% | FDIC CEIC data, 1992–2025 |
| Industry-wide efficiency ratio ~55.7% | FDIC Quarterly Banking Profile Q4 2024 |
| 84% would switch FIs for AI-driven financial insights | Personetics 2025 (via Apiture) |
| 62% open to AI-powered fee alerts | 2025 consumer survey (via Apiture) |
| 76% would switch FIs for better digital experience | Motley Fool (via Apiture) |

**FDIC research tool:** BankFind Suite at banks.data.fdic.gov — free
public data on efficiency ratios, assets, and FTE counts for every
FDIC-insured institution. Use before every Executive Briefing.

---

## 4. Aesthetic

**"Newspaper bones, software polish."**

Editorial ledger: parchment field, ink type, gold accent, oxblood for
destructive states. Authoritative, dry, slightly editorial.

**References:** financial print publications (FT, Economist), hand-kept
ledgers, consulting client materials.

**Anti-references:** SaaS landing pages, vendor conference booths,
fintech startup aesthetics, "digital transformation" stock photography.

**Theme:** light mode only. The warm palette IS the brand.

---

## 5. Color tokens

**Live source:** `src/styles/tokens-ledger.css`. Reference variables,
never hardcode hex.

### Foundation (surfaces)

| Token | Hex | Use |
|---|---|---|
| `--ledger-bg` | `#ECE9DF` | page field — linen |
| `--ledger-paper` | `#F4F1E7` | card field |
| `--ledger-parch` | `#E4E0D2` | recessed surfaces |
| `--ledger-parch-dark` | `#D5D1C2` | divider on parch |
| `--ledger-tape` | `#F1E9D0` | highlight tape (reviewer notes) |

### Ink

| Token | Hex | Use |
|---|---|---|
| `--ledger-ink` | `#0E1B2D` | primary text, primary fill |
| `--ledger-ink-2` | `#1F2A3F` | secondary text |
| `--ledger-slate` / `--ledger-muted` | `#5C6B82` | muted text |
| `--ledger-soft` | `#8C95A8` | softest text — wordmark line 2 |

### Accents

| Token | Hex | Use |
|---|---|---|
| `--ledger-accent` | `#B5862A` | gold — emphasis, primary CTA alt |
| `--ledger-accent-light` | `#C99A40` | gold hover |
| `--ledger-accent-soft` | `rgba(181,134,42,0.10)` | gold tint background |
| `--ledger-accent-2` | `#1E3A5F` | navy — secondary accent |
| `--ledger-warn` | `#B5862A` | warning (gold doubles) |
| `--ledger-weak` | `#8E3B2A` | oxblood — destructive only |

### Rules

| Token | Hex | Use |
|---|---|---|
| `--ledger-rule` | `#D5D1C2` | hairline |
| `--ledger-rule-strong` | `#A8AEBE` | strong rule — section heads |

### Color discipline

- **Gold (`--ledger-accent`) is for emphasis only — never decoration.**
- **Oxblood (`--ledger-weak`) is for destructive / late / failed only —
  never marketing.**
- Navy (`--ledger-accent-2`) is a secondary accent — sparing.
- Body text on Paper or BG, never on Parch (insufficient contrast).
- The retired pillar grammar (sage / cobalt / terra) does NOT come back.
  If you see `--color-sage`, `--color-cobalt`, `--color-terra-*`, or
  `#b5512e` / `#4a6741` / `#2d4a7a` in new code, treat as a finding.

---

## 6. Typography

Three families. Do not add a fourth.

| Family | Use |
|---|---|
| **Newsreader** (`--ledger-serif`) | display, ledes, quotes, wordmark |
| **Geist** (`--ledger-sans`) | body, UI labels, sans buttons |
| **JetBrains Mono** (`--ledger-mono`) | kickers, metadata, code, version + status pills, tabular numbers |

**Rules**

- **Italics signal voice** (ledes, quotes, trailing clauses on section
  titles) — never emphasis.
- **Caps + 0.16–0.20em tracking** only on mono. Never track sans.
- **Tabular-nums** on all numerical data so columns align.
- Body copy is Geist; never italic Geist (italics there read as error).

### Retired typography (do not reintroduce)

Cormorant Garamond, Cormorant SC, DM Sans, DM Mono. If you see these in
new code, treat as a finding.

---

## 7. Motion

**Almost none.**

- **120ms** for UI transitions.
- **200ms** for page transitions.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Hover** = border darken. Nothing else.

**Banned:** skeleton shimmers, parallax, scroll-jacking, spring physics,
floating particles, animated gradients, decorative motion.

---

## 8. Layout

### Spacing (8-pt baseline)

| Token | Value |
|---|---|
| `--ledger-s-1` | 4px |
| `--ledger-s-2` | 8px |
| `--ledger-s-3` | 12px |
| `--ledger-s-4` | 16px |
| `--ledger-s-5` | 24px |
| `--ledger-s-6` | 32px |
| `--ledger-s-7` | 48px |
| `--ledger-s-8` | 64px |
| `--ledger-s-9` | 96px |

### Radii

| Token | Value | Use |
|---|---|---|
| `--ledger-r-1` | 2px | buttons, inputs, chips |
| `--ledger-r-2` | 3px | cards, sidebars, sections |
| `--ledger-r-3` | 4px | hero / phase cards |

**Never** exceed 4px on structural elements. Circles for marks/icons only.

### Shadow

One shadow only — `--ledger-shadow`. Only on hero/feature cards. Nothing
else gets a shadow. Elevation otherwise comes from color contrast.

### Layout shell (LMS)

`--ledger-sidebar`: 280px (232px in compact density).

---

## 9. Wordmark

Two-line lockup. Both lines Geist 700 UPPER. Line-height 1.0. 0–2px gap.

- **Line 1:** `--ledger-ink`
- **Line 2:** `--ledger-soft`

Sans-serif. No italics. No symbol. No monogram.

### Retired

**The old circular AiBI seal is retired.** "Stamped wax" / Cormorant SC
in a circle is not the wordmark. If you see it in new work, treat as a
finding.

---

## 10. Design principles

1. **Content is the design** — restraint over decoration. If a section
   looks empty, the copy needs to be stronger, not the visuals louder.
2. **Every number earns its place** — sourced, mono, tabular-nums.
3. **Institutional, not promotional** — consulting client materials,
   not a SaaS landing page.
4. **Lines do real work** — they replace boxes and shadows.
5. **Accessible by default** — WCAG 2.1 AA, focus rings, skip links.

---

## 11. The "Never" list

- Gradients (except subtle card top-border treatment, if any)
- Drop shadows beyond `--ledger-shadow` on hero cards
- Rounded corners > 4px on structural elements
- Emoji (in any context except quoting someone using one)
- Generic icon libraries (Heroicons, Lucide, etc.) — if icons are needed,
  they're authored as SVG in the Ledger style
- Stock photography
- Decorative animation
- "AI-powered" / "smart" / "intelligent" badge language
- Dark mode
- Sentence-case CTAs (mono caps only)
- Uppercase sans-serif for body text
- Backgrounds darker than ink on light surfaces
- Pillar color discipline (sage / cobalt / terra) — retired
- The old AiBI seal — retired

---

## 12. Evolution

This guide is a steward's document, not a fortress. When a page wants
something the guide hasn't anticipated — a new infographic style, a motion
behavior, a layout pattern — the Art Director files a proposal in
`brand-evolution.md` with rationale and references, and waits for review.
Approved proposals update this file and link back to the evolution entry.

See `docs/brand/brand-evolution.md`.
