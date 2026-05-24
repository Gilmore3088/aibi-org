# Foundation UI Specialist — /foundation/m4 + /foundation/m4/m4.1 (2026-05-24)

**Routes:**
- `/foundation/m4` (module landing) · **HTTP:** 200 · **renders:** module index (91k bytes, 7 headings)
- `/foundation/m4/m4.1` (locked lesson) · **HTTP:** 200 · **renders:** Next.js `not-found.tsx` (51k bytes, 0 headings)

**Source:**
- `src/components/addie/lesson/PaywallPreview.tsx`
- `src/app/(addie)/foundation/[moduleId]/page.tsx`
- `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx`

**Scope of this dispatch:** verify whether the H1→H2 kicker promotion in commit
`7f6d1cb` (F3 from the prior audit) actually shipped on the locked paid surface,
and re-grade the module landing + locked-lesson combination as an anonymous
viewer. Findings tagged with [SOURCE] are graded against the component code
because the rendered surface couldn't be reached in this environment (see F1).

---

## Findings

### F1 — Locked lesson route returns Next.js 404, not the PaywallPreview

- **Severity:** BLOCKER
- **Rule:** N/A (functional)
- **File:** `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:331-332`
- **What's wrong:** `curl -s http://localhost:3000/foundation/m4/m4.1` returns
  HTTP 200 but the body is the global not-found page (zero `<h1-6>` elements,
  51,437 bytes — byte-identical to `/foundation/m4/m4.2`, `/foundation/m4/m4.3`,
  `/foundation/m3/m3.1`, `/foundation/m0/m0.1`). The PaywallPreview never
  renders in this dev environment because `loadPayload()` returns `null` for
  every lesson id, which fires `notFound()` before the paid-tier branch on
  line 335 can mount the PaywallPreview. The module landing at `/foundation/m4`
  works (91,066 bytes, 7 headings) and *links* to `/foundation/m4/m4.1`, so the
  lesson row exists in the database — the failure is in the second query
  (lesson detail / variants / checks / siblings / exercise). The F3 kicker
  promotion ("promoted to real `<h2>`") that this dispatch was sent to verify
  is therefore **not observable on the rendered surface at all** — only by
  reading the component source.
- **Evidence:**
  ```tsx
  const payload = await loadPayload(params.moduleId, params.lessonId);
  if (!payload) notFound();
  ```
  ```bash
  $ curl -s http://localhost:3000/foundation/m4/m4.1 | wc -c     # 51437
  $ curl -s http://localhost:3000/foundation/m4/m4.2 | wc -c     # 51437
  $ curl -s http://localhost:3000/foundation/m3/m3.1 | wc -c     # 51437
  $ curl -s http://localhost:3000/foundation/m4   | wc -c        # 91066
  ```
  not-found body contains `notFound`, `not-found`, and nothing from
  `PaywallPreview` (no "Three doors", "See your options", "What's inside",
  "Pick how you want to keep going", "Pay $295", "Saved to your Toolbox").
- **Fix:** Diagnose why `loadPayload()` swallows-and-returns-null on this dev
  DB. The `try/catch` at line 282 logs to `console.warn` — pull the dev server
  log and look for `[lesson page] load failed:`. Most likely culprit is one of
  the four sub-queries (`lessons`, `modules`, `lesson_track_variants`,
  `knowledge_checks`, `lessons` siblings, `exercises`) erroring on a column
  that doesn't exist yet on this branch's schema (the parent query has fallback
  handling for `hero_image_*`; the lesson query does not). Until this is
  resolved the paid-tier paywall surface cannot be QA'd end-to-end and the
  F10 fix-log claim ("deferred — structural") is the only path open.

### F2 — Hero card carries a literal multi-shadow `rgba()` value

- **Severity:** HIGH
- **Rule:** 6 (one shadow only — `--ledger-shadow` — on hero/feature cards)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:87`,
  `src/app/(addie)/foundation/[moduleId]/page.tsx:234`
- **What's wrong:** Both the locked-module hero illustration card
  (`PaywallPreview`) and the unlocked module-landing hero illustration card
  carry a hand-rolled, two-layer drop shadow with literal rgba values rather
  than `--ledger-shadow`. The brief explicitly says: *"Flag every
  `shadow-[…rgba…]` literal"*. Hero cards are the one place shadow is
  permitted, but the value must be the token.
- **Evidence:**
  ```tsx
  // PaywallPreview.tsx:87
  <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)]
       bg-[var(--ledger-paper)] p-5
       shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]">
  ```
  ```tsx
  // foundation/[moduleId]/page.tsx:234
  <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)]
       bg-[var(--ledger-paper)] p-5
       shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]">
  ```
- **Fix:** Replace both literals with `shadow-[var(--ledger-shadow)]`. If the
  designed depth requires a heavier shadow, that is a token-system change —
  update `--ledger-shadow` itself in `tokens-ledger.css`, don't fork it inline.

### F3 — Begin Module button has a shadow (button-shadow forbidden)

- **Severity:** HIGH
- **Rule:** 6 (one shadow only — `--ledger-shadow` on hero/feature cards only;
  buttons/chips get no shadow)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:218`
- **What's wrong:** The primary "Begin Module N" CTA has its own literal
  rgba drop shadow. Buttons are explicitly excluded from the one-shadow rule.
- **Evidence:**
  ```tsx
  className="… bg-[var(--ledger-ink)] text-[var(--ledger-paper)]
             hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]
             shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]"
  ```
- **Fix:** Delete the `shadow-[…]` utility. Authority on this button comes
  from the ink fill, mono-caps label, and 4px radius — not a glow.

### F4 — Bottom "Begin lesson 1" CTA uses gold-on-ink — fails WCAG AA

- **Severity:** HIGH
- **Rule:** 4 (WCAG 2.1 AA, 4.5:1 text contrast)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:361`
- **What's wrong:** The bottom-of-page primary CTA stacks `--ledger-ink`
  (`#0E1B2D`) text on `--ledger-accent` (`#7C5814`). The gold was darkened
  to `#7C5814` on 2026-05-21 specifically to pass AA *as text on Paper/BG*;
  it was not retuned to carry dark text on top of itself. Approximate
  relative luminances are 0.013 (ink) and 0.092 (gold); contrast ratio is
  ~2.25:1, well under the 4.5:1 AA floor. This is the most visible CTA on
  the module landing (centered, oversized, after the lessons list).
- **Evidence:**
  ```tsx
  <Link href={beginHref}
    className="group inline-flex items-center gap-3 font-mono font-semibold
               uppercase tracking-[0.14em] text-sm px-7 py-4 rounded-[4px]
               bg-[var(--ledger-accent)] text-[var(--ledger-ink)]
               hover:bg-[var(--ledger-paper)] hover:border hover:border-[var(--ledger-ink)]
               transition-colors duration-[160ms]"
  >
    Begin lesson 1 · {firstLesson.title}
  ```
- **Fix:** Match the top hero CTA's pattern (ink fill, paper text): swap
  `bg-[var(--ledger-accent)] text-[var(--ledger-ink)]` →
  `bg-[var(--ledger-ink)] text-[var(--ledger-paper)]` and use
  `hover:bg-[var(--ledger-ink-2)]`. If gold-prominence is the design intent,
  use `--ledger-accent` only as a border or as the background under
  `text-[var(--ledger-paper)]` (paper-on-gold ≈ 8.4:1, passes AA).

### F5 — Decorative offset cards and hero card use radii outside 2/3/4px

- **Severity:** MEDIUM
- **Rule:** 5 (radii must be 2px buttons/inputs/chips, 3px cards, 4px hero
  cards — flag any other literal)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:87,92`;
  `src/app/(addie)/foundation/[moduleId]/page.tsx:232,233,234`
- **What's wrong:** `rounded-[12px]` on three stacked illustration wrappers
  (the paper-tape offset, the gold-tint offset, and the actual hero card),
  plus a `rounded-[6px]` paywall scrim. 12px is 3× the maximum allowed
  hero-card radius; 6px sits between the chip and card values with no
  defined meaning.
- **Evidence:**
  ```tsx
  // foundation/[moduleId]/page.tsx:232-234
  <div className="absolute -top-4 -left-4 right-8 bottom-8 rounded-[12px] bg-[var(--ledger-tape)] -z-10" aria-hidden />
  <div className="absolute top-4 left-4 right-0 bottom-0 rounded-[12px] bg-[…accent…])] -z-10" aria-hidden />
  <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)] …">
  ```
  ```tsx
  // PaywallPreview.tsx:92
  <div aria-hidden className="absolute inset-0 bg-[var(--ledger-paper)] opacity-60 rounded-[6px]" />
  ```
- **Fix:** All three hero wrappers → `rounded-[4px]`. The scrim → `rounded-[4px]`
  to match. The system tolerates exactly four radius literals; pick from them.

### F6 — Tape/Takeaway containers use a 6px radius

- **Severity:** MEDIUM
- **Rule:** 5 (2/3/4px only)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:145`;
  `src/app/(addie)/foundation/[moduleId]/page.tsx:287`
- **What's wrong:** The "What you'd build" / "What you'll build" takeaway
  cards on both the locked-paywall and the live module landing use
  `rounded-[6px]`. Same rule.
- **Evidence:**
  ```tsx
  // PaywallPreview.tsx:145
  <div className="mt-4 rounded-[6px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] p-5">
  ```
  ```tsx
  // foundation/[moduleId]/page.tsx:287
  <div className="mt-4 rounded-[6px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] p-5 sm:p-6">
  ```
- **Fix:** Both → `rounded-[3px]` (these are cards, not hero).

### F7 — Lesson cards on module landing use 6px radius

- **Severity:** MEDIUM
- **Rule:** 5 (2/3/4px only)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:320`
- **What's wrong:** Every lesson card in the module landing's "Lessons" list
  is `rounded-[6px]`. Four lessons in M4 = four violations on one screen.
- **Evidence:**
  ```tsx
  className="group block rounded-[6px] border border-[var(--ledger-rule)]
             bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)]
             hover:shadow-[var(--ledger-shadow)] transition-all duration-[160ms] p-4 sm:p-5"
  ```
- **Fix:** `rounded-[6px]` → `rounded-[3px]`. (Hover-shadow uses the token —
  good. Hover-shadow on a non-hero card is itself a Rule 6 concern, see F8.)

### F8 — Lesson cards grow a shadow on hover (non-hero card with shadow)

- **Severity:** LOW
- **Rule:** 6 (one shadow only — hero/feature cards)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:320`
- **What's wrong:** Lesson cards are not hero/feature cards (they're a list
  of four equal-weight rows), but pick up `--ledger-shadow` on hover. The
  rule allows the token but not on this surface; the hover behavior should
  be "border darken" per Rule 7.
- **Evidence:**
  ```tsx
  className="… hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] …"
  ```
- **Fix:** Drop `hover:shadow-[var(--ledger-shadow)]`. The
  `hover:border-[var(--ledger-ink)]` already carries the affordance and
  matches Rule 7 exactly.

### F9 — Chevron translate-X on hover (motion beyond border-darken)

- **Severity:** LOW
- **Rule:** 7 (Hover = border darken; almost no motion)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:74,241`;
  `src/app/(addie)/foundation/[moduleId]/page.tsx:221,347,364`
- **What's wrong:** Five separate `group-hover:translate-x-*` chevrons on
  CTAs and lesson cards. Rule 7 calls out scale and translate-Y by name; X
  translate sits in the gray zone but the spirit is "almost none" — and
  on the lesson list it's *also* paired with shadow growth (F8), so on
  hover a row gains a shadow AND its arrow shifts AND its border darkens.
  That's three simultaneous motions on what should be a calm read.
- **Evidence:**
  ```tsx
  // foundation/[moduleId]/page.tsx:347
  <span aria-hidden className="… group-hover:text-[var(--ledger-ink)]
        group-hover:translate-x-1 transition-all duration-[160ms]">→</span>
  ```
- **Fix:** Remove the `group-hover:translate-x-*` utilities. Let the
  border-darken alone carry the affordance; the chevron already has the
  ink color shift.

### F10 — H1→H2 kicker promotion verified [SOURCE]

- **Severity:** N/A (verification)
- **Rule:** 4 (heading order)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:116,142,167`
- **What's wrong:** Nothing — this is the F3 fix from `7f6d1cb`, confirmed
  present. Three `<h2>` elements: "What's inside" (116), "What you'd build"
  (142), "Pick how you want to keep going." (167). With the module-title
  `<h1>` at line 60 and door titles at `<h3>` (line 229) the order is
  H1 → H2 → H3 with no skips. **Caveat:** the dev surface returns 404
  (F1), so this is verified against source only — not against rendered DOM.
- **Evidence:**
  ```tsx
  <h2 className="font-mono uppercase tracking-[0.18em] text-[0.7rem]
                 text-[var(--ledger-accent)]">What&apos;s inside</h2>
  ```
- **Fix:** None needed. Re-verify in browser once F1 is resolved.

### F11 — H2 kickers are visually mono-micro-caps, not heading-sized [SOURCE]

- **Severity:** LOW
- **Rule:** 4 (a11y — heading semantics should roughly match visual weight)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:116-118,142-144`
- **What's wrong:** Promoting the kickers to `<h2>` resolved the
  heading-skip in the a11y tree, but the kickers visually read at
  `text-[0.7rem]` mono — smaller than body. Screen-reader users navigating
  by heading land on a heading that says "What's inside" or "What you'd
  build" with no visual heading weight at all. Not a bug; just a polish
  observation: the genuine section headline is `<p>` "Foundation
  Course"/"Readiness Assessment" / etc. on the doors, or the takeaway
  itself.
- **Evidence:**
  ```tsx
  <h2 className="font-mono uppercase tracking-[0.18em] text-[0.7rem]
                 text-[var(--ledger-accent)]">What&apos;s inside</h2>
  ```
- **Fix (optional):** Consider promoting the *serif* line below the kicker
  to the H2 and demoting the kicker back to a `<span>` with
  `aria-hidden="true"`. Lower priority than F1–F4.

### F12 — Lock-overlay scrim opacity may not reach AA against the illustration

- **Severity:** LOW
- **Rule:** 4 (WCAG 2.1 AA — non-text icon contrast)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:90-104`
- **What's wrong:** The lock icon (ink circle, paper stroke) sits on top
  of a scrim that's `bg-[var(--ledger-paper)] opacity-60` over the
  ModuleIllustration. Effective scrim color depends on the illustration
  beneath; if the illustration is dark, the ink lock circle on a 60%
  paper scrim will sit on a near-paper background (good ~14:1) but if
  the illustration is bright, the visible contrast could drop below 3:1
  for the non-text lock graphic. Hard to grade without seeing live
  illustrations.
- **Evidence:**
  ```tsx
  <div aria-hidden className="absolute inset-0 bg-[var(--ledger-paper)] opacity-60 rounded-[6px]" />
  <span className="… bg-[var(--ledger-ink)] text-[var(--ledger-paper)]">
    <svg …><rect …/><path …/></svg>
  </span>
  ```
- **Fix:** Either bump scrim to `opacity-80`, or add a thin
  `border-[var(--ledger-rule-strong)]` to the lock circle so it doesn't
  rely on the scrim alone. Verify once F1 unblocks rendering.

---

## Verdict

**fix-then-ship — but F1 is a blocker for this surface.**

Headline finding: the paid-tier paywall preview is *not reachable* on
`/foundation/m4/m4.1` in this dev environment — `loadPayload()` swallows an
error and the route degrades to the global 404 page before
`PaywallPreview` ever mounts. Until F1 is resolved, the entire F10-class
"per-locked-lesson PaywallPreview" surface remains a code-only review:
the H1→H2 kicker fix is confirmed in source but cannot be confirmed in
rendered DOM.

The /foundation/m4 module-landing surface that *does* render carries four
distinct violations (F2 hero rgba shadow, F3 button shadow, F4 gold-on-ink
AA failure on the most visible CTA, F5–F7 radius literals at 6px and 12px).
The AA failure (F4) and the two button/hero shadow literals (F2, F3) are
HIGH; the radius violations are MEDIUM but cluster on every paid-module
landing.

| Severity | Count |
| --- | --- |
| BLOCKER | 1 |
| HIGH | 3 |
| MEDIUM | 3 |
| LOW | 4 |
| N/A | 1 |
| **Total** | **12** |
