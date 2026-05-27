---
title: LMS Layout / Density Audit
date: 2026-05-27
branch: feature/lms-redesign
status: in-progress
purpose: surface what each LMS page needs structurally — not just token migration
predecessor: docs/lms-page-map-2026-05-26.md
---

# LMS Layout / Density Audit

PR #291 ported the LMS tree from Ledger to mockup tokens. That work was
**structure-preserving** — the chrome reads mockup-native but the
information architecture, content density, and visual hierarchy are
unchanged. This audit walks the tree top-down, surfaces structural gaps
against the mockup design principles, and proposes concrete redesigns.

## Design principles (anchor)

From `CLAUDE.md` Design Context, plus one new principle specific to this
audit:

1. **Show the artifact** — every section leads with the practical thing
   the product produces, not the structure that produces it.
2. **Interactive previews where possible** — tabs, scenario pickers,
   role tabs. Static screenshots are last resort.
3. **Specific over clever** — concrete numbers, scenario names, role
   labels.
4. **Two-tone restraint** — at most two surfaces per section.
5. **Accessible by default** — WCAG 2.1 AA, focus rings, semantic HTML.
6. **Lead with what's next, not what was decided** — every page should
   answer "what do I do now?" within the first viewport. The current
   tree often answers "here is the structure of the course" first.

---

## 1. `/courses/foundation/program/purchase`

### What it is today

Public marketing landing + Stripe checkout. Renders inside
`CourseShell` (sidebar with locked module list) so non-enrolled visitors
see the course structure on the left while reading the sales page.

Vertical order on the page itself:
1. Hero card (dark `--ink`, gold pill eyebrow "$295 · 12 modules · lifetime")
2. H1 "AiBI-Foundation." + gold-soft lede ("Earn the credential your examiner respects")
3. Promise paragraph ("12 self-paced modules…")
4. Enroll strip (`#enroll` anchor) — $295 lead + "$199/seat at 10+" + lifetime subtext + Stripe button
5. 4-cell stats grid (modules / minutes / artifacts / cohort)
6. Two side-by-side cards: "What you'll be able to do" (6 outcomes) + "What you'll have when you finish" (4 required outputs)
7. Lifetime access section (6 includes)
8. `<CurriculumByPillar>` — 12 modules grouped by 4 pillars
9. `<PurchaseFAQ>` — Q&A accordion
10. `<FinalCTA>` — bottom enroll repeat

For already-enrolled visitors: replaces hero with a centered confirmation card + dashboard CTA.

### Where it falls short

- **Lead is abstract.** "AiBI-Foundation." + "Earn the credential your examiner respects" tells the reader the *outcome* but doesn't show them the *artifact*. Per principle 1, the hero should show a sample artifact (a sample saved prompt, a screenshot of a graded work product, the credential itself) so the buyer sees what they're buying.
- **Stats row is filler.** 4 cells (modules / minutes / artifacts / cohort) is course-structure information the buyer already trusts. It takes vertical space that could carry social proof, a sample syllabus excerpt, or the specific moment of "this is what you'll learn to write."
- **Two-card outcomes block is generic.** "What you'll be able to do" is six bullet points written at the same abstraction level as a LinkedIn post. Principle 3 (specific over clever) is violated — none of the six bullets name a banking workflow concretely. A reader can't picture themselves doing the thing.
- **CurriculumByPillar buries the goods.** Module 1–12 grouped by pillar is structurally correct but emotionally inert. The pillar names (Awareness / Understanding / Creation / Application) carry no information for the buyer.
- **No social proof anywhere.** Per the launch spec, the course is positioned as "the credential your examiner respects." There is no examiner quote, no Institute principal photo, no banker testimonial. The buyer takes the brand's word for it.
- **Buy decision happens twice.** EnrollButton appears in the hero AND in FinalCTA. Two CTAs is fine; the structure between them doesn't earn the second click.

### Redesign proposal

Reorder the page around a single narrative arc: **see the artifact → see the proof → see the price**.

```
1. HERO — dark navy
   ├── Eyebrow:   "AiBI-Foundation · 12 modules · $295 · Lifetime access"
   ├── H1:        "Walk away with a saved-prompt library and a credential
   │              your examiner respects."  (concrete + outcome together)
   ├── Lede:      Two sentences — what the course turns into for the learner,
   │              not what the course consists of.
   └── Artifact:  Render an actual saved-prompt card (gold-bordered),
                  with the title, the prompt, and a "Reviewed · Module 3"
                  metadata strip. Buyer SEES the thing.

2. SAMPLE WEEK — cream
   "What a typical module looks like."
   Three-column row: LEARN IT (key takeaways card) · TRY IT (sandbox
   screenshot or scenario card) · USE IT (acceptable-use card sample).
   Each card is real content from Module 1. No marketing copy.

3. WHAT YOU LEAVE WITH — white card on cream
   The four required outputs as artifact thumbnails, not bullet points:
   - "Acceptable Use card" — render a sample card
   - "Saved-prompts library" — render the empty-state vs. filled-state
   - "Reviewed work product" — render a sample with reviewer feedback marks
   - "Final practical assessment" — render the rubric

4. PRICING + PROOF — cream
   $295 lead, $199/seat at 10+. ONE quote from the Institute's principal
   reviewer about what gets graded. ONE statistic (FDIC efficiency-ratio
   context or the Cornerstone "57% skill gap" stat). Then the enroll
   button — primary call to action, gold fill on ink.

5. CURRICULUM — collapsed by default
   12 modules as a single ordered list with the artifact each produces
   beside the title:
     Module 3: Prompt Architecture → produces "Three saved prompts"
     Module 7: Reviewed Work Product → produces "Reviewed artifact"
   Click to expand each module's three sub-sections.

6. FAQ — cream
   Existing PurchaseFAQ component, restyled.

7. FINAL CTA — dark navy
   One paragraph + enroll button. Identical to step 4 button. No new info.
```

### Scope

**Large.** Hero needs a real "saved prompt card" component built (50-80
lines), the Sample Week section is new content + new components (~150
lines), the artifact thumbnails are new (~100 lines), CurriculumByPillar
needs replacement with a flat ordered list keyed by artifact (~80 lines).
Tier estimate: ~600 lines of new/changed code.

### Dependencies

- A real "Saved Prompt" card component (lives in `_components/`) — reused on the home page Sample Week section
- Content authoring: one sample saved prompt, one sample reviewed work product with feedback marks
- A principal-reviewer quote (operator decision: who, what they say)
- One sourced statistic from the CLAUDE.md sourced-stats table (FDIC 65% or Cornerstone 57%)

---

## 2. `/courses/foundation/program` (home — enrolled learner)

### What it is today

Renders inside `CourseShell` with sidebar showing the 12-module list and
progress. The main column carries:
1. `LMSTopBar` — breadcrumb ("Education / AiBI-Foundation") + right-side "N/M complete" stat
2. `HeroIntro` — welcome message based on enrollment state + the course promise
3. `ResumeStrip` — "continue where you left off" — current module card with title + minutes + Continue CTA
4. `ProgramStatsRow` — modules / minutes / artifacts
5. `OutcomesPanel` — what learners walk away with (4 outputs)
6. `RolePathCard` — role-personalized recommendations (only if role completed in onboarding)
7. `CourseStructure` — 12 modules grouped by 4 pillars, each card with progress dot + minutes

### Where it falls short

- **HeroIntro repeats marketing.** The learner already bought the course. They don't need "the course promise" again — they need to know what they're doing next. Principle 6 violation.
- **ResumeStrip is buried.** "Continue where you left off" should be the **first viewport**. It's currently 3rd, after the hero. A returning learner has to scroll past welcome language to find the resume button.
- **ProgramStatsRow is redundant.** The sidebar already shows progress (locked / current / complete dots). Stats row is a second copy of the same information in different visual form.
- **OutcomesPanel is buyer copy.** "What you walk away with" is sales language. The enrolled learner already bought it. Replace with "what you produced this week" or "your saved-prompts library."
- **CourseStructure leads with pillars.** Pillar names (Awareness / Understanding / Creation / Application) are curriculum framework, not a learner's mental model. Learners think module-by-module ("Module 5 — that's the prompts one") not pillar-by-pillar.
- **No artifact dashboard.** The learner's saved prompts, reviewed work products, and "what I've made" don't surface anywhere on the home page. Principle 1 violation — the home should *lead with the artifacts the learner has produced*.

### Redesign proposal

```
1. RESUME BAR — sticky, dark navy, top of main column
   "Continue Module 5: Reviewing AI Output"
   ├── Progress dots ▣▣▣▢▢▢▢▢▢▢▢▢ (5 of 12)
   ├── Last activity:  "Tried: 'Summarize a credit memo' · Saturday"
   ├── Time remaining: "About 28 min left in this module"
   └── CTA: "CONTINUE →" (gold on ink)

   (For brand-new learners: shows "Start Module 1" with the same shape.)

2. YOUR WORK — cream, white cards
   Three thumbnail cards in a row showing what THIS learner has produced:
   - "3 saved prompts" — preview of one prompt name + last edited
   - "1 reviewed work product" — title + reviewer status pill
   - "Acceptable Use card" — drafted / submitted / approved pill

   For week-one learners: empty-state placeholders that show what the
   slot will look like once filled. ("Save your first prompt in Module 3.")

3. THIS WEEK'S MODULE — white card
   Module 5 (or whatever's current) with its three sub-tasks:
   ├── Learn it (key takeaway preview)  — 12 min — ▣ done
   ├── Try it  (scenario card preview)  — 18 min — ◐ in progress
   └── Use it  (work product to submit) — 25 min — ▢ pending

4. WHERE YOU'RE GOING — cream
   The next 3 modules in plain order (not pillared), each with one-
   sentence artifact name:
     "Module 6: BSA Narrative Drafting → produces a reviewed memo"
     "Module 7: Reviewed Work Product → produces your capstone"
     "Module 8: Final Practical Assessment → grades the capstone"
   Beyond Module 8: "+ 4 more modules" link to the full curriculum.

5. FULL CURRICULUM — collapsed accordion
   Behind a "Show all 12 modules" trigger. When expanded, replaces the
   current CourseStructure with a flat ordered list keyed by artifact.
```

The sidebar (CourseShell) keeps showing all 12 modules + progress — it's
the structural navigation, and that's the right place for structure.

### Scope

**Medium.** ResumeStrip needs to become a denser "sticky resume bar"
(~50 lines). Your Work block is a new component (~150 lines). This
Week's Module needs to read the current module's sub-tasks (~80 lines).
Where You're Going is small (~40 lines). Full Curriculum already exists
in CourseStructure — just collapse by default + reorder to flat list.

### Dependencies

- A consistent "saved artifact card" component (reusable on /purchase, /toolkit, /artifacts/[id])
- Module content needs to expose sub-task names + completion state per sub-task (verify the data is there)
- "Last activity" copy needs to be generated from the latest activity completion (verify a row exists for "what was the last touched thing")

---

## 3. `/courses/foundation/program/[module]` — the template for all 12 modules

### What it is today

Module body. Renders inside `CourseShell`. Main column:
1. Module top-bar link (back to course home)
2. Module header card (pillar tag + module number + module title + lede)
3. "You walk away with" card (the artifact this module produces — recently promoted from a footnote to a top card)
4. Loop ribbon — 3 stats (minutes / activities / artifacts)
5. Banking Boundary — the safety rules + escalation list specific to this module
6. ModuleTabs — Learn it / Try it / Use it / Save it
7. Inside each tab: heavy custom layouts (LearnSection, OutputExample, SkillBuilder, WorkProductForm, ActivityForm, etc.)

### Where it falls short

- **Header + loop + boundary all happen before the actual content.** Principle 6 violation — by the time the learner reaches the tab content (which is the actual work), they've scrolled through three pieces of metadata.
- **Banking Boundary repeats every module.** It's a module-level safety frame, but it carries the same form on every module page. After Module 3 it reads as boilerplate.
- **ModuleTabs is the right pattern but tab labels are abstract.** "Learn it / Try it / Use it / Save it" tells the learner the verb, not the artifact. "Read the takeaway / Run the sandbox / Submit your prompt / Save the card" would be specific.
- **No "where am I" within the module.** The sidebar shows which module you're in but not which sub-task. A learner who closes the tab mid-Try-it loses their place to a tab-state that defaults to Learn-it.
- **Save it tab is the artifact tab but it's labeled like a noun verb.** Per principle 1, the Save tab should show the artifact the module produces (a saved prompt, a reviewed work product) as the destination — labeling it "Save it" undersells the moment.

### Redesign proposal

Two layers of change: minor (re-label, reorder) and structural (sub-task progress).

#### Minor changes (small scope)

```
Top-bar:        unchanged
Module header:  unchanged (already mockup-ported, leads with artifact)
"You walk away with" card:  PROMOTE to the headline — make this the H1
                            of the page. ("This module produces a saved
                            prompt for BSA narrative drafting.")
Loop ribbon:    KEEP but compact — single row, smaller, below the H1.
Banking Boundary: COLLAPSE behind a "Safe-use boundary for this module"
                  accordion. Expanded by default on Module 1; collapsed
                  by default on subsequent modules (learner has seen it).
ModuleTabs:     RE-LABEL.
   Learn it → "Read the takeaway"   (or just "Takeaway")
   Try it   → "Run the sandbox"     (or "Sandbox")
   Use it   → "Submit your work"    (or "Submit")
   Save it  → "Saved artifact"      (the noun, not the verb)
```

#### Structural changes (medium scope)

```
Sub-task progress strip — between H1 and the loop ribbon:

   [▣ Takeaway · 12 min] → [◐ Sandbox · 18 min] → [▢ Submit · 25 min] → [▢ Save]

   - Replaces ModuleTabs as the primary navigation when scrolled into view
   - Each sub-task gets its own scroll-anchored section, not a tab
   - User scrolls naturally through Takeaway → Sandbox → Submit → Save
   - The strip stays sticky at the top (under the global nav) so the
     learner always knows where they are
```

This is a **bigger structural call**: do we keep ModuleTabs as the
in-page nav, or do we move to a scroll-through-with-sticky-progress
pattern? Page-map's operator decision said "ModuleTabs stays as the
working assumption; revisit if a sub-route pattern emerges naturally."
A sticky-sub-task-progress strip is a third option — neither tabs nor
sub-routes — that gives the learner orientation without splitting the
content into hidden tab panels.

### Scope

- **Minor changes only:** Small. ~50 lines. Mostly relabeling + adding accordion behavior to Banking Boundary.
- **+ structural sub-task strip:** Medium. ~150 lines. Plus the question of whether to keep the tab abstraction at all.

### Dependencies

- Module content already has sub-task data (each tab is a `<section>` and the data shape is there); no content changes needed for the relabel
- For the structural change: the tabs' children need to render as scrolled-in-page sections instead of conditional panels — a `ModuleTabs` refactor

### Open question

**Tabs vs scroll-through?** This is the user's call. The current tabs
work but they hide content. Scroll-through is more editorial and
matches the "lead with the artifact" principle but it makes long
modules visually long.

---

## Sections 4–14 — pending audit

The audit for the remaining 11 routes will be added as we move down the
tree. Order per the table at the top of this doc.

For each, the audit will follow the same shape:
- What it is today
- Where it falls short (per the six principles)
- Redesign proposal
- Scope
- Dependencies

---

## How to use this audit

Each section above closes with an actionable proposal. The operator
picks the surface to start with, signs off on the proposal (with any
edits), and the implementation lands as a focused commit on
`feature/lms-redesign`.

Pick one. We act. We move to the next.
