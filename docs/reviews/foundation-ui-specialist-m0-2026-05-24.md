# Foundation UI Specialist — Module 0 (2026-05-24)

**Routes reviewed:** `/foundation/m0`, `/foundation/m0/m0.1`, `/foundation/m0/m0.2`
**Worktree:** `feature/addie-v1`
**Dev server:** `http://localhost:3000` — all three routes return HTTP 200, but two of three render the `(addie)` not-found shell (see F0).

---

## F0 — Both lesson routes render the (addie) not-found page (preflight blocker)

- **Severity:** BLOCKER
- **Rule:** Brief preflight ("If `curl` ≠ 200, that is finding #1") — extended in spirit to "route returns 200 but renders not-found body."
- **File:** `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:332` (`if (!payload) notFound();`)
- **What's wrong:** Both `/foundation/m0/m0.1` and `/foundation/m0/m0.2` return HTTP 200 but the response body is the `(addie)/not-found.tsx` shell ("That page isn't part of the Foundation."). `loadPayload()` is returning `null` for every lesson route I probed (`m0.1`, `m0.2`, `m1.1`, `m3.1`, `m3.5`, `m4.1–m4.3`). The module index `/foundation/m0` renders correctly and lists m0.1/m0.2 in its lesson list, so the `lessons` and `modules` rows exist and are `published=true` — the failure is somewhere inside `loadPayload` (likely a downstream `.maybeSingle()` returning a thrown error that gets caught by the `try/catch` at line 282, swallowing it as `console.warn`). No log line shows up in `/tmp/addie-dev.log`, so the silent-fail catch is also masking the cause.
- **Evidence:**
  ```bash
  $ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/foundation/m0/m0.1
  200
  $ curl -s http://localhost:3000/foundation/m0/m0.1 | grep -c "isn't part of the Foundation"
  1
  $ curl -s http://localhost:3000/foundation/m0/m0.1 | grep -c "Module 0\|Orientation\|Lesson 1 of\|SacredRule\|RuleHeroCard"
  0
  ```
  Visible content fingerprint of `/foundation/m0/m0.1`: `Sign in` · `That page` · `isn't part of the Foundation` — same as `/foundation/m0/m0.2` (both responses are 51,437 bytes, identical length, identical body).
- **Fix:** Instrument `loadPayload` to log the failing query (which `await` swallowed the error) — replace the bare `catch (err) { console.warn(…) }` at `[lessonId]/page.tsx:282` with `console.error('[lesson page] payload load failed:', { moduleId, lessonId, err })` and re-run. The likely candidates from reading the source: (a) `extractHeadings(bodyForToc)` upstream is fine but `body_md` is `null` (which would NOT trigger notFound — that path is downstream of `loadPayload`), so the issue is one of the four `.maybeSingle()` calls in `loadPayload` itself; (b) Supabase `lesson_track_variants`, `knowledge_checks`, or `exercises` query failing in a way that throws (not error-objects) and lands in the catch. Until lesson routes render, **the per-lesson visual review of m0.1 and m0.2 cannot be done from the running app** — the rest of this report is source-only (F-series for the v2 shell + module page).

---

## Route 1 — `/foundation/m0` (module index)

**Status:** Renders correctly (hero · intro video · what-you'll-learn · lessons grid · Begin CTA).
**Source:** `src/app/(addie)/foundation/[moduleId]/page.tsx`

### F1 — Hero illustration card uses 12px radius (>4px ceiling)

- **Severity:** HIGH
- **Rule:** Radii (rule 5) — 2px buttons/inputs/chips · 3px cards · 4px hero cards. Flag any other literal.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:232–234`
- **What's wrong:** The hero illustration stack uses three nested `rounded-[12px]` containers. The ceiling is 4px for hero cards.
- **Evidence:**
  ```tsx
  <div className="absolute -top-4 -left-4 right-8 bottom-8 rounded-[12px] bg-[var(--ledger-tape)] -z-10" aria-hidden />
  <div className="absolute top-4 left-4 right-0 bottom-0 rounded-[12px] bg-[color-mix(in_srgb,var(--ledger-accent)_18%,var(--ledger-paper))] -z-10" aria-hidden />
  <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-5 shadow-[…rgba(14,27,45,0.3)…]">
  ```
- **Fix:** Replace all three `rounded-[12px]` with `rounded-[4px]` (hero card ceiling). The "stacked paper" effect remains visible from the offset positioning alone.

### F2 — Hero card uses a custom two-layer shadow instead of `--ledger-shadow`

- **Severity:** HIGH
- **Rule:** One shadow only (rule 6) — `--ledger-shadow` on hero/feature cards only. Flag every `shadow-[…rgba…]` literal.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:234`
- **What's wrong:** Custom multi-layer rgba shadow on the illustration card.
- **Evidence:**
  ```tsx
  <div className="… shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]">
  ```
- **Fix:** Replace with `shadow-[var(--ledger-shadow)]`. If the design genuinely needs a heavier hero shadow than the global token allows, propose a new `--ledger-shadow-hero` token in `tokens-ledger.css` rather than inlining rgba literals.

### F3 — "Begin Module" CTA button carries a custom drop-shadow (buttons get no shadow)

- **Severity:** HIGH
- **Rule:** One shadow only (rule 6) — shadows allowed on hero/feature cards only, not on buttons.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:218`
- **What's wrong:** The primary CTA carries a `shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]` literal.
- **Evidence:**
  ```tsx
  <Link href={beginHref} className="… bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms] shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]">
  ```
- **Fix:** Drop the `shadow-[…]` utility. The dark-ink fill is enough lift; the rest of the site's primary CTAs (`/foundation`, `/foundation/gate`) are shadow-less.

### F4 — Lesson cards use 6px radius (cards should be 3px)

- **Severity:** MEDIUM
- **Rule:** Radii (rule 5) — 3px cards.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:287, 320`
- **What's wrong:** The "Takeaway" tape callout and every clickable lesson row use `rounded-[6px]`. The brief allows 3px (cards) or 4px (hero cards); 6px isn't on the menu.
- **Evidence:**
  ```tsx
  <div className="mt-4 rounded-[6px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] p-5 sm:p-6">
  ```
  ```tsx
  <Link href={`/foundation/${m.id}/${l.id}`} className="group block rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] …">
  ```
- **Fix:** `rounded-[3px]` for the lesson rows and the takeaway tape. Reserve 4px for the hero card.

### F5 — Lesson card uses `hover:shadow-[var(--ledger-shadow)]` on a non-hero card

- **Severity:** MEDIUM
- **Rule:** One shadow only (rule 6) — `--ledger-shadow` is reserved for hero/feature cards.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:320`
- **What's wrong:** Lesson rows are list items, not hero cards. Adding `--ledger-shadow` on hover crosses the rule.
- **Evidence:**
  ```tsx
  className="group block rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] transition-all duration-[160ms] p-4 sm:p-5"
  ```
- **Fix:** Remove `hover:shadow-[var(--ledger-shadow)]`. Keep `hover:border-[var(--ledger-ink)]` — that IS the Ledger hover signal ("Hover = border darken," rule 7).

### F6 — Bottom secondary CTA has bg→border-on-hover swap (no border baseline)

- **Severity:** LOW
- **Rule:** Motion (rule 7) — hover changes should be small (border darken). Replacing fill with border on hover causes a 1px layout shift.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:361`
- **What's wrong:** `bg-[var(--ledger-accent)] … hover:bg-[var(--ledger-paper)] hover:border hover:border-[var(--ledger-ink)]`. The `hover:border` adds a 1px border that isn't there at rest, shifting layout.
- **Evidence:**
  ```tsx
  className="… px-7 py-4 rounded-[4px] bg-[var(--ledger-accent)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] hover:border hover:border-[var(--ledger-ink)] transition-colors duration-[160ms]"
  ```
- **Fix:** Give the button a transparent border at rest (`border border-transparent`) and recolor on hover (`hover:border-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)]`), so the layout doesn't shift. Or just hold the gold fill and darken to `--ledger-accent` mix on hover.

### F7 — `transition-all` on lesson rows over-broadens animated properties

- **Severity:** LOW
- **Rule:** Motion (rule 7) — almost none; explicit, narrow transitions.
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:320, 347`
- **What's wrong:** `transition-all` animates every changed property (incl. shadow, transform, border, color). The Ledger pattern is narrow — `transition-colors`.
- **Evidence:**
  ```tsx
  className="… transition-all duration-[160ms] …"
  …
  <span aria-hidden className="… group-hover:translate-x-1 transition-all duration-[160ms]">→</span>
  ```
- **Fix:** Use `transition-colors duration-[120ms]` on the row, and `transition-transform duration-[120ms]` on the arrow chevron.

### F8 — Hero CTA arrow has `group-hover:translate-x-1` micro-animation

- **Severity:** LOW
- **Rule:** Motion (rule 7) — "Flag `group-hover:scale-*`, `group-hover:-translate-y-*`, parallax, scroll-jacking, spring physics."
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:221, 364`
- **What's wrong:** The brief lists `group-hover:scale-*` and `group-hover:-translate-y-*` as flag-worthy. `group-hover:translate-x-1` on an arrow chevron is the same family (decorative motion). The hover-arrow-slide pattern is a SaaS marketing tell that conflicts with "Editorial first, promotional never."
- **Evidence:**
  ```tsx
  <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
  ```
- **Fix:** Remove the translate. Arrow color shift on hover (`group-hover:text-[var(--ledger-ink)]`) carries the affordance without motion.

---

## Route 2 — `/foundation/m0/m0.1` (track-picker lesson)

**Status:** BLOCKED — renders the (addie) not-found shell. See F0. Cannot review the rendered lesson surface (LessonShellHeader, ReadingLessonView, TrackPickerInline, KnowledgeCheck, SaveTakeawayCTA, NextLessonCTA, MaturityCelebration, ProactiveTutorSuggestion, ToolboxAccumulation).

The source review below (M0.1 routes through the standard `LessonPlayer`) found no rule violations in `LessonPlayer.tsx`, `LessonShellHeader.tsx`, `ReadingLessonView.tsx`, `LessonObjectiveBeat.tsx`, `LessonTransferBeat.tsx`, `TrackPickerInline.tsx`, or `ModuleIntroVideo.tsx` (no italic literals, no non-token shadows, no >4px radii, no banned words). The visual outcomes (typography hierarchy, contrast on parch surfaces, hover behavior, MaturityCelebration overlay) cannot be confirmed until F0 is resolved.

### F9 — Lesson page cannot be visually QA'd while F0 is open

- **Severity:** BLOCKER (re-raises F0 in the m0.1 context)
- **Rule:** N/A — execution gate.
- **File:** `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:332`
- **What's wrong:** See F0. The route renders a 51KB not-found shell where the LessonPlayer should live.
- **Fix:** Resolve F0 first. Re-dispatch a specialist on m0.1 after the lesson player loads.

---

## Route 3 — `/foundation/m0/m0.2` (v2 lesson shell — M02Experience)

**Status:** BLOCKED at render time — see F0. Source-only review below.
**Source:** `src/components/addie/lesson/v2/M02Experience.tsx` + sibling files in `src/components/addie/lesson/v2/`.

The v2 shell is well-considered architecturally — one focused step at a time, sacred-rule full-bleed moment, keyboard nav (Enter/Space commit, Escape no-op per the A5 accessibility audit), focus management on step change (A11). The Sacred Rule modal is correctly scoped (background scroll lock, focus restore, single-CTA focus loop). The dot-strip step progress is restrained and on-brand. The findings below are all design-system compliance, not architecture.

### F10 — `RuleHeroCard` uses 6px radius (cards should be 3px or hero 4px)

- **Severity:** HIGH
- **Rule:** Radii (rule 5).
- **File:** `src/components/addie/lesson/v2/RuleHeroCard.tsx:15`
- **What's wrong:** The "one big rule" card uses `rounded-[6px]`. This is a hero card; ceiling is 4px.
- **Evidence:**
  ```tsx
  <article className="rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)] overflow-hidden">
  ```
- **Fix:** `rounded-[4px]`.

### F11 — `RuleHeroCard` footer puts body copy on `--ledger-parch`

- **Severity:** HIGH
- **Rule:** WCAG 2.1 AA + design-context note: "Body text on Paper or BG, never on Parch (insufficient contrast)."
- **File:** `src/components/addie/lesson/v2/RuleHeroCard.tsx:29–35`
- **What's wrong:** The elevator-test footer renders body text on `bg-[var(--ledger-parch)]`. CLAUDE.md is explicit: body never on parch.
- **Evidence:**
  ```tsx
  <footer className="px-8 sm:px-12 py-5 border-t border-[var(--ledger-rule)] bg-[var(--ledger-parch)]">
    <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">The elevator test</div>
    <p className="font-serif text-[0.95rem] leading-snug text-[var(--ledger-ink-2)]">{elevator}</p>
  </footer>
  ```
- **Fix:** Move the footer onto `bg-[var(--ledger-paper)]` (same as the card body) and let the `border-t` carry the section break, or use `bg-[var(--ledger-tape)]` for a kept-paper feel — both are sanctioned body backgrounds.

### F12 — `DataDisciplineCardArtifact` repeats both violations (6px + parch body)

- **Severity:** HIGH
- **Rule:** Radii (rule 5) + WCAG / "body never on parch."
- **File:** `src/components/addie/lesson/v2/DataDisciplineCardArtifact.tsx:38, 102`
- **What's wrong:** `rounded-[6px]` on the saved-card hero, and the footer ("AiBI Foundation · M0.2 takeaway · v1") sits on `bg-[var(--ledger-parch)]`. The footer text is mono-caps muted, which is technically metadata (not "body"), but the parch underlay also reduces contrast below AA for `--ledger-muted` (~3.6:1 on parch vs. ~4.6:1 on paper).
- **Evidence:**
  ```tsx
  <article className="rounded-[6px] border-2 border-[var(--ledger-ink)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)] overflow-hidden">
  …
  <footer className="px-6 sm:px-8 py-3 border-t border-[var(--ledger-rule)] bg-[var(--ledger-parch)] flex items-baseline justify-between">
    <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">AiBI Foundation · M0.2 takeaway</span>
  ```
- **Fix:** `rounded-[4px]` on the card; move the footer to `bg-[var(--ledger-paper)]` (border-t alone separates it visually).

### F13 — Recap dark callout uses `rounded-[6px]`

- **Severity:** MEDIUM
- **Rule:** Radii (rule 5).
- **File:** `src/components/addie/lesson/v2/M02Experience.tsx:201`
- **What's wrong:** The "Your Monday move" dark-ink card on the recap step uses `rounded-[6px]`.
- **Evidence:**
  ```tsx
  <article className="rounded-[6px] border border-[var(--ledger-ink)] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] px-6 sm:px-8 py-6">
  ```
- **Fix:** `rounded-[4px]` (hero callout) or `rounded-[3px]` (card). Match whichever the rest of the v2 shell standardizes on after the F10 / F12 fixes.

### F14 — Recap "What you learned" + Monday-move use `rounded-[5px]` (not on the radii menu)

- **Severity:** MEDIUM
- **Rule:** Radii (rule 5).
- **File:** `src/components/addie/lesson/v2/M02Experience.tsx:216` and `src/components/addie/lesson/v2/AnonymizationFlow.tsx:64, 113, 137`
- **What's wrong:** `rounded-[5px]` literals across the v2 shell and AnonymizationFlow. 5 is neither 2/3/4. The mid-value reads soft and SaaS-y on the editorial surface.
- **Evidence:**
  ```tsx
  <article className="rounded-[5px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5">
  ```
  ```tsx
  <article className={`rounded-[5px] border ${allStripped ? 'border-[var(--ledger-rule)]' : 'border-[var(--ledger-weak)]'} bg-[var(--ledger-paper)] px-6 py-5 …`}>
  ```
- **Fix:** Standardize on `rounded-[3px]` (cards) across the v2 shell. The fact that three components independently chose `5px` suggests an unwritten "v2 cards = 5px" pattern that should be hoisted into the token system or just snapped to the brief's 3px.

### F15 — Recap "What you learned" list uses literal check-mark glyphs (`✓`)

- **Severity:** MEDIUM
- **Rule:** Voice + "no emoji" (rule 8 + CLAUDE.md Design Context "Never: … emoji, icon libraries").
- **File:** `src/components/addie/lesson/v2/M02Experience.tsx:221–224` and `DataDisciplineCardArtifact.tsx:130`
- **What's wrong:** Bullet items begin with `✓ `, and the Save button reads `✓ Saved to Toolbox`. `✓` (U+2713) is a Dingbat glyph — the brief and design context both forbid emoji / icon-library glyphs. The Ledger pattern is mono-caps labels and ruled lines doing the visual work.
- **Evidence:**
  ```tsx
  <li>✓ The one rule — what never goes into AI</li>
  <li>✓ How to strip identifiers</li>
  ```
  ```tsx
  {saving ? 'Saving…' : saved ? '✓ Saved to Toolbox' : 'Save to Toolbox'}
  ```
- **Fix:** Replace `✓` with a mono-caps marker or a hairline rule. Two compliant options: (a) `<li><span className="font-mono text-[var(--ledger-accent)] mr-2">✓</span>` is still a glyph — instead use `<span aria-hidden className="inline-block w-3 border-t border-[var(--ledger-accent)] mr-3 align-middle" />` for a hairline tick; (b) `<span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-accent)] mr-3">Done</span>`. For the button: drop the glyph and rely on the disabled state + label ("Saved to Toolbox").

### F16 — Off-limits list uses literal `×` glyph for "off-limits" markers

- **Severity:** LOW
- **Rule:** Voice + "no emoji / icon glyphs."
- **File:** `src/components/addie/lesson/v2/DataDisciplineCardArtifact.tsx:85`
- **What's wrong:** `<span className="text-[var(--ledger-weak)] shrink-0">×</span>` — `×` (U+00D7) is a typographic glyph standing in for an icon. Same rule as F15.
- **Evidence:**
  ```tsx
  <li key={i} className="flex gap-2">
    <span className="text-[var(--ledger-weak)] shrink-0">×</span>
    <span>{item}</span>
  </li>
  ```
- **Fix:** Replace with a small mono kicker (`<span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-weak)] mr-2 mt-0.5">Off</span>`) or a hairline rule. The oxblood color (`--ledger-weak`) is already doing the signal; the glyph is redundant.

### F17 — Sacred-Rule continue text "Press Enter or tap to continue" lacks visible-focus parity for mouse users

- **Severity:** LOW
- **Rule:** WCAG 2.1 AA (rule 4) — focus visibility.
- **File:** `src/components/addie/lesson/v2/SacredRule.tsx:154–160`
- **What's wrong:** The dialog has a single CTA at `bottom-12` but the helper text at `bottom-3` ("Press Enter or tap to continue") only mentions Enter/tap — Space is also bound (line 82) and Escape is intentionally a no-op (line 90). A learner who presses Esc expecting to dismiss gets no acknowledgement. Not a contrast or focus violation per se, but a discoverability gap for keyboard users.
- **Evidence:**
  ```tsx
  // commit gestures — only explicit acknowledgement advances
  if (e.key === 'Enter' || e.key === ' ') { … }
  // Escape — safe no-op …
  if (e.key === 'Escape') { e.preventDefault(); buttonRef.current?.focus(); }
  …
  <span … >Press Enter or tap to continue</span>
  ```
- **Fix:** Update the helper text to "Press Enter, Space, or tap to continue" (Escape stays unmentioned to reinforce it's not a commit). Or render the CTA as a visible button (it already is one — labelled "I'm ready →") and drop the helper string entirely; the button alone teaches the gesture.

### F18 — `<strong>` for emphasis inside body — verify roman rendering still reads correctly

- **Severity:** LOW
- **Rule:** Typography (rule 3) — italics retired; emphasis is color + weight.
- **File:** `src/components/addie/lesson/v2/M02Experience.tsx:139` and `DataDisciplineCardArtifact.tsx:72–74`
- **What's wrong:** Not a violation — these correctly use `<strong>` with `font-semibold` + `text-[var(--ledger-ink)]` (color + weight). Flagging for verification: confirm the Newsreader 600 weight is loading; if only 400/700 are bundled, `font-semibold` (600) falls back to 400 and the emphasis vanishes.
- **Evidence:**
  ```tsx
  <strong className="text-[var(--ledger-ink)] font-semibold">Describe the situation, not the person.</strong>
  ```
- **Fix:** Verify Newsreader 600 ships in the font loader; if not, switch to `font-bold` (700) which is guaranteed in the Geist + Newsreader bundles per the design system spec. No code change if 600 is loaded.

### F19 — `ToolboxAccumulation` rendered twice on the Save step (Save panel + step content)

- **Severity:** LOW
- **Rule:** Design principle 1 — "Content is the design — restraint over decoration."
- **File:** `src/components/addie/lesson/v2/M02Experience.tsx:189` and `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:410`
- **What's wrong:** When the v2 shell branch in `[lessonId]/page.tsx:363` is active, the outer page no longer renders `ToolboxAccumulation` (good — it's branched out). But the Save step inside `M02Experience` mounts a `ToolboxAccumulation` panel directly under the saved card. On every other lesson the accumulation panel sits at the bottom of the lesson — here it sits inside the Save step AND the artifact itself shows a Toolbox kicker ("Toolbox · Data Discipline Card"). The redundancy reads as "saved twice." Not a blocker; flagged for trim.
- **Evidence:**
  ```tsx
  const save: Step = {
    …
    node: (
      <div className="space-y-6">
        <DataDisciplineCardArtifact … />
        <ToolboxAccumulation variant="inline" />
      </div>
    ),
  ```
- **Fix:** Move `<ToolboxAccumulation />` to the Recap step (above "Your Monday move") so the Save step is one focused object — just the card. The Recap is where the learner sees their progress accumulate.

---

## Severity counts

| Severity | Count | F-IDs |
|---|---|---|
| BLOCKER | 2 | F0, F9 |
| HIGH | 5 | F1, F2, F3, F10, F11, F12 (six lines; F12 counts once) — corrected: F1, F2, F3, F10, F11, F12 = 6 |
| MEDIUM | 5 | F4, F5, F13, F14, F15 |
| LOW | 5 | F6, F7, F8, F16, F17, F18, F19 — corrected count: 7 |

**Final tally:** BLOCKER 2 · HIGH 6 · MEDIUM 5 · LOW 7 (total 20 findings)

## Verdict

**Fix-then-ship, with F0 as a hard gate** — the module index (m0) is one radius sweep and a shadow strip from being on-brand, but both lesson routes render the (addie) not-found shell at runtime; m0.1 and m0.2 cannot be visually shipped until `loadPayload` is instrumented and the silent failure is rooted out.
