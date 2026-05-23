# AiBI — Design System / UI Kit Spec
*The visual + interaction language for the Foundation Course. Codifies what CLAUDE.md's Design Context section establishes and turns it into a reusable kit. Pairs with `AiBI_Screen_Inventory_Spec.md` (what screens we build) — this doc owns **how** they look.*

| | |
|---|---|
| **Brand basis** | Ledger refresh (2026-05-09) — "newspaper bones, software polish" |
| **Source tokens** | `src/styles/tokens-ledger.css` — single source of truth for color |
| **Authority** | This doc is the design contract. CLAUDE.md Design Context is the brand law; this doc maps it to components. |
| **Accessibility** | WCAG 2.1 AA throughout — non-negotiable |
| **Status** | Spec v1 — read before designing any new component |

---

## 1 · Aesthetic posture (the one paragraph that matters)

Editorial ledger. Parchment field, ink type, gold accent, oxblood for destructive. Authoritative, dry, slightly editorial. References: financial print publications and hand-kept ledgers. Lines do work; shadows almost never; gradients never. Type carries hierarchy; color reserves itself for emphasis. Everything reads like consulting materials, not SaaS marketing.

> If a screen feels like a startup landing page, it's wrong. If it feels like a serious bank publication you'd be unembarrassed to leave on an examiner's desk, it's right.

---

## 2 · Color tokens (Ledger)

All values from `tokens-ledger.css`. **Never hardcode hex.** Reference variables only. The gold is single-sourced in `--ledger-accent`; change in one place to change site-wide.

| Token | Hex | Role |
|---|---|---|
| `--ledger-bg` | `#ECE9DF` | Page field — linen |
| `--ledger-paper` | `#F4F1E7` | Card field |
| `--ledger-parch` | `#E4E0D2` | Recessed surfaces (do not put body text on this) |
| `--ledger-tape` | `#F1E9D0` | Highlight tape (reviewer notes, callouts) |
| `--ledger-ink` | `#0E1B2D` | Primary text, primary fill |
| `--ledger-ink-2` | `#1F2A3F` | Secondary text |
| `--ledger-muted` | `#4F5C6E` | Muted text (AA-passing post 2026-05-21 darken) |
| `--ledger-soft` | `#8C95A8` | Wordmark line 2 only (logotype, WCAG-exempt) |
| `--ledger-accent` | `#7C5814` | Gold — emphasis only, never decoration |
| `--ledger-accent-2` | `#1E3A5F` | Navy — secondary accent |
| `--ledger-weak` | `#8E3B2A` | Oxblood — destructive only |
| `--ledger-rule` | `#D5D1C2` | Hairline divider |
| `--ledger-rule-strong` | `#A8AEBE` | Strong rule — section heads |

**Usage rules:**
- **Body text on Paper or BG** — never on Parch (contrast fails).
- **Gold is emphasis only** — not for backgrounds, not for borders by default, not for "make it pop." Reserved for callouts, status, and the rare CTA accent.
- **Oxblood is destructive only** — never marketing, never urgency, never "look at me."
- **Navy is the secondary accent** — quiet, usable on volume; for nav highlights, links, and informational chips.
- **The retired pillar palette (sage / cobalt / terra)** must not appear in new work.

**Tint scale (derived from gold):** `--ledger-accent-a06 … a40` for subtle washes (callout backgrounds, hover states). Never use these as text color — too low contrast.

---

## 3 · Typography

Three families. Do not add a fourth.

| Family | Use |
|---|---|
| **Newsreader** | Display, ledes, quotes, wordmark line 1 |
| **Geist** | Body, UI labels, sans buttons, wordmark both lines |
| **JetBrains Mono** | Kickers, metadata, code, version/status pills, tabular numbers |

**Italics are retired site-wide.** `*{font-style:normal!important}` in `base.css` kills all italics including default `<em>`, the `italic` Tailwind utility, inline styles, and browser-rendered SVG `<text>`. Server-rendered images (Satori OG, hero SVG) are roman at source. Emphasis is carried by color + weight, never slant. (Supersedes any prior "italics signal voice" rule.)

**Tracking:** caps + 0.16–0.20em letterspacing on mono only; never on sans.

**Scale (rem, on a 16px root):**

| Token | Size · Line · Family · Weight | Use |
|---|---|---|
| `text-display` | 3.5 / 4.0 · Newsreader 700 | Hero/title cards |
| `text-h1` | 2.25 / 2.75 · Newsreader 700 | Page H1 |
| `text-h2` | 1.75 / 2.25 · Newsreader 700 | Section heads |
| `text-h3` | 1.375 / 1.75 · Newsreader 600 | Lesson titles |
| `text-h4` | 1.125 / 1.5 · Geist 600 | Card titles |
| `text-body` | 1.0 / 1.6 · Geist 400 | Paragraph |
| `text-body-sm` | 0.875 / 1.5 · Geist 400 | Dense reading |
| `text-meta` | 0.75 / 1.4 · JetBrains Mono 500 · caps · 0.18em | Kickers, version, status |
| `text-num` | tabular-nums; family follows context | All numbers, always tabular |

---

## 4 · Spacing, radii, shadow, motion

### 4.1 Spacing scale (rem)
Use the Tailwind defaults restricted to: `0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24`. No oddball values. Vertical rhythm in multiples of 8px.

### 4.2 Radii
- **2px** — buttons, inputs, chips
- **3px** — cards, sidebars, sections
- **4px** — hero/feature cards (the *only* place 4px goes)

No radius >4px anywhere. No pill buttons. No fully-rounded cards.

### 4.3 Shadow
- **One** shadow token: `--ledger-shadow`. Applied **only** to hero/feature cards. Nothing else gets a shadow. No drop shadows on buttons, modals, dropdowns, etc. — they get borders.

### 4.4 Motion
Almost none.

| Duration | Use |
|---|---|
| 120ms | UI state change (hover, focus, toggle) |
| 200ms | Page transitions |

Easing: `cubic-bezier(0.4, 0, 0.2, 1)`. Hover = border darken; never lift, never scale, never glow. No skeleton shimmers, no parallax, no scroll-jacking, no spring physics.

---

## 5 · Components (the kit)

Each component lists: purpose · variants · states · accessibility notes. Owners build with Tailwind utility classes against Ledger tokens.

### 5.1 Button
- **Variants:** Primary (Ink fill, Paper text), Secondary (Paper fill, Ink text, Ink border), Tertiary (text-only with underline on hover), Destructive (Oxblood fill, Paper text).
- **States:** default · hover (border darkens / fill darkens 4%) · focus-visible (2px Ink outline + 2px offset) · disabled (50% Ink, Parch fill, `cursor-not-allowed`) · loading (spinner + label, button width preserved).
- **Mono CTAs:** primary buttons use Geist 600 caps + 0.12em tracking. Sentence-case CTAs are banned (CLAUDE.md).
- **A11y:** keyboard activates on Enter + Space; clear focus ring; loading state announced via `aria-live`.

### 5.2 Input + Textarea
- **Variants:** text, email, password, number (tabular-nums), textarea.
- **States:** default · focus (Ink border + Gold left rule 2px) · error (Oxblood border, Oxblood help text, `role="alert"`) · disabled (Parch fill, Muted text).
- **Label:** always present, above the input. Help text below.
- **PII check on data slots** (sandbox): client-side regex matches SSN / account / routing / card; blocks submit with inline message *"Don't paste customer data — anonymize first (see your Data Discipline Card)."*

### 5.3 Card
- **Variants:** Standard (Paper fill, 1px Rule border, radius 3px), Feature (Paper fill, 1px Rule border, radius 4px, `--ledger-shadow`), Recessed (Parch fill — no body text), Tape (yellow tape highlight for callouts).
- **States:** default · hover (border darkens to Rule-Strong) · selected (Ink left rule 2px) · disabled (50% opacity).

### 5.4 Lesson player (composite)
- **Structure:** header (kicker + title + duration + tier badge) · player canvas (modality-specific) · interaction panel (Do beat) · take panel (artifact save) · check panel.
- **Branched lesson UI:** track is set in the page header (chip showing the active track + change link). Player swaps content based on `learner_profiles.track`.
- **A11y:** captions are first-class for video; transcript always available; keyboard navigation through all interactive elements.

### 5.5 Sandbox controls
- **Lever toggles + selects:** segmented control style (Paper fill, Ink border), 2px radius, the active option in Ink. Switching is instant; no spinner needed.
- **Provider switcher:** mono caps label *"MODEL"* + dropdown with Anthropic (default) · OpenAI · Gemini. Visible, taught (not buried). On switch, an inline note: *"Same prompt, different model — compare."*
- **Run button:** Primary. Shows loading state during call (max 3s p50, see PRD NFR-PERF1).
- **Output canvas:** Paper card, monospace metadata at top (tokens used, provider, latency), formatted output below. Length cap honored; truncation indicated with *"…(truncated for display)"*.
- **A/B mode:** two or three output canvases side-by-side (stacked on mobile). Each labeled by lever configuration. Diff is the lesson.
- **Save-to-Toolbox:** Tertiary button on the output card. Disabled with tooltip until the learner has identity (free: email lead; paid: account).

### 5.6 Gate fork screen
- **The most important UI in the product.** Three doors, equal visual weight. Identical card shape; only the kicker and CTA copy distinguish them.
- Layout: 3-column on desktop, stacked on mobile, in the order **Pay → Email → Decline** (deliberate; the email lead is the soft middle).
- Each card: a kicker ("CONTINUE" · "NOT YET" · "MAYBE LATER"), a one-line value statement, a body paragraph (≤40 words), a primary CTA.
- No countdown timers. No "limited offer." No scarcity copy.

### 5.7 Toolbox drawer + artifact card
- **Drawer:** right-side sheet, Paper fill, full height, 380px wide desktop / full-screen mobile.
- **Header:** "TOOLBOX" mono kicker · count badge · close.
- **Artifact card:** type icon (one of the 10 `artifact_type` enums) · title · last-updated meta · open/export menu.
- **Empty state:** *"You haven't saved anything yet. Every lesson produces something — that's the Toolbox."*
- **Cap indicator on free tier:** *"3 of 4 free saves used."* Reaching 4 → next save prompts upgrade-or-decline (not a hard wall; surface gate fork copy).
- **Export:** `.md` download via signed URL; explicit button per artifact + bulk on the drawer.

### 5.8 Knowledge check
- 2–3 items per lesson, inline at lesson end.
- Multiple choice (1 correct) or true/false. Selection commits immediately; feedback inline (correct/incorrect + 1-sentence why).
- Visual: Paper card, options as bordered chips, correct = thin Ink border + checkmark, incorrect = Oxblood border + helper text.
- No grading screen — learners see results live; results logged for L2.

### 5.9 Navigation
- **Global SiteNav:** Wordmark left · primary nav center (Course · Assessment · Resources · About) · account/dashboard right. Sans 600, no italics. Hover = Ink text on slight Parch wash.
- **Course shell sidebar:** sticky on desktop, drawer on mobile. Module → lesson tree; tier indicator (FREE / PAID); completion state (filled circle).
- **Breadcrumb:** mono caps, separators with `›`. Always present in course shell.

### 5.10 Modal / Dialog
- Rare. Used only when context cannot be preserved. Default to inline disclosure.
- Paper fill, 3px radius, 1px Rule border, **no shadow** (modals here are full-bleed underlays — Ink at 40%). Close icon top-right; ESC closes; click-outside closes; focus trapped inside.

### 5.11 Toast / Notice
- Inline notice strip at top of content. No pop-up toasts.
- Variants: info (Paper + Navy left rule), success (Paper + Ink left rule), warning (Paper + Gold left rule, sparing), error (Paper + Oxblood left rule).
- Auto-dismiss never. The learner closes it.

---

## 6 · Iconography

- **No icon library.** Stroke icons drawn in-house at 1.25 stroke weight, 20×20 base, Ink color, no fill. Matches the line-driven aesthetic.
- **Approved emoji:** none in product UI. The Data Discipline Card may include the 🛡️ glyph as a literal printed mark (per the M0 curriculum template). That is the only sanctioned emoji.
- Icons are decorative when paired with a text label (always `aria-hidden="true"`); icon-only buttons (rare) must have `aria-label`.

---

## 7 · Imagery

- **No stock photos. No AI-generated faces.** Period.
- Acceptable: hand-marked-up document scans, abstract editorial illustrations (line + Gold accent), data visualizations.
- Charts: Newsreader for labels, JetBrains Mono for values, Ink lines, Gold for the focal series. No 3D, no gradients, no chart junk.

---

## 8 · Voice + microcopy (the rules)

These are CLAUDE.md voice rules elevated into the design contract because copy *is* design.

- **Editorial first, promotional never.**
- Lead with the artifact, not the tool.
- Specific over clever.
- No exclamation points.
- No emoji in UI strings.
- **Banned words:** supercharge · unlock · revolutionize · leverage · synergy · AI-powered · users (use "you").
- **Use "you," not "users."**
- **No "AI-powered" badges anywhere.**
- CTAs in mono caps. Sentence-case CTAs banned.
- No "click here" — link text describes the destination.

---

## 9 · Accessibility (WCAG 2.1 AA — non-negotiable)

This is not a chapter — it is a per-component requirement.

- **Color contrast ≥ 4.5:1** for body text, ≥ 3:1 for large/UI. Body text on Parch fails — never do that.
- **Focus order matches reading order**; visible focus ring on every interactive (2px Ink, 2px offset, never removed).
- **Keyboard:** every interactive reachable via Tab; activated by Enter + Space (or arrow keys for menus/segmented controls).
- **ARIA:** label icon-only buttons; `aria-live` for status changes (toast, validation); `aria-current="page"` on active nav.
- **Captions + transcripts:** every video has both; every audio has a transcript.
- **Motion:** respect `prefers-reduced-motion: reduce` — duration 0 for non-essential transitions.
- **Forms:** labels visible, never placeholder-as-label; error text linked to input via `aria-describedby`.
- **Skip links:** "Skip to lesson content" at top of course pages.

Every PR that touches UI is reviewed against this list. Failing one is a blocker.

---

## 10 · Responsive posture

- **Mobile-first.** Bankers will read this on phones between meetings. Default to single-column flows.
- **Breakpoints:** `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536` (Tailwind defaults).
- **Touch targets ≥ 44×44.** Especially the gate fork and sandbox levers.
- **No horizontal scrolling.** Wide tables collapse to stacked cards on `<md`.

---

## 11 · Forbidden patterns (the "never" list)

- Gradients.
- Drop shadows beyond `--ledger-shadow` on hero cards.
- Rounded corners > 4px.
- Emoji in UI strings.
- Icon libraries.
- Stock photos.
- Dark mode (deferred indefinitely — Ledger is a print aesthetic).
- "AI-powered" badges.
- Sentence-case CTAs.
- Pop-up toasts that auto-dismiss.
- Countdown timers, scarcity messaging.
- Carousels.
- Hero videos with autoplay.

---

## 12 · Component build sequence

Roughly aligned with the screen inventory:

1. Tokens + base styles (already exist on main; verify Ledger tokens are the active set).
2. Button, Input, Card, Modal, Toast/Notice (the primitives).
3. Lesson-player chrome (header, sidebar, breadcrumb, content frame).
4. Sandbox controls (levers, provider switcher, run button, output canvas).
5. Toolbox drawer + artifact card.
6. **Gate fork screen** (priority — it carries conversion).
7. Knowledge check.
8. Dashboard widgets (learner own progress + team rollup).
9. Account + admin surfaces.

Each component lands with: TSX + tests + a Storybook entry (or equivalent — open §13).

---

## 13 · Open decisions (design)

1. **Storybook vs. lightweight isolated-route gallery** for component documentation. Pick on first component.
2. **Track color marks (soft, navigational only).** The 4-pillar curriculum structure has soft pillar marks in the LMS prototype; map our 5 tracks to a quiet navigational tint (Navy + 4 muted variants?) without restoring the retired pillar discipline. Decide before the lesson player ships.
3. **Course-shell sidebar collapse behavior** on `md` — does the sidebar collapse to icons, or to a drawer? UX comfort vs. screen-real-estate trade.
4. **Custom illustration program.** If we commission editorial illustrations, the style guide for them belongs in a sub-doc.

---

## 14 · Cross-references

- CLAUDE.md → Design Context (the brand law) — this doc maps it to components.
- `AiBI_Screen_Inventory_Spec.md` — the screens these components compose into.
- Foundation PRD §7.3 (accessibility NFR).
- Module 0 Orientation — uses the Data Discipline Card (the 🛡️ printed mark exception).
- Handoff Docs Checklist — closes the "Design system / UI kit" P1.
