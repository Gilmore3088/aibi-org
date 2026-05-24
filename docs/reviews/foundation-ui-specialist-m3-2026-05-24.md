# Foundation UI Specialist — `/foundation/m3` + `/foundation/m3/m3.5` (2026-05-24)

**Routes:**
- `/foundation/m3` · **HTTP:** 200 · **Source:** `src/app/(addie)/foundation/[moduleId]/page.tsx`
- `/foundation/m3/m3.5` · **HTTP:** 200 · **Source:** `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx` (+ `LessonPlayer.tsx`, `LessonBody.tsx`, `SandboxLessonView.tsx`, `NextLessonCTA.tsx`, `LessonStickyNav.tsx`, `LessonSummaryCard.tsx`, `LessonTutor.tsx`, `ToolboxAccumulation.tsx`)

m3 is the module landing for "Talking to the machine: prompting"; m3.5 is the last free lesson (`sandbox` modality, branched ×5, takeaway `starter_prompt_pack`, gate trigger). Both render server-side; m3.5 loads to the LessonPlayer (no paywall because m3 is free tier).

## Findings

### F1 — Hero card stacks two raw rgba shadow literals, violating one-shadow rule
- **Severity:** HIGH
- **Rule:** 2 (Ledger tokens only — no raw hex/rgba outside the four exempt contexts), 6 (one shadow only — `--ledger-shadow`)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:234`
- **What's wrong:** The hero photo card carries a hand-rolled double-stack `shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]`. The brand rules permit exactly one shadow token (`--ledger-shadow`) on hero/feature cards — not a custom drop+ambient stack with literal rgba ink. Also re-appears verbatim on `PaywallPreview.tsx:87`, which is reached when m4/m5 lock; the m3 hero is the gateway lesson for that surface so the inconsistency is in-scope.
- **Evidence:**
  ```tsx
  <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-5 shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]">
  ```
- **Fix:** Replace with `shadow-[var(--ledger-shadow)]`. If a single token isn't dramatic enough, define a new `--ledger-shadow-hero` in `tokens-ledger.css` and reference that — never inline rgba.

### F2 — Primary "Begin Module" CTA carries a shadow (buttons must not)
- **Severity:** HIGH
- **Rule:** 6 (one shadow only, hero/feature cards only — never buttons)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:218`
- **What's wrong:** The hero CTA is a button (`<Link>` styled as a pill button), and it carries `shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]` — both a raw rgba literal AND a shadow on a non-card element. Buttons in the Ledger system get a hover border-darken, not a drop shadow.
- **Evidence:**
  ```tsx
  className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms] shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]"
  ```
- **Fix:** Delete the entire `shadow-[…rgba…]` utility. The `hover:bg-[var(--ledger-ink-2)]` already carries the affordance.

### F3 — Hero tape-stack uses `rounded-[12px]` — radius literal outside the 2/3/4 set
- **Severity:** MEDIUM
- **Rule:** 5 (radii — 2px buttons/inputs/chips · 3px cards · 4px hero cards)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:232–234`
- **What's wrong:** Three sibling divs (decorative tape, accent tint, hero photo card) all use `rounded-[12px]`. Hero card max is 4px; tape/tint are decorative parchment so 3px or 4px max.
- **Evidence:**
  ```tsx
  <div className="absolute -top-4 -left-4 right-8 bottom-8 rounded-[12px] bg-[var(--ledger-tape)] -z-10" aria-hidden />
  <div className="absolute top-4 left-4 right-0 bottom-0 rounded-[12px] bg-[color-mix(...)] -z-10" aria-hidden />
  <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-5 shadow-[…]">
  ```
- **Fix:** All three → `rounded-[4px]` (hero card grade). Keeps the layered look but stays within the radius scale.

### F4 — Takeaway and lesson cards use `rounded-[6px]` (should be 3px)
- **Severity:** MEDIUM
- **Rule:** 5 (cards = 3px; nothing else)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:287, 320`
- **What's wrong:** The "What you'll build" Takeaway card and every lesson row in the lessons list are `rounded-[6px]`. The Ledger card radius is `3px`. Six pixels is the easy default but the system is intentionally tight.
- **Evidence:**
  ```tsx
  // line 287 — Takeaway card
  <div className="mt-4 rounded-[6px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] p-5 sm:p-6">
  // line 320 — lesson row card
  <Link … className="group block rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] transition-all duration-[160ms] p-4 sm:p-5">
  ```
- **Fix:** Both → `rounded-[3px]`.

### F5 — Lesson row cards take a shadow on hover (cards aren't hero/feature)
- **Severity:** MEDIUM
- **Rule:** 6 (shadow only on hero/feature cards)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:320` and `src/components/addie/lesson/NextLessonCTA.tsx:53`
- **What's wrong:** Both the m3 lesson list rows and the in-lesson Next-Lesson CTA card use `hover:shadow-[var(--ledger-shadow)]`. The Design System rule is hover = border darken; shadows belong only on hero/feature cards.
- **Evidence:**
  ```tsx
  // [moduleId]/page.tsx:320
  className="group block rounded-[6px] … hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] transition-all …"
  // NextLessonCTA.tsx:53
  className="group mt-10 block rounded-[6px] … hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] transition-all …"
  ```
- **Fix:** Drop `hover:shadow-[var(--ledger-shadow)]` from both. The `hover:border-[var(--ledger-ink)]` already carries the affordance.

### F6 — `italic-off` (non-Tailwind utility) lingers in LessonBody quote block
- **Severity:** MEDIUM
- **Rule:** 3 (italics retired site-wide — flag every `italic`, `not-italic`, `italic-off`)
- **File:** `src/components/addie/lesson/LessonBody.tsx:487`
- **What's wrong:** Quote callouts (`> …` markdown blocks, which m3.5 uses heavily for SCRIPT / case:good / case:bad / tip / warn beats) render with `italic-off` — a custom class no longer needed because `base.css` has `*{font-style:normal!important}`. It's dead code that signals italics are still a concern; remove per the brief's italics-retired rule.
- **Evidence:**
  ```tsx
  <blockquote
    key={key}
    className="my-6 border-l-2 border-[var(--ledger-accent)] pl-4 text-[var(--ledger-ink-2)] italic-off"
  >
  ```
- **Fix:** Delete ` italic-off`. The global rule already enforces upright type.

### F7 — `LessonTutor` uses `<em className="not-italic">` to defeat italics
- **Severity:** MEDIUM
- **Rule:** 3 (italics retired — flag `<em>`, `not-italic`)
- **File:** `src/components/addie/lesson/LessonTutor.tsx:312`
- **What's wrong:** Mounted on every lesson page including m3.5. Uses `<em>` (semantic emphasis) and immediately defeats it with `not-italic`. Italics are retired; emphasis should be carried by color + weight, not the `<em>` tag at all in this context.
- **Evidence:**
  ```tsx
  Examples · <em className="not-italic">&ldquo;Why do you keep saying it&apos;s pattern-completion?&rdquo;</em> · <em className="not-italic">&ldquo;Give me a one-line script for an examiner who asks about this.&rdquo;</em>
  ```
- **Fix:** Replace `<em className="not-italic">"…"</em>` with `<span className="text-[var(--ledger-ink)] font-medium">"…"</span>`, or simply keep the curly quotes without any wrapping tag.

### F8 — Callouts (used throughout m3.5) use `rounded-[5px]` — outside the radius scale
- **Severity:** MEDIUM
- **Rule:** 5 (radii — 2/3/4 only)
- **File:** `src/components/addie/lesson/LessonBody.tsx:521`
- **What's wrong:** The m3.5 lesson body is mostly markdown callouts (`[case:good]`, `[case:bad]`, `[warn]`, `[tip]`, `[stat]`), and they all render at `rounded-[5px]`. Five pixels is not in the system.
- **Evidence:**
  ```tsx
  className={`my-6 rounded-[5px] border-l-[3px] ${m.border} ${m.bg} px-5 py-4`}
  ```
- **Fix:** `rounded-[3px]`. Same change for the role-card grid at line 585 (also `rounded-[5px]`) and the Toolbox accumulation card at `ToolboxAccumulation.tsx:104`.

### F9 — Knowledge-check option text contains the banned word "unlock"
- **Severity:** MEDIUM
- **Rule:** 8 (banned words — `unlock`)
- **File:** `supabase/seed/m3_addie.sql:700`
- **What's wrong:** m3.5's second knowledge check option (id `"d"`) reads "To unlock the paid tier" with an explanation that says "The paid tier is unlocked through the gate." This is learner-facing copy on the last free lesson of the course — the exact moment the brand-voice rule matters most. "Unlock" is on the banned list ("revolutionize / unlock / supercharge / leverage / synergy / AI-powered / users").
- **Evidence:**
  ```sql
  {"id":"d","label":"To unlock the paid tier","correct":false,"explanation":"The paid tier is unlocked through the gate, not through any sandbox lever."}
  ```
- **Fix:** Reword to "To open the paid tier" / "The paid tier opens at the gate, not from a sandbox lever." (or "To enroll in the paid tier" / "The paid tier is reached through the gate, not a sandbox lever.")

### F10 — `LessonStickyNav` shadow uses two raw rgba literals
- **Severity:** MEDIUM
- **Rule:** 2 (no raw rgba outside exempt contexts), 6 (one shadow token only)
- **File:** `src/components/addie/lesson/LessonStickyNav.tsx:56`
- **What's wrong:** The sticky lesson nav floats on every lesson (m3.5 included). It uses a custom dual-shadow literal instead of `--ledger-shadow`.
- **Evidence:**
  ```tsx
  className="rounded-full border border-[var(--ledger-rule-strong)] bg-[…] backdrop-blur-md shadow-[0_12px_30px_-12px_rgba(14,27,45,0.45),0_4px_8px_-3px_rgba(14,27,45,0.18)] flex items-center justify-between gap-2 px-2 py-2"
  ```
- **Fix:** `shadow-[var(--ledger-shadow)]`. Also separately worth flagging: `rounded-full` on a horizontal nav bar departs from the 2/3/4 radius scale — but a fully-circular pill is a known editorial pattern; lower priority. Replace with `rounded-[4px]` for full Ledger compliance.

### F11 — Hero CTA hover swaps border-on/border-off, causing 1px layout shift
- **Severity:** LOW
- **Rule:** 7 (motion — hover = border darken, not layout reshuffle)
- **File:** `src/app/(addie)/foundation/[moduleId]/page.tsx:361`
- **What's wrong:** The bottom "Begin lesson 1 · …" CTA has `hover:border hover:border-[var(--ledger-ink)]` with no baseline border, so hover causes a 1px expansion that nudges the chevron.
- **Evidence:**
  ```tsx
  className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-sm px-7 py-4 rounded-[4px] bg-[var(--ledger-accent)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] hover:border hover:border-[var(--ledger-ink)] transition-colors duration-[160ms]"
  ```
- **Fix:** Give the button a baseline `border border-transparent` so hover changes color only: `border border-transparent hover:border-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)]`.

### F12 — "highest-leverage" appears in m3 IT-track variant and seed copy
- **Severity:** LOW
- **Rule:** 8 (banned words — `leverage`)
- **File:** `supabase/seed/m3_addie.sql:523, 587`
- **What's wrong:** Two learner-facing strings ("the highest-leverage prompts are…" and KC explanation "the highest-leverage move in this whole course"). Adjectival use, not the marketing verb, but the brand rules ban the word as a word — and the seed otherwise sets a careful tone.
- **Evidence:**
  ```sql
  In IT the highest-leverage prompts are the ones that turn a half-formed …
  …the highest-leverage move in this whole course.
  ```
- **Fix:** Reword to "the prompts that pay back the most" / "the highest-payoff move" / "the move that buys you the most."

## Verdict
**Fix-then-ship.** Two HIGH findings (raw rgba shadow stacks, button-on-CTA shadow) plus a cluster of radius-scale violations (5px / 6px / 12px across the module hero, lesson rows, callouts, and Next CTA), the lingering italic utilities, and the banned-word "unlock" in the m3.5 knowledge check. None block the route from rendering; all are inside the Ledger contract this branch is supposed to enforce. Fix in one pass before the next per-page review of m4.
