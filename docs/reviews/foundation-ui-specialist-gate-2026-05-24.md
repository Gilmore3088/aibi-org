# Foundation UI Specialist — /foundation/gate (2026-05-24)

**Route:** `/foundation/gate` · **HTTP:** 200 · **Source:** `src/app/(addie)/foundation/gate/page.tsx`, `src/components/addie/gate/{GateScreen,PayOptionCard,EmailOptionForm,DeclineOption}.tsx`, `src/styles/addie-course-surface.css`

## Findings

### F1 — Gold-on-ink hero copy fails WCAG AA contrast
- **Severity:** BLOCKER
- **Rule:** 4 (WCAG 2.1 AA — 4.5:1 body, 3:1 large text)
- **File:** `src/components/addie/gate/GateScreen.tsx:23`, `:33`, `:20`, `:26`
- **What's wrong:** `--ledger-accent` (`#7C5814`, gold) is rendered on the ink hero (`--ledger-ink` `#0E1B2D` blended with `--ledger-ink-2` `#1F2A3F`). Dark-gold on dark-ink yields a contrast ratio of roughly **1.9:1** — fails AA for both body (4.5:1) and large text (3:1). Affected: the "Milestone · Module 3 complete" kicker (mono small text — body threshold), the star icon strokes (non-text, so passes the WCAG-non-text 3:1 only marginally), and the second-line headline "Three doors. Pick one." (large text, still under 3:1). Gold reads as decoration here, exactly the trap the brand rule calls out ("Gold for emphasis only — never decoration").
- **Evidence:**
  ```tsx
  <span className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)]">
    Milestone · Module 3 complete
  </span>
  ...
  <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight">
    You crossed the free line.
    <br />
    <span className="text-[var(--ledger-accent)]">Three doors. Pick one.</span>
  </h1>
  ```
- **Fix:** On ink fields, use `--ledger-paper` for emphasis text and let the kicker carry the gold tint only at the icon stroke. Recolor the headline span to `--ledger-paper` (or `color-mix(in srgb, var(--ledger-paper) 92%, var(--ledger-accent))` if a warm tone is wanted — verify ≥4.5:1). Move the gold accent to a 2px ruled underline rather than a fill so the constraint "gold for emphasis, not decoration" survives.

### F2 — Stacked card chrome: LedgerCard nested inside `addie-module-card`
- **Severity:** HIGH
- **Rule:** 5 (radii 2/3/4 only) + 6 (one shadow, `--ledger-shadow`, on hero/feature only)
- **File:** `src/components/addie/gate/GateScreen.tsx:52-64`, `:89-91`; `src/components/addie/gate/PayOptionCard.tsx:78`; `src/components/addie/gate/EmailOptionForm.tsx:46`; `src/components/addie/gate/DeclineOption.tsx:65`; `src/styles/addie-course-surface.css:184` (8px radius), `:193-195` (non-`--ledger-shadow` literals), `:216-221` (hero card layered shadow).
- **What's wrong:** Every door card is wrapped twice: an outer `<div className="addie-module-card">` (8px radius, multi-layer literal shadow, gold ribbon, hover `translateY(-3px)`) wraps an inner `LedgerCard` (3px or 4px radius, `--ledger-shadow` on `feature`). The result is a card-in-a-card with two borders, two shadows, two radii. None of the corner radii used by `addie-module-card` (`border-radius: 8px`) match the Ledger spec (2/3/4 only). The shadow stacks (`0 1px 0 …, 0 1px 3px …` baseline; `0 8px 22px …, 0 2px 6px …` on hero) are bespoke literals, not `--ledger-shadow`, and they apply to every card including the Email and Decline doors which are not hero/feature.
- **Evidence:**
  ```tsx
  // GateScreen.tsx
  <div className="addie-module-card mb-6" data-tier="paid" data-emphasis="hero">
    <PayOptionCard kind="individual" />
  </div>
  ...
  <div className="addie-module-card">
    <EmailOptionForm />
  </div>
  ```
  ```tsx
  // PayOptionCard.tsx:78
  <LedgerCard variant="feature" className="p-6 flex flex-col h-full">
  ```
  ```css
  /* addie-course-surface.css:184 */
  .addie-course-surface .addie-module-card { ... border-radius: 8px; ... }
  ```
- **Fix:** Pick one chrome. Either (a) drop the outer `addie-module-card` wrapper and let `LedgerCard` carry the styling, with the gold ribbon implemented as a 3px-tall accent rule above the card via `LedgerCard`'s `className`; or (b) keep `addie-module-card` and have the gate components return their content without a `LedgerCard` (use plain elements + Ledger tokens). Either way: corner radius to 3px (or 4px for the hero door); shadow to `var(--ledger-shadow)` on the hero door only; Email and Decline doors stay shadowless.

### F3 — Hover lift (`translateY(-3px)`) violates "hover = border darken" motion rule
- **Severity:** HIGH
- **Rule:** 7 (motion: almost none; hover = border darken; no scale/translate on hover)
- **File:** `src/styles/addie-course-surface.css:242-249` (applied to every `.addie-module-card` on `/foundation/gate`)
- **What's wrong:** Every gate door (including the Email and Decline tertiary cards) lifts 3px on hover/focus with a 220ms cubic-bezier transition and a deepened multi-layer shadow. The Ledger rule is explicit: "Hover = border darken. No `group-hover:scale-*`, `group-hover:-translate-y-*`, parallax, spring physics." 220ms also exceeds the 120ms UI budget.
- **Evidence:**
  ```css
  .addie-course-surface .addie-module-card:hover,
  .addie-course-surface .addie-module-card:focus-within {
    border-color: var(--ledger-ink);
    transform: translateY(-3px);
    box-shadow:
      0 12px 28px -10px color-mix(in srgb, var(--ledger-ink) 22%, transparent),
      0 4px 8px -3px color-mix(in srgb, var(--ledger-ink) 10%, transparent);
  }
  ```
- **Fix:** Drop the `transform` and the elevated `box-shadow`; keep the `border-color: var(--ledger-ink)` change and shorten the transition to `border-color 120ms cubic-bezier(0.4, 0, 0.2, 1)`. The tertiary override already disables the lift — extend that discipline to all cards.

### F4 — Gold-on-ink small-mono kicker on the ink hero — second instance
- **Severity:** HIGH
- **Rule:** 4 (WCAG 2.1 AA — 4.5:1 small text)
- **File:** `src/styles/addie-course-surface.css:259` (paid ribbon rotated badge — applies to `data-tier='paid'` cards including the hero Pay door and the team-buy Pay door)
- **What's wrong:** The rotated "PAID" badge sets `color: var(--ledger-paper)` on `background: var(--ledger-accent)` (`#7C5814` gold). Paper (`#F4F1E7`) on darkened gold is roughly **5.3:1** — passes — but the badge is 0.6rem mono, which still reads as decoration overlaid on a parch/paper card. The earlier hero kicker (F1) is the worse case; this one passes but only because the gold was darkened on 2026-05-21. Flag for awareness — no fix required if the contrast math is verified. Listed at LOW because the issue is "is the gold being used as decoration?" rather than a contrast failure.
- **Evidence:**
  ```css
  .addie-course-surface .addie-module-card[data-tier='paid']::before {
    content: 'PAID';
    ...
    background: var(--ledger-accent);
    color: var(--ledger-paper);
    ...
  }
  ```
- **Fix:** None required for contrast. Reconsider whether a rotated ribbon badge fits the editorial-ledger aesthetic — the spec calls for "lines do real work, replace boxes and shadows," and a rotated badge is the opposite. Replacing with a static mono kicker ("PAID PATH") inside the card would be more on-brand. Demote to MEDIUM if kept.

### F5 — Banner uses "doors" metaphor twice — voice is editorial-promotional, not editorial-first
- **Severity:** MEDIUM
- **Rule:** 8 (voice — editorial first, promotional never; "Specific over clever")
- **File:** `src/components/addie/gate/GateScreen.tsx:33`
- **What's wrong:** "Three doors. Pick one." is a metaphor — it's clever, not specific. The hero already says "You crossed the free line." The lede explains the three options. Pairing those two lines with a metaphor frames the page as marketing collateral rather than the consulting artifact the brand voice requires. (The brief also warns against exclamation, scarcity, and promotional flourish — none present, but the metaphor is the same family.)
- **Evidence:**
  ```tsx
  <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight">
    You crossed the free line.
    <br />
    <span className="text-[var(--ledger-accent)]">Three doors. Pick one.</span>
  </h1>
  ```
- **Fix:** Replace with the concrete option set: "Continue, save, or take the assessment." or "Three ways to keep going." If the visual two-line break is wanted, drop the second line and let the lede carry the explanation.

### F6 — Heading order: nested `<h2>` inside a `<section>` with its own `<h2>`
- **Severity:** MEDIUM
- **Rule:** 4 (heading order must not skip; screen-reader navigability)
- **File:** `src/components/addie/gate/GateScreen.tsx:75` ("Bring the whole team in.") + `src/components/addie/gate/PayOptionCard.tsx:80` (team card renders its own `<h2>Foundation for your team</h2>`)
- **What's wrong:** The team-buy `<section id="team">` declares its heading as `<h2>Bring the whole team in.</h2>`, then renders a `PayOptionCard kind="team"` inside the section that emits a second peer `<h2>Foundation for your team</h2>`. Two peer h2s describing the same conceptual thing within one section confuses screen-reader heading lists and reads as a copy duplication. The Pay/Email/Decline doors at the top of the page each emit `<h2>` too, which is correct because each is its own section — but the team card should step down because it lives inside an h2-headed section.
- **Evidence:**
  ```tsx
  // GateScreen.tsx:75
  <h2 className="mt-3 font-serif text-3xl ...">Bring the whole team in.</h2>
  ```
  ```tsx
  // PayOptionCard.tsx:80
  <h2 className="mt-2 font-serif text-2xl ...">{c.title}</h2>
  ```
- **Fix:** Either (a) demote the inner card's heading to `<h3>` when `kind === 'team'` (pass a `headingLevel` prop), or (b) drop the outer section h2 and let `PayOptionCard`'s h2 be the section heading, moving "Bring the whole team in." to a `KickerLabel` + lede arrangement.

### F7 — `bg-[var(--ledger-paper)]` body text on optional reminder input — fine; but raw `<input>` skips the LedgerInput component
- **Severity:** MEDIUM
- **Rule:** 5 (radii 2px on inputs) + DRY (one Ledger surface component, not a re-implementation)
- **File:** `src/components/addie/gate/DeclineOption.tsx:87-97`
- **What's wrong:** The optional remind-me email input is a raw `<input>` with bespoke Tailwind: `bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] rounded-[2px] focus:outline-none focus:border-[var(--ledger-ink)]`. The radius and tokens are correct, but `LedgerInput` already exists (used by `EmailOptionForm`) and presumably handles focus rings, error states, label association, and disabled visuals. Duplicating it inline drifts the form vocabulary across the gate fork — Email door uses `LedgerInput`, Decline door uses a hand-rolled equivalent. Also: `focus:outline-none` without a visible focus indicator beyond `border-[var(--ledger-ink)]` is borderline for keyboard a11y — Ledger's design context explicitly cites "focus rings, skip links" as required.
- **Evidence:**
  ```tsx
  <input
    id="decline-remind-email"
    type="email"
    ...
    className="w-full px-3 py-2 text-sm bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] rounded-[2px] focus:outline-none focus:border-[var(--ledger-ink)]"
  />
  ```
- **Fix:** Replace with `<LedgerInput label="Optional · remind me in a few weeks" type="email" ... />`. If `LedgerInput` doesn't support a "no label, just placeholder" shape, add a `kickerLabel` prop instead of bypassing the component.

### F8 — Lede inline-styles opacity for muted text on hero
- **Severity:** LOW
- **Rule:** 2 (Ledger tokens only — `opacity-80` is non-token modulation)
- **File:** `src/components/addie/gate/GateScreen.tsx:35`
- **What's wrong:** Hero lede sets `text-[var(--ledger-paper)] opacity-80`. The token system has explicit muted-on-ink colors available via `color-mix` (`--ledger-paper` blended down) — using a Tailwind opacity utility bypasses the token. Functionally OK (still passes contrast at 80% on dark ink, roughly 9.5:1), but it's a discipline drift: every other muted-text site on the page uses `--ledger-muted` / `--ledger-ink-2`, not an opacity modifier.
- **Evidence:**
  ```tsx
  <p className="mt-5 text-lg text-[var(--ledger-paper)] opacity-80 max-w-2xl mx-auto leading-relaxed">
  ```
- **Fix:** Define a `--ledger-paper-muted` token (`color-mix(in srgb, var(--ledger-paper) 80%, var(--ledger-ink))`) in `tokens-ledger.css` and use it here. Or drop the opacity and rely on the lede's role being clear from typography (size + weight).

### F9 — `Pay $295` / `Buy seats` / `Save my work` button labels are sentence-case
- **Severity:** LOW
- **Rule:** 8 (voice — "no sentence-case CTAs (mono caps only)" per Design Context "Never" list)
- **File:** `src/components/addie/gate/PayOptionCard.tsx:23`, `:32`; `src/components/addie/gate/EmailOptionForm.tsx:78`; `src/components/addie/gate/DeclineOption.tsx:104`
- **What's wrong:** Every CTA on the page is sentence-case ("Pay $295", "Buy seats", "Save my work", "Take the assessment · $99"). The Design Context "Never" list ends with "sentence-case CTAs (mono caps only)." This rule is honored on the rest of the course surface (the back-link uses `font-mono uppercase tracking-[0.16em]`) but broken on the primary action buttons. `LedgerButton` presumably handles this via variant — if it doesn't enforce caps, that's the deeper fix.
- **Evidence:**
  ```ts
  individual: { ..., cta: 'Pay $295', ... },
  team:       { ..., cta: 'Buy seats', ... },
  ```
  ```tsx
  <LedgerButton type="submit" variant="primary" ...>Save my work</LedgerButton>
  ```
- **Fix:** Either rewrite labels in the call sites ("PAY · $295", "BUY SEATS", "SAVE MY WORK", "TAKE THE ASSESSMENT · $99") with mono caps + 0.16em tracking, or — preferable — have `LedgerButton` apply `font-mono uppercase tracking-[0.16em]` automatically for `variant="primary"` and `variant="secondary"` and pass labels as written.

### F10 — Reassurance kickers say "No countdowns" / "No scarcity" — telegraphs scarcity by negation
- **Severity:** LOW
- **Rule:** 8 (voice — institutional, not promotional; "Specific over clever")
- **File:** `src/components/addie/gate/GateScreen.tsx:98-99`
- **What's wrong:** The footer strip leads with "No countdowns" and "No scarcity." These are useful reassurances *because* SaaS funnels overuse those tactics — but stating them invites the comparison. An editorial-first voice would describe the policy positively: "Your progress is kept" / "Take the time you need." Reads as a hedge against the very thing the brand says it isn't.
- **Evidence:**
  ```tsx
  { k: 'No countdowns', v: 'Your progress and artifacts are kept...' },
  { k: 'No scarcity',   v: 'There is no cohort opening soon...' },
  ```
- **Fix:** Rephrase the kicker to the positive: "Kept indefinitely" / "Open enrollment" / "Built for bankers" (already positive). Leave the body copy as written — it carries the substance.

## Verdict
**fix-then-ship.** F1 is a WCAG AA blocker on a hero headline; F2 + F3 are HIGH violations of the Ledger card/motion vocabulary that affect every other course page sharing `addie-course-surface.css` and should land in the same fix pass.
