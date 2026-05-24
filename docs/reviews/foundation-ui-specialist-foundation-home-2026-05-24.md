# Foundation UI Specialist — /foundation (course home) (2026-05-24)

**Route:** `/foundation` · **HTTP:** 200 · **Source:** `src/app/(addie)/foundation/page.tsx` (+ `src/components/addie/shell/ModuleCard.tsx`, `src/styles/addie-course-surface.css`)

Verified against the post-fix state (commit `7f6d1cb`). Page renders. Heading order valid (`h1 → h2 → h3` repeated, no skips). No banned words, no exclamation points, no emoji, no italics in JSX, no "FFIEC", no "AI-powered", no credential/Specialist/certificate copy. Stat strip uses unsourced figures (`6`, `24`, `<15m`) — these are internal product structure, not external statistics, so Rule 10 does not apply.

## Findings

### F1 — Literal rgba shadow on primary CTA button (rule 6)
- **Severity:** HIGH
- **Rule:** 6 — One shadow only (`--ledger-shadow`) and only on hero/feature cards. No shadow on buttons.
- **File:** `src/app/(addie)/foundation/page.tsx:144`
- **What's wrong:** The "Start Module 0" hero button carries a hand-rolled rgba drop shadow. The bar is: buttons get no shadow, and the only allowed shadow token is `--ledger-shadow`.
- **Evidence:**
  ```tsx
  className="... rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms] shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]"
  ```
- **Fix:** Remove the `shadow-[…]` arbitrary value. Buttons rely on fill + border-darken on hover, nothing else.

### F2 — Literal multi-stop rgba shadow on featured hero card (rule 6)
- **Severity:** HIGH
- **Rule:** 6 — Hero/feature cards may carry one shadow, and it must be `var(--ledger-shadow)`, not a raw rgba literal.
- **File:** `src/app/(addie)/foundation/page.tsx:190`
- **What's wrong:** The featured-module card uses a two-stop literal rgba shadow instead of the single shared token. This is the exact "hex/rgba outside the four exempt contexts" failure mode rule 2 calls out, applied to shadows under rule 6.
- **Evidence:**
  ```tsx
  <article className="relative rounded-[12px] ... bg-[var(--ledger-paper)] p-6 shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)] transition-transform duration-[200ms] group-hover:-translate-y-1">
  ```
- **Fix:** Replace with `shadow-[var(--ledger-shadow)]`. Add a `--ledger-shadow` token in `tokens-ledger.css` if it does not yet exist (the design context mandates it).

### F3 — Radius `12px` violates the 2/3/4-only rule on the featured card and its two stacked layers (rule 5)
- **Severity:** HIGH
- **Rule:** 5 — Radii are 2px (buttons/inputs/chips), 3px (cards), 4px (hero cards). Nothing else.
- **File:** `src/app/(addie)/foundation/page.tsx:188-190`
- **What's wrong:** Three stacked layers (tape, accent tint, paper card) all use `rounded-[12px]`. Even at hero scale the maximum is 4px.
- **Evidence:**
  ```tsx
  <div className="absolute -top-4 -left-4 right-8 bottom-8 rounded-[12px] bg-[var(--ledger-tape)] -z-10" aria-hidden />
  <div className="absolute top-4 left-4 right-0 bottom-0 rounded-[12px] bg-[color-mix(in_srgb,var(--ledger-accent)_18%,var(--ledger-paper))] -z-10" aria-hidden />
  <article className="relative rounded-[12px] ...
  ```
- **Fix:** Change all three to `rounded-[4px]` (hero-card tier).

### F4 — Hover lift on featured card (rule 7)
- **Severity:** MEDIUM
- **Rule:** 7 — Motion is almost none. Hover = border darken. No `group-hover:-translate-y-*`.
- **File:** `src/app/(addie)/foundation/page.tsx:190`
- **What's wrong:** `group-hover:-translate-y-1` is the exact pattern rule 7 enumerates as banned.
- **Evidence:**
  ```tsx
  shadow-[...] transition-transform duration-[200ms] group-hover:-translate-y-1
  ```
- **Fix:** Drop `transition-transform` + `group-hover:-translate-y-1`. Indicate hover with `hover:border-[var(--ledger-ink)]` on the article instead. The arrow nudge on lines 147 and 327 is also outside spec — see F6.

### F5 — Background gradients on hero sections (rule unnumbered — "Never: gradients")
- **Severity:** MEDIUM
- **Rule:** Design context "Never" list — gradients are out.
- **File:** `src/styles/addie-course-surface.css:78-85` (`addie-hero-parch`), `:106-110` (`addie-hero-ink`)
- **What's wrong:** Both hero classes layer two radial gradients plus a linear gradient. The page mounts both on `/foundation` (top parch hero and closing ink hero). This breaks the "newspaper bones, software polish" surface discipline at the most prominent moment on the page.
- **Evidence:**
  ```css
  .addie-course-surface .addie-hero-parch {
    background:
      radial-gradient(60% 80% at 100% 0%, color-mix(...) 0%, transparent 55%),
      radial-gradient(70% 60% at 0% 100%, color-mix(...) 0%, transparent 55%),
      linear-gradient(180deg, var(--ledger-paper), var(--ledger-bg));
  }
  ```
- **Fix:** Flatten to a single token. Top hero → `background: var(--ledger-paper)`. Closing dark hero → `background: var(--ledger-ink)`. If a faint accent wash is desired, the existing `::before` ledger-ruling pattern already supplies texture without color gradients.

### F6 — Hover arrow translate + gap morph (rule 7)
- **Severity:** LOW
- **Rule:** 7 — "Hover = border darken." `group-hover:translate-x-*` and `group-hover:gap-*` morphs are out.
- **File:** `src/app/(addie)/foundation/page.tsx:147, 218, 327`
- **What's wrong:** Three `group-hover:translate-x-1` and one `group-hover:gap-2.5` micro-motions on arrows / "Continue →" affordances.
- **Evidence:**
  ```tsx
  // line 147
  <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
  // line 218
  inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-[160ms]
  // line 327
  <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
  ```
- **Fix:** Drop the `transition-*` + `group-hover:*` portions on these spans. The arrow is the signal; motion is not.

### F7 — `opacity-80` on display ink text may dip below 4.5:1 (rule 4)
- **Severity:** LOW
- **Rule:** 4 — WCAG 2.1 AA, 4.5:1 text/background contrast.
- **File:** `src/app/(addie)/foundation/page.tsx:133`
- **What's wrong:** Line three of the hero (`By Monday.`) is `text-[var(--ledger-ink-2)] opacity-80` on the paper→bg gradient. `--ledger-ink-2` (`#1F2A3F`) at 80% opacity over `#F4F1E7` blends to roughly `#5D6776` — well below AA for normal text. The text is large (4.25rem at lg) so the AA threshold drops to 3:1 large text and it likely passes there, but the pattern is fragile (sm breakpoint at 2.75rem hovers near the 24px large-text boundary depending on viewport).
- **Evidence:**
  ```tsx
  <span className="text-[var(--ledger-ink-2)] opacity-80">By Monday.</span>
  ```
- **Fix:** Drop `opacity-80`. If a softer-than-ink-2 tone is needed, use `text-[var(--ledger-muted)]` (the token darkened 2026-05-21 specifically for AA).

### F8 — Featured-card kicker chip uses ambient unique copy that conflates two states (voice, rule 8)
- **Severity:** LOW
- **Rule:** 8 — Voice, "Specific over clever."
- **File:** `src/app/(addie)/foundation/page.tsx:193`
- **What's wrong:** The "Continue where you left" chip drops the trailing "off." Reads as a typo, not editorial restraint.
- **Evidence:**
  ```tsx
  {featuredModule.completed > 0 ? 'Continue where you left' : 'Start here'}
  ```
- **Fix:** `'Continue where you left off'` (or `'Pick up where you left off'`). The card has room.

## Verdict
**fix-then-ship** — Three HIGH findings (button shadow, featured-card rgba shadow, 12px radius stack) are direct rule-2/5/6 breaches in the most visible component on the page; the medium gradient + hover-lift findings are the next priority. Everything else is small. No blockers.
