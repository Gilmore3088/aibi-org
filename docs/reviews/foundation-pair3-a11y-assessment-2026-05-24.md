# Foundation Course — Pair 3 Critique
## Accessibility × Assessment design
**Pair:** Tomás Núñez (CPACC/WAS, Sr FE Architect) · Dr. Lena Park (PhD Educational Measurement)
**Reviewed:** all 24 lessons + gate · 2026-05-24
**Anchored on:** post-Round-1 + P1.3/P1.4 fixes (`foundation-fix-log-2026-05-24.md`)
**Method:** static review of `src/components/addie/lesson/*` and `src/components/addie/interactives/*`; live dev server at `localhost:3000`; full pull of `addie.lessons`, `addie.knowledge_checks`, and `addie.exercises` via Supabase MCP.

---

## Headline (3 bullets — joint)

- **A11y is in respectable shape for a v1 — but two things break the floor.** The lesson body's custom markdown renderer (`LessonBody.tsx`) supports headings, lists, blockquotes, callouts, case grids, and stat cards — but it has **no table block kind at all**. The M5.4 "blast-radius matrix," the single most important new content artifact in this fix-log, is authored as a GFM pipe table inside a `[case:good]` block. It renders as literal text with `|` characters, not as a `<table>`. That's a content-fidelity problem **and** kills every WCAG 1.3.1 / 1.3.2 question we'd otherwise ask of it. Second: the `SacredRule` modal traps Tab to a single button and intercepts `Escape` as a continue command — both are real WCAG 2.1.2 / 2.4.3 violations. Everything else is fixable inside the polish pass.
- **The assessment item bank is more honest than most LMS courses but is leaning on three structural shortcuts.** Three of 55 stems are meta-questions about the course UI rather than the lesson construct (m0.1/Q1, m0.1/Q3, m1.3/Q2, m2.3/Q3, m3.5/Q1, m4.3/Q1 — six total, ~11%). Coverage at the Apply/Analyze cognitive level remains low after P1.5 (we count five Apply items, no Analyze; the rest are Remember/Understand). And eight items use a "joke-distractor" pattern — "Pay $99 first," "It refuses to discuss financial information," "Customer consent in writing" — that a motivated learner answers by elimination, inflating discrimination estimates artificially.
- **The widget exercises (OffLimitsSorter, SpotTheViolation, SkillBuilder, PRDBuilder, PrototypeLauncher) carry most of the formative load and most of the genuine learning evidence.** They're the strongest part of the course pedagogically. They're also where the keyboard model is least consistent — three different roving-tabindex implementations, no live region on the sorter's score change, and a "select then commit" pattern in PrototypeLauncher that isn't announced.

---

## A11y audit — module by module

### M0 — Orientation (m0.1, m0.2) — T.N.

m0.1 is a video lesson with three KCs and no custom widget. The `LessonStepShell` (v2) is not used here — m0.1 still renders via the standard reading shell. Heading order is clean (`h1` lesson title → `h2` section heads from markdown). No findings.

m0.2 is the heaviest a11y surface in the course: video + `SacredRule` immersive modal + `OffLimitsSorter` widget + `AnonymizationFlow`. Findings:

- **SacredRule modal — WCAG 2.1.2 No keyboard trap, 2.4.3 Focus order.** Tab is hard-intercepted and re-routed to the single button: `if (e.key === 'Tab') { e.preventDefault(); buttonRef.current?.focus(); }`. With one focusable element the practical user-impact is nil — but Tab being preventDefault'd is exactly the pattern 2.1.2 forbids. Use `inert` on background, a real focus-trap (e.g. radix-ui's `FocusScope` or a tiny in-house trap that allows native Tab to cycle within the dialog), and stop preventing default on Tab.
- **SacredRule — Escape behaviour is wrong for a dialog.** `Escape` is bound to `handleContinue()`. Per the ARIA Authoring Practices `dialog` pattern, Escape should close/cancel, not advance. A learner who hits Escape expecting "let me out of this" instead implicitly accepts a sacred rule. That's an integrity problem on top of an a11y problem. Bind Escape to a `onDismiss` (route back to the previous step, or no-op) and keep Enter/Space for the affirmative button.
- **SacredRule — no `aria-describedby`.** `role="dialog"` carries `aria-label="Foundation rule"` but does not point to the rule sentence itself. Add `aria-describedby` referencing the `<p>` that holds the rule. Screen readers should announce kicker → rule → action, not just "Foundation rule, button: Acknowledge and continue."
- **SacredRule — focus restoration after 250ms reveal.** `setTimeout(..., 250)` then `buttonRef.current?.focus()` is fine on a fast machine but if React renders are deferred the focus shot can land on a hidden element. Better: render the button always but visually hide with `opacity-0`, focus it immediately, then animate the opacity.
- **OffLimitsSorter — radiogroup roving-tabindex is correct.** Arrow keys cycle, Enter/Space submits, `aria-checked` reflects the chosen item, focus ring is visible (`focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2`). This is the cleanest widget in the course. One nit: the score-counter `{score.correct}/{score.total}` is plain text with no `aria-live`. A screen-reader user will not hear the score update after each item; add `aria-live="polite"` to the score span.
- **OffLimitsSorter — `aria-checked={chosen ?? false}` issue.** `chosen` is a boolean from `feedback?.chosen === cat.id`; the `??` is dead. More importantly, between feedback-shown and next-item, `aria-checked` flips back to false on advance even though nothing was unchecked — minor. Reset state on the new item rather than letting React clear it.
- **AnonymizationFlow** — read but not audited in detail; it's a presentational guide, not a graded interaction.

### M1 — Awareness (m1.1–m1.4) — T.N.

All four lessons are video/reading/audio modalities with standard KCs. Heading order clean across all four. Tutor chip overlaps the page at `top-24 right-4` with `z-30` — at the M1.3 audio lesson the chip can occlude the audio player's volume slider at mobile widths (`< sm`). Move the chip below the audio control on mobile (`bottom-20 right-4`) or stack vertically with the sticky bottom-nav. **1.4.10 Reflow** is borderline: at 320px the chip + sticky-nav + audio player compete for the bottom-right corner.

### M2 — Access & workflow (m2.1–m2.4)

m2.3 is a sandbox lesson. `SandboxLessonView` (not re-read here in detail) renders the same shell as M3.2; see M3.2 findings — they generalise. m2.4 worksheet is a save-as-toolbox-item flow without a custom widget; minimal a11y surface.

### M3 — Prompting (m3.1–m3.5)

**M3.2 A/B sandbox — `SandboxABLessonView` (T.N.):**

- **2.1.1 Keyboard — output panels as buttons.** `OutputColumn` is `<LedgerCard role="button" tabIndex={0} onKeyDown=(Enter/Space)/onClick onFocus>` — that's the correct pattern for a card-acting-as-button. `aria-pressed={focused}` correctly conveys the two-state selection. `aria-label="Version A output selected"` is good. ✓
- **1.3.1 Info & relationships — diff `<mark>` semantics.** The unique-word highlights use real `<mark>` tags, which screen readers announce when the verbosity setting includes mark. Good — but no `aria-label` on the wrapping output region explaining the highlighting convention. The on-screen explanation reads "Highlighted words show what each version produced uniquely" — that text is a visual caption but is not associated with the output regions. Add `aria-describedby` from each `OutputColumn` to a single hidden caption div.
- **3.3.1 Error identification.** The friendly-error `role="alert"` panel is correctly placed and announces. ✓
- **2.4.7 Focus visible — `LedgerCard role="button"`.** Need to confirm the focus ring on the card itself (not the inner KickerLabel). Couldn't fully confirm from the snippet; tag for visual QA.
- **Cognitive note (L.P., in agreement with P1.1):** the A/B view introduces six new things at once. The a11y surface mirrors the cognitive load — every region is reachable but a screen-reader user is exposed to the same six-things problem with even less spatial pre-attentive scaffolding. The remedy is content, not chrome: split or stage.

**M3.4 SpotTheViolation drill (T.N.):**

- **4.1.2 Name, role, value.** Two-option radiogroup, `role="radio"` + `aria-checked` + `disabled` after answer — correct. Reveal panel `aria-live="polite"` — correct.
- **1.4.3 Contrast.** Wrong-pick state uses `border-[var(--ledger-weak)]` on `bg-[var(--ledger-paper)]` — oxblood `#8E3B2A` on paper `#F4F1E7` measures roughly 5.3:1. Passes AA for borders-as-meaning *if* there's also a non-color signal. The KickerLabel reads "You missed a violation" — non-color signal is present. ✓
- **2.5.8 Target size.** Buttons are `p-4` (≈16px padding) on a `<button>` with text content — well over the 24×24 minimum. ✓
- **3.3.3 Error suggestion.** The "missed real violation" path reuses the wrong option's `explanation` as the teaching text. That works because the seed pairs an explanation with each wrong option. Verify in the seed that no wrong option carries a generic "Try again" line — that would fail 3.3.3.

### M4 — Skills (m4.1–m4.4)

**M4.2 / M4.3 SkillBuilder (T.N.):**

- **1.3.1 / 4.1.2.** A four-step form with `step` state (1→2→3→4). Each step renders its own controls; the relationship between step number, step name, and step contents is conveyed visually but not via `aria-current="step"` on a stepper list. There is no exposed stepper list — just a numeric state. Screen-reader users hear no progress. Add a `<nav aria-label="Skill builder progress"><ol role="list">…</ol></nav>` mirroring the `LessonStepShell` pattern.
- **3.3.2 Labels.** Slot labels and help text are `<label htmlFor>` + `<p id="…-help">` linked via `aria-describedby` — good in the parts I sampled. Need to confirm the lever-radio groups carry `aria-labelledby` to the lever's display label (the `LeverControls` component, not read in detail).
- **3.3.4 Error prevention.** Save is disabled on incomplete state but the `disabledReason` is a tooltip on the button, only surfaced on hover/focus. Move the reason into a `<p aria-live="polite">` adjacent to the button so screen-reader users hear why it's locked.

**M4.4 SkillTester (not deeply re-audited).** Per the design notes in `SkillBuilder.tsx`, it shares the input-slot pattern. Same finding applies.

### M5 — Build (m5.1–m5.5)

**M5.3 PRDBuilder (T.N.):**

- **1.3.1 / 3.3.2.** Each section has a `<label htmlFor={fieldId}>` and an optional `aria-describedby` to a help paragraph — clean. ✓
- **3.3.3 Error suggestion on save disable.** Same finding as M4.2 — `disabledReason` is a button title/tooltip, not live-region announced. Fix the same way.
- **1.4.3 Contrast on placeholder.** `placeholder:text-[var(--ledger-muted)]` puts `#4F5C6E` on `#F4F1E7`. Computed contrast ~7.0:1 — passes. ✓
- **PII warning — `PIIWarning visible={hasPII}`.** I would expect this component to be a polite live region. Verify it carries `role="status"` or `aria-live="polite"` — otherwise a learner pasting a name will see the visual warning but hear nothing.

**M5.4 PrototypeLauncher (T.N.) — and the new blast-radius matrix:**

- **CRITICAL: the blast-radius matrix does not render as a table.** The lesson body markdown in `addie.lessons` for `m5.4` carries a GFM pipe table (header row, separator row, four data rows) inside a `[case:good]` block. `LessonBody.tsx` has no `table` block kind (`Block` union: h2, h3, p, ul, ol, quote, hero_quote, scene_set, callout, stat, case_grid — see lines 94–105 and the parser at 122–209). The case-block parser will treat the table lines as paragraph body of the case. The rendered output is a wall of text with literal `|` characters and `---` separators visible to the user. This destroys the central instructional asset of F5 and means there is *no table* for WCAG 1.3.1 / 1.3.2 to apply to in the first place. **This is the single highest-priority a11y AND content fix from this audit.** Either add a `table` block kind to `LessonBody` (parse GFM-style pipe tables; render as `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`, semantic borders) or refactor the case block to a custom `[matrix]` callout with a typed schema. The former preserves authoring ergonomics; the latter is safer.
- **Card "I am using this" button — 4.1.2 / 3.2.2.** Uses `aria-pressed={isSelected}` on `<LedgerButton>` — correct. ✓
- **External-link cards.** `<a target="_blank" rel="noopener noreferrer">` — correct hygiene. No `aria-label` extension to clarify "(opens in new tab)" — recommended per 3.2.5 to set expectations. Add a screen-reader-only span.
- **2.4.4 Link purpose.** "Open Lovable" / "Open Replit Agents" — meaningful in isolation, ✓.

**M5.5 audio + closing.** Standard reading/audio chrome. No new findings.

---

## A11y deep dives (named components)

### v2 lesson shell — `LessonStepShell.tsx` (T.N.)

The strongest piece of architecture in the course's a11y story. Steps are a real `<ol>`, current step has accent color and accent-tinted progress bar, dots are real buttons with `aria-label="Jump to step N: STEP_NAME"`, focus is implicitly handled by scroll-to-top. Findings:

- **4.1.3 Status messages.** Step change is announced by re-rendering a new `<h2>` but not by a live region. A screen-reader user on JAWS who has just clicked Next hears the next button's label re-confirmed, then silence until they read the new heading. Add `aria-live="polite"` to the panel container, OR (cleaner) move focus to the new `<h2 tabindex="-1">` after step change. The latter is the standard SPA-route-change pattern and gives a better keyboard story too.
- **2.4.3 Focus order vs visual order.** Progress dots come BEFORE the step title strip in DOM order, which matches visual order. ✓ Bottom nav is in `<nav>` — ✓.
- **3.2.4 Consistent identification.** The keyboard shortcuts (J/K + arrows) are documented in the inline help on `LessonStickyNav` (`← / →` micro-key text) but **not** on `LessonStepShell`. A learner in M0.2 (which uses the shell) won't discover J/K. Add the same micro-key indicator.
- **2.1.4 Character key shortcuts.** J and K are single-character shortcuts. WCAG 2.1.4 requires they be either disable-able, remap-able, or only fire when a UI component has focus. The current implementation does check for INPUT/TEXTAREA/contentEditable focus — that satisfies the spirit. But a non-textarea button-focused state (e.g. a tab pressing J means "next step" instead of typing) is still global. Either scope the listener to a single section or add a settings toggle.
- **The "go to step" buttons.** A click on a progress dot navigates instantly. Fine, but should it? Progress-step navigation that jumps over a `nextDisabled` gate could trivially skip the m0.2 anonymisation step. Confirm the `nextDisabled` is enforced on direct-jump too (currently `goTo` is unguarded).

### LessonStickyNav (T.N.)

- **2.4.1 Bypass blocks.** Fixed-position floating nav is in a `role="navigation"` landmark with an `aria-label="Lesson navigation"` — exactly right. ✓
- **2.1.4.** Same single-key (J/K) finding as the shell.
- **2.5.8 Target size.** The pill has `px-3 py-2` and inner text — at default sizes the hit area is ≈40×40 on desktop. On mobile the "Prev" / "Next" rendering collapses to a short mono caps label still inside the same padding — passes 2.5.8.
- **1.4.3 Contrast.** `bg-[color-mix(in_srgb,var(--ledger-paper)_94%,transparent)]` with `backdrop-blur-md` over arbitrary background content — when scrolled over a dark-ish region (e.g. SacredRule won't apply since that's a modal, but over imagery in a future state) the contrast of inner ink-text could fail. Today, paper-on-paper, no failure. Tag for future state.

### M3.2 A/B sandbox — see M3 above.

### M4.2 SkillBuilder — see M4 above.

### M5.4 blast-radius matrix — see M5 above. **Critical: not rendering as a table at all.**

### LessonTutor docked chip (T.N.)

- **Collapsed-state button — 1.4.11 Non-text contrast.** Border `var(--ledger-rule)` ≈ `#D5D1C2` on `var(--ledger-paper)` ≈ `#F4F1E7` is ~1.4:1 — fails 1.4.11 (3:1 required for UI components). On hover it darkens to `var(--ledger-ink)` (passes), but the resting state border alone is sub-AA. Either bump to `var(--ledger-rule-strong)` for the resting state, or add a non-color signal (the gold clock SVG already does some of this — verify the SVG stroke is ≥3:1 against paper; gold `#7C5814` on paper is ~6:1 ✓, so the icon carries the affordance).
- **Open state — 4.1.2 dialog role missing.** The open panel `<div className="fixed inset-0 …">` is a modal-shaped UI but has no `role="dialog"`, no `aria-modal`, no `aria-labelledby`. It's a chat panel rendered as a div. Add `role="dialog" aria-modal="false" aria-labelledby="…"` referencing the h2 ("Trained on this lesson") and set `aria-describedby` on the textarea group.
- **2.1.2 Keyboard trap.** Escape closes — ✓. No Tab trap inside the panel — debatable for a non-modal but fine. If `aria-modal="true"` is added, a real focus trap is required.
- **4.1.3 Streaming response.** The pulse caret (`<span ... animate-pulse aria-hidden="true">`) is hidden from screen readers, which is right. But the streamed text accumulates in a div that's not a live region. A screen-reader user who asks a question hears nothing until they manually re-read the panel. Wrap the assistant turn in `aria-live="polite"` and set `aria-atomic="false"` so each appended chunk is announced incrementally. Be wary — Anthropic's stream emits many small text events; throttle the live-region updates to roughly 1× per second (set `aria-busy="true"` while streaming and toggle off on `done`).
- **2.4.6 Headings — heading order.** The panel uses `<h2>Trained on this lesson</h2>` while the page already has its own `h2`. There may be two `h2` siblings competing. Consider downgrading the panel header to a `<div role="heading" aria-level={2}>` only if the panel is conceptually a sub-section, or `aria-level={3}` if subordinate to lesson content.

### LessonSummaryCard cached-vs-pending state (T.N.)

- **4.1.3 Status messages.** The `loading` state ("Writing a three-sentence recap…") and the `empty` state (renders null) both happen without any `aria-live` announcement. A learner with reduced visual attention finishes the KCs, scrolls down, sees nothing, and waits. Add `role="status"` to the loading aside.
- **3.2.4.** The "From your course journal" indicator is only present when cached. That's a meaningful UX signal — make sure it's exposed to AT (mono caps with letter-spacing reads acceptably on most screen readers, but verify on NVDA).
- **1.4.11.** The "recap" aside uses `border-[var(--ledger-rule)]` resting — same sub-AA concern as the Tutor chip. Use rule-strong.

---

## Assessment audit — all 55 KCs (L.P. lead)

Compact per-lesson table. Columns: **CV** = construct-validity match to lesson body (✓/△/✗); **Disc** = a-priori discrimination guess (H/M/L based on distractor plausibility); **D** = distractor quality; **B** = Bloom verb match between stem and lesson body operation (with the level we'd code the stem at); **Fb** = feedback teaches when wrong; **V** = verdict (keep / rewrite / cut).

### M0

| ID | Stem (truncated) | CV | Disc | D | B | Fb | V |
|---|---|---|---|---|---|---|---|
| m0.1 Q1 | "How long is the longest lesson?" | △ | L | △ | Remember (UI fact) | ✓ | rewrite — meta-UI, not construct |
| m0.1 Q2 | "What do you have to do to keep something you create?" | △ | L | ✓ | Remember (UI fact) | ✓ | rewrite — meta-UI |
| m0.1 Q3 | "Can you change your role track later?" | ✗ | L | △ | Remember (UI fact) | ✓ | cut — pure UI policy, no construct |
| m0.2 Q1 | "Which can safely go into a consumer AI tool?" | ✓ | H | ✓ | Apply | ✓ | **keep — exemplar** |
| m0.2 Q2 | "The move when you need help on real customer details?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m0.2 Q3 | "T/F: this course's sandbox will stop you from pasting…" | △ | M | △ | Understand | ✓ | rewrite — the stem is about *the sandbox*, not the rule. Asks meta-product. |

m0.1 is the weakest cluster in the bank — all three items test course-policy memory, not the construct ("you have a Toolbox, the course is honest about time, tracks are flexible"). They are formative-as-onboarding, which is defensible, but if the course is going to lean on KC pass-rates as a discrimination signal these should not count. Tag them `category: orientation` and exclude from the discrimination model.

m0.2 Q1–Q2 are the **strongest** items in the bank — they probe the canonical "describe the situation, not the person" move that is the whole rule. Distractors are plausible (each represents a real misconception a banker would arrive with). Keep both verbatim.

m0.2 Q3's stem is constructed around the sandbox's *implementation*, not the rule. A learner who understands the rule perfectly can miss the question by miscalibrating the sandbox's actual behaviour. Rewrite: "Outside this course, will the AI tool stop you from pasting an account number?" — same teaching point, no meta-product layer.

### M1

| ID | Stem | CV | Disc | D | B | Fb | V |
|---|---|---|---|---|---|---|---|
| m1.1 Q1 | "Model confidently answers something it doesn't know — what happened?" | ✓ | H | ✓ | Understand | ✓ | keep |
| m1.1 Q2 | "Why doesn't it know about a rate change announced today?" | ✓ | H | ✓ | Understand | ✓ | keep |
| m1.1 Q3 | "What does a modern generative model fundamentally do?" | ✓ | H | ✓ | Remember/Understand | ✓ | keep |
| m1.2 Q1 | "Marketing leads with 'ship' — which bucket?" | ✓ | M | △ | Apply | ✓ | keep — option (d) is a joke distractor |
| m1.2 Q2 | "Vertical axis (free ↔ paid) is…" | △ | L | △ | Remember (meta-UI) | ✓ | **rewrite — asks about the lesson's diagram, not the construct** |
| m1.3 Q1 | "The role-specific audio frames AI as a change to…" | △ | L | △ | Understand | ✓ | rewrite — second-order ("the audio frames it as") |
| m1.3 Q2 | "Can you switch tracks later and hear another role's audio?" | ✗ | L | △ | Remember (UI policy) | ✓ | cut |
| m1.4 Q1 | "Which is the cleanest example of a good use?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m1.4 Q2 | "Model produces what looks like a direct quote — next step?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m1.4 Q3 | "General pattern that separates good uses from bad uses…" | ✓ | M | ✓ | Understand | ✓ | keep |

m1.1 is the cleanest item-cluster in the bank, full stop. All three items probe the same construct (next-token engine, no live wire, no facts after cutoff) from three angles — the textbook way to build a discrimination spread. The wrong answers are real beliefs a banker walks in with ("the model searched the internet," "it learns when I ask"). Distractor (a) on Q1 ("malfunctioned, should be reported") is the one a literal-minded compliance officer will pick — high diagnostic value.

m1.2 Q2 and m1.3 Q1/Q2 lean on meta-content ("the diagram," "the audio frames…"). These have low construct validity and almost zero transfer value — a learner who never opened the lesson can answer them from priors. Rewrite or cut.

### M2

| ID | Stem | CV | Disc | D | B | Fb | V |
|---|---|---|---|---|---|---|---|
| m2.1 Q1 | "Institution blocked claude.ai — next step?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m2.1 Q2 | "Free Claude on personal email — can you use it for this course?" | ✓ | M | ✓ | Apply | ✓ | keep |
| m2.2 Q1 | "Need to look up current text of a federal regulation — which tool?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m2.2 Q2 | "Best fit for a thinking partner with no search?" | ✓ | M | ✓ | Apply | ✓ | keep |
| m2.2 Q3 | "An embedded copilot is most useful when…" | ✓ | M | ✓ | Apply | ✓ | keep |
| m2.3 Q1 | "What text is safe to paste into the context box?" | ✓ | M | ✓ | Apply | ✓ | keep — but option (c) leans toward joke |
| m2.3 Q2 | "First run shorter than expected — honest interpretation?" | ✓ | M | △ | Understand | ✓ | keep — option (c) "you need a paid account" is a joke distractor |
| m2.3 Q3 | "Why save the response to your Toolbox?" | △ | L | △ | Remember (UI) | △ | rewrite — meta-product |
| m2.4 Q1 | "Recurring member email worksheet entry — what becomes of it?" | △ | M | △ | Understand | ✓ | keep — but the construct is "the worksheet bridges to M3," which is course-architecture, not banking |
| m2.4 Q2 | "Why does the course ask for one thing you'd never put through AI?" | ✓ | M | ✓ | Understand | ✓ | keep |

M2 is the strongest module pedagogically for the "matching tool to task" construct. The Apply-level coverage is good here — Q1 of each lesson generally asks the learner to apply the framework to a new scenario, not recognise it.

The "paid tier removes the rule" / "paid account for longer answers" distractors in m2.3 are joke-grade. Replace with the actual misconception a learner brings: "The summary will be inaccurate without the full record" (probes the real instinct to over-include data).

### M3

| ID | Stem | CV | Disc | D | B | Fb | V |
|---|---|---|---|---|---|---|---|
| m3.1 Q1 | "Which four parts make a prompt more useful than a one-liner?" | ✓ | H | ✓ | Remember | ✓ | keep |
| m3.1 Q2 | "Coworker says 'longer prompts are always better' — correct response?" | ✓ | M | ✓ | Understand | ✓ | keep |
| m3.2 Q1 | "What changes between the side-by-side outputs?" | ✓ | H | ✓ | Understand | ✓ | keep |
| m3.2 Q2 | "Why doesn't 3.2 ask you to save anything?" | △ | M | △ | Remember (course-meta) | ✓ | rewrite — meta |
| m3.3 Q1 | "Want the model to mimic a writing style — which pattern?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m3.3 Q2 | "Model keeps inventing regulations — which pattern fixes it?" | ✓ | H | ✓ | Apply | ✓ | **keep — exemplar** |
| m3.3 Q3 | "Generic, surface-level answer — most useful next move?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m3.4 Q1 | "Loan officer pastes loan app — is this a violation?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m3.4 Q2 | "Compliance analyst asks AI to summarise CFPB rule — violation?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m3.5 Q1 | "What artifact does 3.5 produce, what's the catch?" | △ | M | △ | Remember (course-meta) | ✓ | rewrite |
| m3.5 Q2 | "Why can you flip the role lever to another track's role?" | △ | L | △ | Understand (course-meta) | ✓ | rewrite |

M3.3 Q1–Q3 is the second exemplar cluster after M1.1. Three patterns, three scenarios, three Apply-level items with the right distractors named for each (constraints vs few-shot vs ask-for-what's-missing). The course's prompt-craft construct is being measured cleanly.

The meta-product KCs (3.2 Q2 about "why no save," 3.5 Q1 about "what artifact, what catch") test the course UX, not prompting. Move into a separate "onboarding awareness" bank or cut.

### M4

| ID | Stem | CV | Disc | D | B | Fb | V |
|---|---|---|---|---|---|---|---|
| m4.1 Q1 | "In one sentence, what is a 'skill' in this course?" | ✓ | M | ✓ | Remember/Understand | ✓ | keep |
| m4.1 Q2 | "Which is a 'locked choice' vs an 'input slot'?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m4.2 Q1 | "Mark length as 'let learner choose at run time' — what happens?" | ✓ | M | △ | Understand | ✓ | keep |
| m4.2 Q2 | "Why does the builder ask you to name slots with a help label?" | ✓ | M | ✓ | Understand | ✓ | keep |
| m4.3 Q1 | "Your role variant pre-loads defaults — can you override?" | △ | L | △ | Remember (UI policy) | ✓ | rewrite |
| m4.4 Q1 | "What does the guardrail check actually save?" | △ | M | △ | Understand | ✓ | keep but tighten — the construct here is "human-judgment note vs blocking gate," which is real |
| m4.4 Q2 | "Teammate asks if it's OK to put real customer text into the slot — answer?" | ✓ | H | ✓ | Apply | ✓ | **keep — exemplar (data discipline applied inside a skill)** |
| m4.4 Q3 | "Output is technically correct but slightly off-tone — right move?" | ✓ | M | ✓ | Apply | ✓ | keep |

M4 is solid. M4.4 Q2 is one of the most pedagogically valuable items in the bank: it tests whether the M0 data-discipline rule generalises *inside* the new context (skills) — Messick's "generalisability" aspect of validity in action.

### M5

| ID | Stem | CV | Disc | D | B | Fb | V |
|---|---|---|---|---|---|---|---|
| m5.1 Q1 | "Honest, current-state definition of an AI agent?" | ✓ | H | ✓ | Remember/Understand | ✓ | keep |
| m5.1 Q2 | "Where should a community bank NOT deploy autonomous agents today?" | ✓ | M | ✓ | Apply | ✓ | keep |
| m5.2 Q1 | "Which problem-frame question is the cure for 'we built the wrong thing well'?" | ✓ | M | ✓ | Understand | ✓ | keep |
| m5.2 Q2 | "What deliverable do you walk out of 5.2 with?" | △ | L | △ | Remember (course-meta) | ✓ | rewrite |
| m5.3 Q1 | "Why does the PRD include a 'non-goals' section?" | ✓ | H | ✓ | Understand | ✓ | keep |
| m5.3 Q2 | "Success criterion 'people will say they like it' fails — why?" | ✓ | H | ✓ | Apply (criticise → revise) | ✓ | **keep — exemplar (Bloom Analyze)** |
| m5.4 Q1 | "Which tool when you want real project with version control?" | ✓ | M | ✓ | Apply | ✓ | keep |
| m5.4 Q2 | "Builder asks for realistic banking material — correct response?" | ✓ | H | ✓ | Apply | ✓ | keep |
| m5.5 Q1 | "Which of three 'next ninety days' directions is wrong?" | △ | L | △ | Understand (gotcha) | ✓ | rewrite — gotcha-format ("none — they're all valid") signals construct-weakness |
| m5.5 Q2 | "What does the lesson say about AiBI-S / AiBI-L credentials?" | ✗ | L | △ | Remember (product roadmap) | ✓ | cut |

m5.3 Q2 is the closest the bank comes to a Bloom Analyze item — the learner has to recognise the failure of a stated success criterion and articulate why. That's the right shape for a build-the-PRD construct. Keep.

m5.5 Q1 ("which is wrong?" "none") is the gotcha pattern — it's a fine item *once*, but the very existence of "none of the above" as the correct answer is a soft tell. Either keep it as a deliberate construct-check ("did you actually read the three directions?") or rewrite into a scenario-pick.

---

## Widget exercises — joint verdicts

### OffLimitsSorter (m0.2) — A11y + pedagogy

**A11y (T.N.):** Cleanest custom-widget keyboard model in the codebase. radiogroup with roving tabindex, Enter/Space submit, polite live region on feedback. One nit (score not announced) and one nit (`aria-checked` flicker on advance). **Pedagogically (L.P.):** This is a *good* formative item. It runs the learner through 6–10 items with the same construct (off-limits / allowed / needs-review) varied by track. Distractors come built-in via the three-bucket sort. The "Needs review" middle category is the pedagogical centrepiece — it teaches that the data rule isn't binary and that institutional review is the safety valve. Cognitively this is Apply (categorise) with a touch of Analyze (distinguish "needs review" from "off-limits"). Verdict: **keep, fix the two a11y nits.**

### SpotTheViolation (m3.4) — A11y + pedagogy

**A11y (T.N.):** Solid two-option radiogroup; reveal panel is live; missed-violation state is non-color-signalled; focus-visible explicit. **Pedagogically (L.P.):** The two-option format is appropriate for the construct (is/isn't a violation). The teaching value is concentrated in the explanation — verify the seed pairs a *distinct* teaching line per wrong option. If the wrong-option explanation is generic, 3.3.3 fails and the formative purpose collapses. The "missed real violation" highlight is a sharp diagnostic move — equivalent to a flagged miss in classical-test-theory analysis. Verdict: **keep; audit seed to confirm wrong-option explanations teach.**

### SkillBuilder (m4.2 / m4.3) — A11y + pedagogy

**A11y (T.N.):** Four-step form with no stepper landmark, hidden `disabledReason`, lever-control sub-component not deeply audited. **Pedagogically (L.P.):** The construct ("a skill is a parameterised prompt with locked choices and input slots") is operationalised here as a real artifact the learner builds. That's the strongest possible evidence Messick's response-process validity could ask for — the learner doesn't *describe* a skill, they *make* one. The slot-label requirement teaches the abstraction directly (future-you needs the label). Verdict: **keep; add the stepper landmark + live-region disabled reason.**

### PRDBuilder (m5.3) — A11y + pedagogy

**A11y (T.N.):** Label-input-help relationships are right. Save-disabled reason is silent. PIIWarning live-region status to verify. **Pedagogically (L.P.):** Nine-section markdown-PRD builder. The 66%-fill threshold (>=6 of 9) is a smart compromise between "graded completion" and "shipping a useful artifact." Construct validity is high — the PRD is the deliverable, not a proxy for it. Verdict: **keep; consider per-section character minimums for the load-bearing sections (problem, success criteria, non-goals).**

### PrototypeLauncher (m5.4) — A11y + pedagogy

**A11y (T.N.):** Standard form + cards. Main gap is the missing blast-radius matrix table renderer in the lesson body upstream. **Pedagogically (L.P.):** The "pick a tool, link out, build, come back" loop is a reasonable scaffold for a 15-min lesson that's really a 1–2-hour build outside the LMS. The blast-radius matrix is the right artifact to make this safe. Once it actually renders, this becomes one of the highest-leverage cells in the course. Verdict: **keep; fix the table renderer immediately.**

---

## Cross-cutting a11y findings (T.N.)

- **1.3.1 Info & relationships — markdown table support is missing.** The `LessonBody` block union does not include `table`. The M5.4 blast-radius matrix breaks. Any future content authored as a GFM pipe table will silently degrade. **Highest priority.**
- **1.4.11 Non-text contrast — resting borders.** The Ledger token `--ledger-rule` (`#D5D1C2`) on `--ledger-paper` (`#F4F1E7`) measures ~1.4:1. Anywhere it's the sole boundary of an interactive component (Tutor chip resting state, LessonSummaryCard, several `LedgerCard variant="standard"` resting states) we're sub-AA. Either swap resting state to `--ledger-rule-strong` (`#A8AEBE`, ~3.2:1) or add a non-color signal.
- **2.1.2 Keyboard trap — SacredRule.** `Tab` is hard-intercepted. Replace with a proper focus scope.
- **2.4.3 Focus order on step change.** `LessonStepShell.goTo` does `window.scrollTo(top)` but doesn't move focus. Move focus to the new step's `<h2 tabindex="-1">`.
- **2.1.4 Character key shortcuts — J / K / arrows.** Globally bound on both `LessonStepShell` and `LessonStickyNav`. Currently exempt INPUT/TEXTAREA/contentEditable. Recommend a settings toggle and a documented help affordance ("Keyboard shortcuts: ←→ steps, J/K aliases").
- **4.1.3 Status messages — multiple components.** OffLimitsSorter score change, LessonSummaryCard loading state, SkillBuilder/PRDBuilder save-disabled reason, LessonTutor streaming response, M0.2 anonymisation flow state changes. None of these are wrapped in a live region today. Standardise with a small `<StatusLine role="status" aria-live="polite">` component and use it everywhere.
- **2.5.5 / 2.5.8 Target size.** Most buttons hit 24×24. The progress dots on the v2 shell are 4px tall (`h-1`) — the click target is the parent `<button>` which extends to the column width via grid, so the *interactive* surface is ≥24px. Confirm via DevTools that the implicit click box isn't constrained by the inner `<button>` size.
- **3.2.4 Consistent identification — kicker labels.** Mono-caps kickers with `tracking-[0.18em]` are read letter-by-letter by some screen readers ("M-O-D-U-L-E zero"). Verify against VoiceOver iOS + NVDA. If poor, add an `aria-label` with the natural-language version.
- **External-link convention — 3.2.5.** PrototypeLauncher links open in a new tab without screen-reader-only warning. Add `<span className="sr-only"> (opens in new tab)</span>`.

---

## Cross-cutting assessment findings (L.P.)

- **Content validity (Messick):** The bank covers the four advertised constructs (data discipline, model literacy, prompt craft, skills-as-saved-prompts) plus the M5 PRD/agent constructs. Coverage is even at 2–3 items per lesson. **Underrepresented:** verification discipline (M3.4 closing protocol — F10 in the fix log — has no KC). **Overrepresented:** course-meta / UI policy (~11% of items). Net: keep coverage roughly where it is; rebalance the misallocated 11% toward the underrepresented construct.
- **Internal-structure validity:** With three items per lesson and roughly even Bloom level within a lesson, the internal structure should be unidimensional per lesson. M1.1 and M3.3 are the clearest examples of well-structured clusters; M0.1 and M1.3 are the weakest (because they conflate UI fact with construct).
- **Response-process validity:** The widget exercises (SkillBuilder, PRDBuilder, OffLimitsSorter, SpotTheViolation) provide stronger response-process evidence than the KCs alone could. Use them as the primary mastery signal; keep the KCs as low-stakes formative checks.
- **Consequential validity:** The course's stated stake — "did you walk the rule out of the room?" (m3.5 framing) — is consequentially anchored on the data-discipline rule, not on a KC pass-rate. That's the right call. Do not start gating progression on KC scores.
- **Item discrimination — joke distractors.** Counted eight joke-grade distractors across the bank: "Pay $99 first" (m3.5), "Email a customer file to your personal account" (m2.1 — defensible because it's a real bad-decision distractor), "You need a paid account to get longer answers" (m2.3), "It refuses to discuss financial information" (m1.1), "It only learns from sources it deems credible" (m1.1), "Use a private-browsing window" (m0.2), "Only with admin approval" (m1.3), "Only after you save once" (m4.3). These are mostly defensible *individually* (a real banker walks in with each of these beliefs), but five per cluster inflates discrimination. Rule: at most one "obviously wrong if you read carefully" distractor per item.
- **Bloom-verb alignment (P1.5 partly addressed).** Re-counted post-fix: 5 Apply items (m0.2 Q1, m0.2 Q2, m1.4 Q1, m1.4 Q2, m3.3 Q1–Q3, m4.4 Q2, m5.3 Q2, several m2.* items). That's better than the pre-P1.5 baseline. Still **zero Analyze items** apart from m5.3 Q2 which is partial. Recommendation: convert m3.4 Q1/Q2 stems from "is this a violation?" to "what would you say to the loan officer to prevent it next time?" — that moves from Apply to Analyze without changing the lesson body.
- **Distractor distinctness:** Most options are distinct constructs. m0.2 Q3 has overlapping options (a/b both reference sandbox guardrails; c/d both deny them) — collapsing it to two would reveal the construct better, but that breaks the four-option convention. Accept.
- **Feedback quality:** Every wrong-option `explanation` field reviewed teaches a specific misconception, not "try again." This is a real strength of the bank. The discipline appears authoring-led, not generated. Keep this standard for any new items.
- **Item-bank size and randomisation.** 2–3 items per lesson, no rotation. For a free-tier formative bank this is fine. If the course ever moves to randomised KCs (free-tier B/C variants for re-attempts) the bank needs 4–5 per lesson minimum.
- **Formative vs summative posture.** Per the launch spec the KCs are formative; no summative gate. Posture is right. Just don't let it drift.
- **Sequencing.** The lesson body scaffolds the KC construct in all cases I sampled. The one exception is M5.4 Q1 (which tool produces "real project with version control") — the answer (Claude Code) is in the body but is also in the blast-radius matrix *which is not rendering*. Until the table renders, that KC is asking the learner to remember something they can't see.

---

## Top 10 a11y issues (by remediation priority)

1. **Add `table` block kind to `LessonBody`** — without this, the M5.4 blast-radius matrix (F5 from the fix log) is dead. Highest priority. (T.N.)
2. **Fix SacredRule keyboard model** — stop preventing default on Tab; bind Escape to close, not advance; add `aria-describedby`. (T.N.)
3. **Move focus to new step `<h2>` after `LessonStepShell` navigation** — 2.4.3 / 4.1.3 fix in one change. (T.N.)
4. **Wrap LessonTutor open panel as `role="dialog"`** with proper labelledby/describedby and a live region on the streaming assistant turn. (T.N.)
5. **Bump resting-state borders from `--ledger-rule` to `--ledger-rule-strong`** on every interactive surface (Tutor chip, summary card, recessed cards). 1.4.11 fix, one token swap. (T.N.)
6. **Add a `<StatusLine>` component and use it for save-disabled reasons, score changes, summary-card loading.** (T.N.)
7. **Add `aria-current="step"` stepper landmark to SkillBuilder.** (T.N.)
8. **PIIWarning component — verify it carries `role="status"`/`aria-live="polite"`.** (T.N.)
9. **External-link convention — add screen-reader-only "(opens in new tab)" everywhere.** (T.N.)
10. **Mono-caps kicker labels — verify screen-reader pronunciation** and add `aria-label` overrides where they read letter-by-letter. (T.N.)

## Top 10 assessment issues (by remediation priority)

1. **Cut or rewrite the six meta-UI KCs** (m0.1 Q1–Q3, m1.3 Q2, m2.3 Q3, m3.2 Q2, m3.5 Q1–Q2, m4.3 Q1, m5.2 Q2, m5.5 Q2). They're testing course policy, not the construct. Move to a separate `category: orientation` bank or cut. (L.P.)
2. **Add a verification-discipline KC to M3.4** — the closing F10 protocol (verify load-bearing numbers/citations against the source) has no KC. (L.P.)
3. **Convert at least two Apply items into Analyze** — m3.4 Q1 stem from "is this a violation?" to "what would you say to the loan officer?"; similar lift on m4.4 Q3. (L.P.)
4. **Audit `SpotTheViolation` seed for distinct wrong-option explanations** — required for 3.3.3 and for formative pull-through. (joint)
5. **Cap joke-distractors at one per item** — start with m2.3 Q2 ("paid account for longer answers") and m1.1 ("it refuses to discuss financial information"). (L.P.)
6. **m0.2 Q3 rewrite** — move from "this course's sandbox" to "outside the course, will the tool stop you?" — same teaching point, no meta-product layer. (L.P.)
7. **m5.5 Q1 rewrite** — replace the "none of the above" gotcha with a scenario pick. (L.P.)
8. **m5.5 Q2 cut** — product-roadmap question, not a construct. (L.P.)
9. **Tag every KC with `bloom_level` in the DB** — the column exists in the schema but isn't being used in the response payload audit. Without it we can't run discrimination by level later. (L.P.)
10. **Add per-section minimum length on PRDBuilder for the three load-bearing sections** (problem, success criteria, non-goals). Currently the 66%-fill threshold lets a thin PRD pass; the construct depends on those three being substantive. (L.P.)

---

## Verdict + remediation priority

**A11y:** The course is **closer to WCAG 2.1 AA than most v1 LMS surfaces** we'd benchmark against. The 1.3.1 markdown-table gap is the only finding that destroys course content as authored. Items 1–4 above are the launch blockers. Items 5–10 are polish-pass.

**Assessment:** The bank is **above industry baseline for an internal LMS** — feedback quality is consistently good, the widget exercises carry real response-process evidence, and the M1.1 / M3.3 clusters are exemplars. The shortcuts are **meta-UI items inflating the count** and **joke-distractor frequency inflating discrimination**. Both are content fixes, not architecture fixes — the bank can be rebalanced in one authoring pass without code change.

**Net:** ship-blockable on the table renderer (item 1); ship-mitigable on the SacredRule and step-focus issues; the assessment rebalance can be a follow-up. The Foundation Course as it stands today is, with these fixes, defensible as a $295 educational product — both as an a11y story and as a formative-assessment story.

— T.N. · L.P.
