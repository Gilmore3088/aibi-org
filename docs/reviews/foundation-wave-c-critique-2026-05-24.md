# Wave C Critique — 2026-05-24

## Summary
- 7 findings reviewed (A7, A8, A9, A15, A16, A17, A18)
- 6 VERIFIED-FIXED
- 1 PARTIALLY-FIXED (A7 — defensible-dimension mapping)
- 0 NOT-FIXED
- 0 REGRESSED
- 2 new findings surfaced (C1, C2)

`npx tsc --noEmit` clean (no errors outside `addie-v1-stash/`). Vitest:
A7 7/7, SpotTheViolation 4/4, lesson player suite 33/33.

## Per-finding verdicts

### A7 — Regulatory crosswalk · **PARTIALLY-FIXED**
Floor logic, status classes, copy boilerplate all sound. `personalizeRegulatoryRow`
(`InDepthBriefingView.tsx:140-176`) correctly falls back to `'part'/'Map yours'`
when `mapped.length === 0`, and `Math.min` over `pct` enforces examiner-floor
semantics. CSS adds `.status.weak` (oxblood) / `.status.strong` (forest) — no
conflict with existing `.gap` / `.ok` / `.part` (`briefing.css:531-538`). Vitest
covers band boundaries and the floor invariant (7/7 pass).

**Gap — dimension mapping defensibility.** Three rows map plausibly; three are
soft:
- **SR 11-7** → `security-posture + current-ai-usage`. Defensible — current
  AI usage is a proxy for model inventory.
- **FFIEC IT Handbook** → `security-posture + leadership-buy-in`. Soft — FFIEC
  IT is about vendor due diligence and architecture; leadership-buy-in is a
  governance posture, not a vendor-management control.
- **NCUA 24-CU-XX** → `leadership-buy-in + security-posture`. Defensible.
- **FinCEN AML** → `experimentation-culture + security-posture`. Weak —
  AML "innovative approaches" guidance speaks to testing rigor, not the
  v2 "experimentation-culture" dimension which measures the firm's appetite
  for trying new tools. These are not the same construct.
- **CFPB Fair Lending** → `security-posture + builder-potential`
  (`InDepthBriefingView.tsx:132`). **The weakest mapping.** Fair Lending
  cares about disparate-impact testing on credit decisions; `builder-potential`
  (named people who can ship) doesn't map to disparate-impact testing.
- **GLBA Safeguards** → `security-posture + training-infrastructure`.
  Defensible — Safeguards Rule literally requires a written training program.

The methodology doc (A17, `docs/in-depth-methodology-v2.md:115-126`) lists the
mappings as canonical. If they don't survive a CRO read, the doc compounds the
problem rather than fixing it. **Recommendation:** revisit the four softer rows
or add a one-sentence rationale to each row in the doc.

### A8 — Objective + transfer · **VERIFIED-FIXED**
Migration `00064` updates all 24 published lessons (counted: M0×2, M1×4, M2×4,
M3×5, M4×4, M5×5). Voice is consistent — verb-first observable objectives,
"On Monday, X" transfers. Sampled:
- m0.2 transfer "On Monday, anonymise one piece of work…" — banker voice ✓
- m3.1 transfer "replace your shortest…request with the four-part version
  — keep the diff" — banker voice ✓
- m5.4 transfer "send the prototype URL to one colleague with the question:
  'Would you use this if it were real?'" — sharp, not marketing ✓

`LessonObjectiveBeat` and `LessonTransferBeat` return `null` on empty input
(`LessonObjectiveBeat.tsx:13`, `LessonTransferBeat.tsx:14`). `LessonPlayer.tsx`
is the only consumer (verified by grep); branched lessons funnel through the
same player so beats render once, not per-track. Page selects `objective_md,
transfer_md` from `lessons` (`(addie)/foundation/[moduleId]/[lessonId]/page.tsx:77`).

### A9 + A18 — Gate hierarchy · **VERIFIED-FIXED**
`GateScreen.tsx:42-62` lays Pay as full-row hero, then `md:grid-cols-[3fr_2fr]`
for Email (3) + Decline (2, `data-emphasis='tertiary'`). CSS specificity:
`.addie-module-card[data-emphasis='tertiary']:hover` (0,2,1) beats the base
`.addie-module-card:hover` (0,1,1) — confirmed at `addie-course-surface.css:236-241`.
PayOptionCard (`p-6 flex flex-col h-full`) has no max-width but renders
left-aligned content; the hero treatment reads on desktop without distortion.

A18 reviewer claim verified independently: `ResultsViewV2.tsx` section order
is 1 (ResultsDashboard) → 1a → 1b → 2 → 2b → 4 → 4b → 5 → 6 → 7 → 9 (ClosingCta).
The CTAs are section 9, after the 7-day plan; the score reveal carries no
upsell. Reviewer's "no result-page change needed" call is correct.

### A15 — SpotTheViolation alignment · **VERIFIED-FIXED**
All three-way / "borderline" references in M3.4 lesson body removed. The one
remaining "three-way" string in `m3_addie.sql:397` refers to the *gate*, not
the violation drill — correct. `task_scaffold` (`m3_addie.sql:813`) updated to
"violation of the data-discipline rule or a clean use." Widget seed has 12
scenarios, each with exactly 2 options ("Violation" / "Not a violation"),
satisfying the renderer's `options.length === 2` constraint
(`SpotTheViolation.tsx:80`). Final-card interpretation copy ("revisit
confidential vendor material — that is where the calls were closest") matches
binary build. Widget tests 4/4 pass.

### A16 — Tables · **VERIFIED-FIXED**
Four GFM tables present: M2.2 4-col, M3.3 5-row, M4.4 4-col, M5.3 9-row. All
have `| ... |` pipe rows and `|---|---|---|---|` separator (verified by grep).
Tables are inside `$LESSON$ ... $LESSON$` dollar-quoted Postgres strings, so
embedded `|` characters are content, not SQL syntax — no SQL parse risk.
`LessonBody.tsx:268-293` parses GFM tables and emits semantic `<table>` with
`<th scope='col'>`. M5.3 "Length budget" column reads as helpful ("1 sentence",
"3–5 bullets") not bureaucratic.

### A17 — Methodology doc · **VERIFIED-FIXED**
`docs/in-depth-methodology-v2.md` exists, v2.0 stamped. Pillar mapping (line 37
"Builder Potential | Talent") matches `derive.ts:50` `'builder-potential': 'Talent'`.
Migration `00062_reconcile_readiness_tier.sql:124` does `RAISE EXCEPTION` if
`drift_count > 0`, enforcing the invariant the doc claims. `/methodology` route
(`src/app/methodology/page.tsx`) uses `force-static` + `process.cwd()` to read
the markdown — resolves at build time from project root, safe for production
since the doc is a tracked source file. Briefing → methodology link added
(`InDepthBriefingView.tsx:812` ff in the commit diff).

## New findings surfaced during Wave C

### C1 · Med · paid — Regulatory dimension mappings need rationale or rework
See A7 gap above. Four of six rows have mappings that don't survive a domain
read (FFIEC, FinCEN, CFPB Fair Lending, partly SR 11-7). The methodology doc
canonicalizes the mappings without justifying them, which is the exact failure
A17 was meant to close. Either revisit the mappings or add a one-line rationale
per row in `docs/in-depth-methodology-v2.md` and as `<small>` rows in the
exhibit.

### C2 · Low · curriculum — Objective beat duplicates lesson-shell intent on M0.1
On `m0.1`, `LessonShellHeader` already shows the track picker and orientation
preamble; the new ObjectiveBeat then says "Place yourself on the course map…"
which is a near-paraphrase. Visually it's a second framing card before the
learner reaches the body. Other lessons don't carry this redundancy. Consider
suppressing the ObjectiveBeat on lessons where the shell already states the
objective, or rewriting m0.1's objective to name a verb the shell does not
("Tell course-map navigation from track navigation" or similar).

## Recommendation

**GREEN-LIGHT WAVE D**, with one carry-forward: **C1 (regulatory mapping
defensibility) blocks the A17 claim of "examiner-grade trust artifact"** and
should be revisited before the In-Depth product copy promises board-readability
on the strength of the crosswalk. Six of seven Wave C items shipped cleanly;
the seventh (A7) is mechanically correct but compromises its own marketing
claim through the mappings it canonized.
