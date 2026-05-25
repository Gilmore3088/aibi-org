# Foundation Course — Pair 2 Critique
## Product design × Curriculum architecture

**Pair:** Sara Lindqvist (ex-Stripe/Linear, editorial design lineage) · Dr. Marcus Whitfield (EdD, ex-Wharton ExecEd, ex-Stanford Continuing Studies)
**Reviewed:** all 24 lessons + `/foundation/gate` · 2026-05-24
**Anchored on:** post-Round-1 fixes (sandbox lockdown F1/F18, institutional approval gates F2, SR 11-7 thread F3, M5.4 blast-radius matrix F5, honest timing F7, verification discipline F10, Workbench Pack removal F11, leadership One-Pager F13, departmental worst-case F19) and Pair 1 findings P1.1–P1.5 — see `foundation-fix-log-2026-05-24.md` and `foundation-pair1-cogload-id-2026-05-24.md`.

We have not re-litigated any of those. Where a Pair 1 finding is already in scope, we cite it and move on. The critique below is what the design layer and the instructional-design layer surface together when you walk the course as a paired reviewer for the first time.

---

## Headline (3 bullets — joint)

- **The course is genuinely well-built copy on a lesson chassis that does not yet earn the copy.** The body markdown is dense, sequenced, voiced. The renderer in `LessonBody.tsx` (728 lines, hand-rolled) honours the editorial intent — `[stat]`/`[case:good|bad]`/`[save]`/`[tip]`/`[warn]` are real semantic blocks, not decoration. What's missing is the *page-level* rhythm: there is no consistent F-pattern anchor at the top of each lesson, the kicker/title/lede sequence is implicit rather than designed, and the only thing the eye reliably catches across 24 lessons is the `[stat]` numeral. The course reads more like a long-form essay than an instructional surface.
- **Backward design is half-built and the bottom half is the missing one.** Wiggins/McTighe asks for objectives → evidence → activities, in that order. The course has the *activities* (every lesson has a body, most have a knowledge check, half have an interactive) and the *enduring understandings* (M0.1's "I have heard of it → I built it" is the closing-line contract). It is missing the explicit per-lesson **enabling objectives** (Pair 1 P1.2 already named this) and the **alignment audit** that ties each KC and each interactive back to a Bloom verb. The result is invisible: the course is on average ~75% Remember/Understand at the check level (Pair 1 P1.5 confirmed), and the four Apply/Analyze checks are the four every reviewer can name. — M.W.
- **The M5.4 blast-radius matrix is the single best piece of design discipline in the course, and it is also the thing that tells you what the rest of the course is missing.** A four-column table — Tool · What it produces · Where it runs · Hands on real systems · IT-handoff line — is the highest data-ink ratio surface on the site. Tufte would mark it as the model. Every other module wants a comparable table and only m2.2 (four tool families) and m3.3 (five patterns) currently get close. Tables are the course's untapped primary visual organ. — S.L.

---

## Module-by-module audit

### M0 Orientation — design (S.L.) / curriculum (M.W.)

The M0.1 `[stat]` card "6 · 24 · 8–30m" is the cleanest F-pattern hit in the course — three numbers across the top, shape of the course landed before the eye touches prose. Proximity (gestalt) groups the numerals into one perceived object; the mono caps over Newsreader display creates the contrast hierarchy that makes the `[stat]` block do its job. **What lets the page down is the run of `[case:good]` cards directly underneath.** Four cards in a vertical stack, all the same `border-[var(--ledger-ink)]` weight, all the same width, all the same title scale. Similarity has flattened them into one perceived stripe; there is no visual anchor to the *most important* one ("The Toolbox — what makes this course different"). Von Restorff (isolation effect) says one of these should be visually distinct — wider, taller, or surfaced as a `[save]` instead. The renderer treats the four as siblings; the curriculum treats them as parent + three siblings. The design has not caught up. — S.L.

M0 is the cleanest module curriculum-side. M0.1 is a true *advance organiser* (Ausubel) — it tells you the course's shape, the contract, the gate, and what you'll have at the end. M0.2 carries the *enduring understanding* of the entire course in one sentence ("describe the situation, not the person"), and the side-by-side `[case:good]`/`[case:bad]` pair is the textbook *worked example* sequence Sweller would mark for the field. The OffLimitsSorter that follows is a Bloom *Apply* task (sort a novel item into the right bucket) but only after the worked example — sequence is exactly right. **What's still missing:** an enabling objective at the head of each lesson. M0.1 implicitly is "describe the shape of the course"; M0.2 implicitly is "apply the one rule." Make them explicit in one line of Bloom verbs each, per P1.2. The course's voice will hold. — M.W.

### M1 What gen AI is

The M1 lessons all live on the same template — H1, opening lede, `[stat]` card, run of `[case:good]` cards, `[tip]`/`[warn]`, occasional knowledge check at the foot. M1.1 carries it well because the three-property `[stat]` (Training cutoff · No live knowledge · Hallucination as a property) is doing real schema work; the three `[case:good]` cards below are *the* three properties expanded one by one. That's gestalt's *common region* used correctly — the cards belong to the stat. M1.2 is where the template starts to wobble: the lesson's takeaway is a *two-bucket* mental model (Assistants vs Builders), but six cards follow the stat, and the four tool-family names (Thinking partner / Research assistant / Construction crew / Embedded copilot) actually live one lesson later in M2.2. The first-time reader gets two parallel sortings of the same world in 20 minutes. **Pre-sort one card in the interactive matrix** as Pair 1 already flagged, but also: cut M1.2 to two buckets in body copy and defer the four-family card to M2.2 entirely. The 728-line renderer is honest enough to let this happen; the seed copy needs a small edit. — S.L.

M1 carries the heaviest Bruner-scaffolding load in the course and mostly earns it. M1.1's "predictive token engine" is the *abstraction* the next 20 lessons rest on; M1.4's "good uses bring public material, bad uses send sensitive material" is the *applied generalisation* of the same abstraction. The connective tissue is M1.2 (taxonomy) and M1.3 (audio for your role). M1.3 is the lesson I cannot fully assess — the body_md is essentially stage directions and the actual teaching lives in `addie.lesson_track_variants.body_md`, which we confirmed has 25 rows for 5 tracks × 5 branched lessons (the m1.3 variants are the meaningful ones). Without listening to all five variants I cannot certify Felder-Silverman fit — but the *design* decision to make this lesson audio-only is defensible: it lowers extraneous cognitive load (Sweller) by removing the visual track. **The risk is Mayer's modality principle in reverse:** when audio is the ONLY channel, learners who skim die. Pair 1 already named the transcript-by-default fix; I'd go further and surface a 60-second printable summary card at the head of the lesson so the skim-reader gets the bones. — M.W.

### M2 Access & workflow

The M2 lessons are where the design's *spacing-as-rhythm* discipline is most visible — and where the eye notices that the renderer is missing one move. Each lesson opens lede → `[stat]` → three or four `[case:good]` → `[warn]` → closing. The `[case:good]` cards are 12–14ch line length internally because they're constrained inside a max-w-[68ch] article container — that's correct for reading (50–75ch is the modular-scale optimum for serif body). But the run of three or four cards stacked vertically reads as *one long column* rather than *three artefacts*. Newspapers solve this with column breaks and pull-quotes; here, the pull-quote slot exists (`[save]`) but is under-used — only m0.2, m2.4, and the leadership variant of m4.1 currently elevate their load-bearing sentence into a `[save]`. Pair 1 already named this; from a design angle, **the rule should be one `[save]` per lesson, top-positioned, screenshot-shaped (16:9 within the prose column)**, so the reader's phone camera roll becomes a personal Pack. — S.L.

M2.3 is the course's first sandbox and the moment where the entire teaching strategy pivots from *expository* (M0–M1) to *exploratory* (M2 onward). Gagné's Nine Events would call this the move from *Present content* (event 4) to *Provide learning guidance* (event 5) — and the lesson nails the transition. "Three small moves · Pick a starter · Read slowly · Add public context" is exactly the *guided observation* scaffold Vygotsky would mark as scaffolded ZPD: the learner is doing the work, but the rails are set, the starter is provided, and the read-slowly instruction is metacognitive prompting that Black & Wiliam-grade formative assessment depends on. **What is missing inside this lesson — and what Pair 1 already flagged — is the three-observation-prompt scaffold** ("Length? Shape? Does it ask you a question back?"). Without it, "read slowly" is an invitation without rails. The post-F18 `[warn]` honesty about what the regex catches (formatted SSNs, Luhn PANs, emails, phones, DOB-in-context) is genuinely important; **promote it into the sandbox UI itself**, not just the lesson body, because the learner returns to this sandbox in M3.2 and M3.5 and the body context is gone by then. — M.W.

### M3 Prompting + Gate

M3.1 is the course's design high point. The lesson opens with a four-numeral `[stat]` (Role · Task · Context · Format), then four `[case:good]` cards in *parallel structure* — each opens with the part name as the lead phrase, defines it, gives the move, lands the outcome. Gestalt's *similarity* and *good continuation* are working together; the eye reads it as a grid even though it renders as a vertical stack. This is the lesson where the editorial voice and the design discipline align without effort. — S.L.

M3.2 is the lesson I would intervene on most aggressively. Pair 1 named it the critical cognitive-load offender; from the design angle the same finding has a separate cause. The lesson stacks three levers, a side-by-side renderer with diff highlights, and a `[warn]` (slot-machine trap) — but **the rendered surface has no `[stat]` card carrying the lesson's structure**. Every other M3 lesson opens with three or five numerals as the schema anchor; M3.2 has "3 | Three runs in the sandbox" but it lives inside a `[stat]` block that the eye reads as one of seven cards, not as the index for the lesson. The fix is structural: lift the three-lever schema *out* of the SCRIPT block and render it as a numbered ribbon across the top, F-pattern-aligned, so the learner sees "audience → length → source" as the lesson's spine before they ever touch the sandbox. That single change handles Pair 1's progressive-disclosure fix at the *navigation* level rather than requiring a lesson split. — S.L.

M3.2 is also the lesson where Gagné's nine events break down. *Gain attention* (event 1) is the opening sentence ("Same model, same task, three runs"). *Inform learner of objectives* (event 2) is absent — the body never says "by the end of this you can predict which lever moves output most." *Stimulate recall of prior learning* (event 3) is implicit (M3.1's four-part brief is assumed). *Present content* (event 4) is the three `[case:good]` cards. *Provide learning guidance* (event 5) is the `[tip]` about lever isolation. *Elicit performance* (event 6) is the sandbox itself. *Provide feedback* (event 7) is the side-by-side rendering — but only visual, no instructor or rubric overlay. *Assess performance* (event 8) is the knowledge check (m3.2/Q1 and Q2 are both Remember-level). *Enhance retention and transfer* (event 9) is missing entirely. **The lesson asks the learner to notice without telling them what they noticed should generalise.** The fix is one closing `[save]`: "When output drifts, change one lever and rerun. Three runs is the budget. The lever that didn't move output is information." — M.W.

M3.4 is the spaced-retrieval moment the course needs more of (Pair 1 named it). One additional curriculum finding: **the SpotTheViolation component renders binary choices**, not the three-way "violation / clean / borderline-with-a-fix" that the body promises. We read `SpotTheViolation.tsx` lines 28–34 — each scenario has `ReadonlyArray<ScenarioOption>` with two options. The body copy says "violation, clean, or borderline-with-a-fix?" — that's a three-option schema. The interactive shipped is a two-option drill. Either align the copy to the build (two options is defensible; binary calibration is also legitimate) or expand the interactive. Right now the lesson teaches one taxonomy and tests another, which violates Wiggins/McTighe's alignment triangle (objectives ↔ evidence ↔ activities). — M.W.

M3.5 carries the new `[case:bad]` "what can go wrong by department" (F19, just landed) and it is the strongest editorial close on the free side. Five worst-case scenarios, one per department, each with a documented industry instance. This is what von Restorff isolation looks like done right — the `[case:bad]` (oxblood border) lands after a stack of `[case:good]` (ink border) and the eye stops. — S.L.

The Gate page (`/foundation/gate`, `GateScreen.tsx`) renders well. The "Milestone · Module 3 complete" kicker over the ink-hero banner is the right emotional move — Knowles (adult learners) and Self-Determination Theory's *competence* principle both want the milestone surfaced. The three-card grid below has the right Fitts's-law affordance (large tap targets, 5-gap, distinct cards). **The critical design issue** is one the Pair 1 review already flagged from a UX angle, and it bears repeating from the visual side: the three cards present as *visually equivalent* under Nielsen #2 (match between system and real world). $295 / email / $99 are radically different cost shapes. The current grid carries `data-tier="paid"` on only the first card, but visually the three cards are siblings. The "Bring the whole team in" band below ($199/seat · min 10) and the footer reassurance strip (No countdowns · No scarcity · Built for bankers) are the right institutional moves — they cool the choice, which is what an editorial product does where a SaaS product would heat it. Keep those. — S.L.

Pedagogically the gate is in the right place (Bruner's *progressive complexity*: M3 ends with using prompts, M4 starts with locking prompts into skills — a real shift). But Gagné's event 9 (*enhance retention and transfer*) is missing from the gate experience itself. The gate currently celebrates the milestone (event 1: gain attention) and asks for a transaction. It does not tell the learner *what the Pack they just built will do for them in week 2*. One sentence on the gate page — under the milestone banner, above the three doors — would carry the practice from inside the course out into Monday morning: "Your Starter Prompt Pack is ready. Open it Monday at 9am and one of the three will fit." That's both retention scaffolding and a soft justification for the email-to-keep option. — M.W.

### M4 Skills (paid)

M4.1 is the second curriculum high point. The two-part anatomy (locked choices + input slots) is the *concept abstraction* Bruner's spiral curriculum wants — the learner already met prompts in M3.1 and now meets *prompts with structure*. The KC at m4.1/Q1 ("a saved, parameterized prompt — locked choices plus named input slots — that you run on new material") is a clean Bloom *Understand* check; m4.1/Q2 (which is a locked choice vs an input slot?) is *Apply*. Two checks, two levels, both load-bearing. This is the design template the rest of the course should use. — M.W.

The M4 lessons share a design problem with M3: the SkillBuilder interactive (486 lines, four-step builder per its header comment "Source · Lock choices · Name slots · Save") is doing the lesson's actual teaching, and the *step indicator* across the top is the single most important wayfinding artefact. **From the source we sampled (lines 1–130) the four-step indicator pattern is implied but not explicit in the data model** — `BuilderMode` is `'template' | 'role-skill'` and the seed contract names `builder_sources` and `track_defaults` blocks. The Pair 1 review confirmed the visible affordance exists; I'd add the design ask: the four-step ribbon at the top should be sticky on scroll (`position: sticky`, top of the LedgerCard container), so when the learner is in step 3's slot-naming and scrolls back to re-read the locked choices in step 2, the spine doesn't leave the viewport. Nielsen #1 (visibility of system status) plus Fitts (a sticky breadcrumb is a one-pixel target for "where am I"). — S.L.

The M4.3 branched lesson (track-default skill builder) is the one place in the course where the track variants are doing *applied* differentiation rather than *expository* differentiation (m1.3 is per-role audio narration; m2.4 worksheet is per-role prompt seeding; m3.5 is per-role pack seeding; m4.3 is per-role *Skill defaults*). M4.3 is therefore the proving ground for whether five-track branching earns the production cost. We checked `addie.lesson_track_variants` — 25 rows, distributed across the branched lessons. The leadership track is thin (Pair 1 F14 deferred). **The pedagogical recommendation:** before adding leadership variants on M1/M2, fill out the M4.3 track defaults for all five tracks completely. M4.3 is where the branching pays the rent. — M.W.

### M5 Prototypes (paid)

M5.1 is the most editorially confident lesson in the course (Pair 1 said this; we agree). The three shapes by review-loop length (Assistant → Skill → Agent) is the *unifying schema* — a single sentence ("AI work by review-loop length") that re-frames everything the learner has built so far. The new `[case:good]` "The regulator framework that already covers this" (F3, just landed) — SR 11-7 + Interagency TPRM Guidance + OCC Bulletin 2023-17 + AIEOG Lexicon — is the institutional grounding that lifts the lesson from product to consulting material. This is what "newspaper bones, software polish" looks like at peak. — S.L.

M5.4 carries the new blast-radius matrix (F5, just landed), and it is the design artefact of the course. We rendered it in the m5.4 body_md preview earlier: four rows × five columns, mono in the headers, sentence-case in the cells, tabular structure throughout. **It works because it is the highest data-ink ratio surface on the site** — every cell carries information; nothing is decorative. Tufte would mark this as the model. Two refinements:

1. The blast-radius column ("Lowest blast … Highest blast radius") is doing the load-bearing classification but it's buried in the right-most "IT-handoff line" cell. **Promote it to its own column with a tinted swatch** (low = `--ledger-accent-soft`, med = `--ledger-warn`, high = `--ledger-weak` at 6–12% tint). One isolated colour signal across four rows is exactly the Schmidt-von Restorff move for a comparison table.
2. The footer `[warn]` (TPRM ping to IT before non-synthetic data) belongs *inside* the table as a fifth row that says "Any of the above" rather than as a paragraph below it. Right now the warning floats; it should anchor.

The matrix in current shipped state is already a B+. Those two moves make it an A. — S.L.

M5.4 is also the lesson where the course's ADDIE method shows its seams most clearly. The lesson currently asks the learner to (a) pick a tool, (b) paste a PRD as prompt, (c) iterate, (d) bring back a URL — across **15 stated minutes** + the honest "next hour or two outside this course." That hour-or-two outside the course is the single most important learning event in the whole programme: it is where transfer happens (Gagné event 9), where the practice becomes a practice, where the title "Turning Bankers into Builders" earns. **And the course currently has no mechanism for closing that loop.** No prompt to return after the build. No structured reflection slot. No "what surprised you" capture. The PrototypeLauncher does ask the learner to save a URL + description (we read `PrototypeLauncher.tsx` lines 113–290) and that's exactly the right hook — but the description prompt is "Who uses it, what it produces, why it matters" (line 261). Add a fourth field: **"What surprised you about the build."** That's the metacognitive prompt that makes transfer durable (Bjork's *desirable difficulty*). — M.W.

M5.5's closing artifact list — "Data Discipline Card, AI Toolkit Map, First Conversation, Starter Prompt Pack, three saved Skills in your Toolbox (M4.2–M4.4), Problem Backlog, PRD, prototype URL" (F11 confirmed the Workbench Pack ghost is gone) — is the strongest single sentence in the entire course. It is the answer to "what did I get for $295." Pair 1 named it as the verbatim post-purchase email line. We agree, and add: it is also the right closing copy for the certificate-equivalent moment (the "no credential in v1" decision per CLAUDE.md branch-scoped note means there is no certificate; but the artifact list IS the credential, displayed as an inventory). Make the Toolbox dashboard land on this list as its empty/loading state — eight rows, mono-cap labels, each one filling in as the learner completes the lesson that produces it. That's gamification done in the institutional voice. — S.L.

---

## The 10 interactive exercises — joint verdict table

| Exercise | Lesson | Pedagogical necessity (M.W.) | Visual treatment (S.L.) | Verdict | Top issue |
|---|---|---|---|---|---|
| **OffLimitsSorter** | m0.2 | Necessary — worked-example pattern executed cleanly; Apply-level after a `[case]` pair | Robust — three-category surface with reveal-on-answer; track-aware filter is a quiet win | **Keep** | The reveal feedback is per-item, not pattern-level. Add a closing summary card naming the items that caught most learners. |
| **Tool landscape sortable matrix** | m1.2 | Necessary in principle, mis-executed — schema-before-do violation (Pair 1 P1.1 cousin); the matrix is both the lesson AND the check | Thin — described in copy ("the sortable matrix is the screen") but no worked example before the sort | **Polish** | Pre-sort one card. One-line seed-data change. Pair 1 named it; we second it. |
| **Sandbox (single)** | m2.3 | Necessary — first model contact, *guided observation* scaffold | Robust — sandbox surface dominates; PII scanner (post-F18) is honest about what it catches | **Polish** | Add the three observation prompts (length / shape / asks-back). Promote the post-F18 PII honesty into the persistent UI, not just the lesson body. |
| **Worksheet (Where AI fits)** | m2.4 | Necessary — *artifact-not-wish* discipline; threshold-to-save is arbitrary at "5 of 7 fields" | Thin — described, not specified; the personal-floor field is the lesson's emotional centre and the UI treatment is unknown | **Polish** | Make save-trigger structural (all rule fields + personal floor), not field-count. Surface the personal floor as a `[save]`-style tape strip, not a generic text input. |
| **Sandbox (A/B)** | m3.2 | Cognitive-load offender (Pair 1 P1.1, CRITICAL) | Sandbox + side-by-side + diff-highlight = 3 visual layers; the diff is clever but adds extraneous load | **Rebuild** | Split into two screens OR kill the diff highlight and run levers sequentially. Pair 1 already named the surgical fix. From the design side: lift the "audience → length → source" schema into a sticky three-step ribbon above the sandbox; the spine should not live inside a SCRIPT block. |
| **SpotTheViolation** | m3.4 | Necessary — spaced retrieval; calibration over speed | Thin — **binary choices in the data model, but the lesson copy promises three-way "violation / clean / borderline"** | **Rebuild (small)** | Either align lesson copy to the binary build (cheaper) or expand to three-option scenarios (more honest). Current state violates alignment triangle (Wiggins). The 12-scenario count should also drop to 9 (Pair 1 already named). |
| **Sandbox (Pack builder)** | m3.5 | Necessary — the conversion finale; produces the Starter Prompt Pack | Robust on paper — three sandbox runs, save-to-Pack sidebar, gate handoff card | **Polish** | Honest timing (now 25 min, F7 landed). Drop the "fourth time-permitting prompt" tip (P1, surfaces wrong direction). The new `[case:bad]` department worst-cases (F19) is the right closing beat — keep its position BELOW the third save, BEFORE the gate CTA. |
| **SkillBuilder** | m4.2 / m4.3 | Necessary — anatomy of a skill is the M4 thesis; the builder IS the lesson | Robust — four-step Source · Lock · Name · Save indicator; track-default pre-load on m4.3 | **Polish** | Make the four-step ribbon sticky on scroll. Promote the post-F18 PII disclosure into the persistent UI (Pair 1 named once-per-lesson; we second). Strip the "Toolbox tracks which defaults get swapped most" line (product telemetry leaking into learner-facing copy). |
| **SkillTester / guardrail-check** | m4.4 | Necessary — four-question self-assessment is Black & Wiliam-grade formative work | Robust — the "verified" badge is the course's only earned credential and earned at lesson scope (correct decision) | **Keep** | Lift the four guardrail questions into a `[save]` block in the body too, so the screenshot makes the practice portable. |
| **ProblemFrame** | m5.2 | Necessary — five-question worksheet seeds the PRD; the *desired-result* tier of backward design | Thin from current source — 189 lines suggests a relatively simple worksheet; needs review | **Polish** | Drop "three filled frames" to two (Pair 1 named). Promote "solution-language frames cannot be PRD'd" from `[warn]` to `[save]`. |
| **PRDBuilder** | m5.3 | Necessary — the institutional artefact; backward-design's *evidence tier* made concrete | Thin from current source — 191 lines for a nine-section PRD form suggests minimal scaffolding | **Polish** | The nine-section structure should render as a visible *table of contents* sidebar with completion ticks, not just a long form. Pair 1 named the timing fix (30 min now per F7). |
| **PrototypeLauncher** | m5.4 | Necessary — the artifact handoff; bridge from course to practice | Robust — four tool cards with `Open` link-outs + save form with URL validation + PII detection | **Polish** | Add a fourth field to the save form: "What surprised you about the build" (metacognitive prompt, Bjork). The blast-radius matrix above the launcher does the heaviest design work in the course; the launcher should inherit that visual weight rather than reverting to plain card grid. Tint the four tool cards by blast-radius (low / med / high) to inherit the matrix's signalling. |

(Eleven entries because the brief said ~10 and m1.2's sortable matrix + m3.5's pack-builder sandbox both deserve their own row.)

---

## Cross-cutting findings — design (S.L. lead)

**F-pattern anchors are inconsistent.** Every lesson should open with the same three-element ribbon: kicker (mono caps), title (Newsreader display), `[stat]` card (numeral lead). Right now m0.1, m1.1, m1.4, m2.1, m2.2, m3.1, m4.1, m5.1 all open with a `[stat]` block — that's the model. M0.2, m1.2, m1.3, m2.3, m2.4, m3.2, m3.3, m3.4, m3.5, m4.2, m4.3, m4.4, m5.2, m5.3, m5.4, m5.5 do not. **Standardise the `[stat]` block as a structural opening element**, not an editorial flourish. The renderer (`LessonBody.tsx` lines 81–93) already has the data shape (`value | source | takeaway`). Make it required.

**`[save]` is the most under-used callout type.** Five callout kinds (`tip | warn | save | field`) and only `save` (the ink-bordered, gold-tape `--ledger-tape` background) is screenshot-shaped. It is the only callout the learner will photograph. Currently `[save]` appears in approximately four lessons across 24. **One `[save]` per lesson, top-positioned, load-bearing sentence inside.** The fix is content, not code.

**The `[case:good]` / `[case:bad]` contrast is doing the heaviest editorial work and is visually under-articulated.** Both render at the same border weight (ink for good, oxblood for bad per the callout meta in lines 115–120). The oxblood is the von Restorff signal — but the bad cards are scarce and clustered (m0.2, m3.5, m5.1). When a `[case:bad]` lands, it should land *hard* — wider, taller, possibly bleed past the prose column rule. Right now they're whisper-loud where they should be ledger-bold.

**Tables are the course's untapped primary visual organ.** M5.4's blast-radius matrix is the model. M2.2's four tool families, M3.3's five patterns, M4.4's four guardrail questions, M5.3's nine PRD sections — every one of these wants a table and currently renders as a card stack or a list. Tufte's data-ink rule applies: when four+ parallel items each carry three+ shared attributes, render a table. The card-grid is for two-to-four items with narrative bodies; the table is for n items with comparable fields.

**The Ledger palette discipline is excellent and the gold restraint is rare.** `--ledger-accent` `#7C5814` (the darkened post-2026-05-21 gold) is used as emphasis only — never decoration, per CLAUDE.md design rule. We confirmed it in the GateScreen kicker, the `[stat]` numerals, the `[save]` border, and the m5.4 launcher selection state. **No design finding here, just record:** this is the rarest thing a SaaS-aesthetic product gets right and the course gets right.

**One typography finding:** the `[case:good]` titles render at the same scale as the body paragraph leads. Modular scale wants a step: if body is 1.0625rem with 1.75 leading, the case title should be 1.25rem (1.2× step on a minor-third scale) with 1.35 leading. Currently they read as bolded body, not as a header. The eye glides past.

— S.L.

---

## Cross-cutting findings — curriculum (M.W. lead)

**Enabling objectives are still missing.** Pair 1 named this (P1.2); I confirm and elevate. Wiggins/McTighe's backward design demands `objective → evidence → activity` in that order. The course has the evidence (KCs, interactives) and the activity (body content); it does not yet have the objective stated. Without it, the alignment triangle has no apex. **One line under the H1, every lesson, Bloom verbs.** Cost: 24 lines of writing across the seed bodies.

**The 55 knowledge checks have a Bloom-distribution problem.** Pair 1 named the ~75% Remember/Understand skew. From the bank we read (40+ checks across 24 lessons): the Apply/Analyze examples are m0.2/Q3 (conditional knowledge — true with caveat), m1.4/Q2 (verify citation against source — Apply), m1.4/Q3 (the generalised pattern — Analyze), m3.1/Q2 (longer prompts always better? Analyze), m3.4/Q1 + Q2 (calibration — Analyze), m4.1/Q2 (locked vs slot — Apply), m4.2/Q1 (lever behaviour at runtime — Apply), m4.3/Q1 (override defaults — Apply), m4.4/Q3 (refine the locked tone — Apply), m5.2/Q1 (which question prevents wrong-thing-built — Analyze), m5.3/Q2 (measurable success criterion — Analyze). That's ~11 Apply/Analyze items in 40+ checks. Target is 50/50. **The lift is rewriting ~10 Remember items into Apply scenarios** — present a hypothetical and ask the learner to act, rather than ask them to recall the abstraction.

**Gagné's Nine Events are mostly present but unevenly sequenced.** Per lesson, the typical pattern is:
- Event 1 (gain attention) — opening lede sentence. ✓
- Event 2 (state objectives) — missing per P1.2.
- Event 3 (recall prior) — implicit; M3.1 explicitly recalls M0's data rule, M4.1 explicitly recalls M3.1's four-part brief. Otherwise implicit.
- Event 4 (present content) — body. ✓
- Event 5 (guide learning) — `[tip]` callouts; uneven. Strong in M3.1, weak in M3.2.
- Event 6 (elicit performance) — interactive or KC. ✓ where present.
- Event 7 (provide feedback) — KC explanations are well-written, instructor-grade. ✓
- Event 8 (assess performance) — KCs do the work. ✓
- Event 9 (enhance retention and transfer) — **systematically missing**. The closing `[case:good]` is the closest the course gets; few lessons explicitly name "here is how this carries into next week."

**Spaced retrieval is happening twice (Pair 1 named).** I add: the M3.4 violation drill is a *perfect* opportunity to spiral M0.2's rule, M1.1's hallucination property, M1.4's invented-citation pattern, M2.3's PII honesty, and M3.3's chain-of-thought preamble warning into one consolidated retrieval surface. Currently the 12 scenarios test data discipline only. **One scenario per spiral target = a five-scenario set that retrieves M0–M3 in one sitting.** That's the kind of retrieval-practice design Bjork's work mandates.

**The M4 → M5 transition is the steepest in the course (Pair 1 F4 deferred).** M4 ends with "two clean runs is the bar; perfection is a trap." M5.1 opens with "Assistant → Skill → Agent by review-loop length." That's not a step; that's a re-framing of everything M4 built. The fix is either (a) a 5-minute transitional lesson (M4.5 or M5.0) that *names* what just happened ("you built three skills; in M5 you stop building skills and start building things skills are part of"), or (b) a sentence at the head of M5.1 that does the same work. Cost: low. Impact: high.

**The five-track branching pattern is a strong design decision under-delivered in content.** Leadership track is thin; technical track is presumably thinner; back-office and customer-facing are partially covered. M4.3 is the right place to invest the next round of variant content (it's where the branching pays the rent, per the module-by-module above). **Defer broad leadership-track content; deepen the four branched lessons completely first.**

— M.W.

---

## Top 10 issues, severity-ranked

1. **M3.2 cognitive overload (Pair 1 P1.1).** CRITICAL. Six constructs, no `[stat]` spine, no progressive disclosure.
2. **No enabling objectives anywhere in body_md (Pair 1 P1.2).** HIGH. Alignment triangle missing its apex.
3. **SpotTheViolation copy/build mismatch.** HIGH. Lesson copy promises three-way calibration; component delivers binary. Wiggins alignment violation.
4. **Gate page presents three radically different cost shapes as visually equivalent (Pair 1 P1.3 cousin).** HIGH. Hick/Nielsen #2.
5. **M3.5 and M5.3 under-timed by ~2× (Pair 1 P1.4; F7 landed for M3.5 honesty, M5.3 now labelled 30m — partly fixed).** HIGH. Re-verify after F7 rolls through all surfaces.
6. **KCs skew Remember/Understand; Apply/Analyze under-represented (Pair 1 P1.5).** HIGH.
7. **Gagné event 9 (retention/transfer) systematically missing.** HIGH. No mechanism to close the practice loop after a lesson.
8. **M5.4 build-loop has no metacognitive return prompt.** MEDIUM. PrototypeLauncher captures URL + description but not "what surprised you." Transfer is the whole point of the lesson.
9. **`[save]` callout under-used; load-bearing sentences buried in `[warn]` and prose.** MEDIUM. One `[save]` per lesson, top-positioned, screenshot-shaped.
10. **Tables under-used; card-grids over-used for n>4 parallel items.** MEDIUM. Tufte data-ink. M5.4 matrix is the model; M2.2, M3.3, M4.4, M5.3 want comparable treatment.

---

## Top 10 opportunities (priority + effort)

| # | Move | Priority | Effort |
|---|---|---|---|
| 1 | Add one-line `## Objective` under every H1, Bloom verbs. | HIGH | 1–2 hrs (24 lines) |
| 2 | Sticky four-step ribbon on SkillBuilder; lift M3.2's three-lever schema into a sticky three-step ribbon. | HIGH | 1 day (component edit + CSS) |
| 3 | Make `[stat]` block the required opening element for every lesson. | HIGH | 2 hrs (content) + 1 hr (renderer enforcement) |
| 4 | Rewrite ~10 Remember-level KCs into Apply scenarios. | HIGH | 1 day |
| 5 | Tighten M3.2 per Pair 1 P1.1 — split or kill diff highlight. | CRITICAL | 1–2 days |
| 6 | Align SpotTheViolation copy ↔ build (binary OR three-way; pick one). | HIGH | 0.5 day if copy fix; 2 days if rebuild |
| 7 | Promote five tables (M5.4 model already exists): M2.2 families, M3.3 patterns, M4.4 guardrail, M5.3 PRD sections, M3.4 spiral-retrieval set. | MEDIUM | 1 day per table |
| 8 | Add "What surprised you about the build" field to PrototypeLauncher. | LOW-MEDIUM | 1 hr |
| 9 | Reset gate-page visual hierarchy: primary CTA (pay), soft secondary (email-to-keep), tertiary card *below* (assessment). | MEDIUM | 1 day |
| 10 | Build a five-scenario spiral-retrieval set inside M3.4 that re-surfaces M0.2 rule + M1.1 hallucination + M1.4 invented-citation + M2.3 PII + M3.3 chain-of-thought preamble. | MEDIUM | 1 day (scenario writing) |

---

## Verdict

The Foundation Course is **a serious piece of editorial work on a course chassis that is now almost ready to support it**. The Round-1 fixes (sandbox lockdown, regulator thread, blast-radius matrix, honest timing, verification discipline) closed the institutional-credibility gaps. The Pair 1 fixes-in-flight (gate foreshadowing, M3.5 and M5.3 timing) close the experience-side surprises. What remains is structural and surgical:

- **Make the alignment triangle visible** (enabling objectives → KC Bloom-balance → activity rubric).
- **Make the F-pattern anchor reliable** (`[stat]` as required opening element, `[save]` as required closing element).
- **Make the table the primary visual organ for parallel structure** (M5.4's matrix is the model).
- **Close Gagné's loop on every lesson** (event 9 retention/transfer — one closing sentence per lesson, named explicitly).
- **Close the build-loop on M5.4** (metacognitive return prompt).

The course's voice is genuinely a competitive asset. Newspaper bones, software polish, dry where the field is exclaiming. **Do not flatten it for pedagogical orthodoxy.** Add the objectives in the same voice. Tint the tables in the same restraint. Let `[save]` carry the load-bearing sentences with the same screenshot-shape. The work is editorial polish on a near-complete frame — not a structural rebuild.

If we had to name one single intervention, it would be the same one Pair 1 named first: **fix M3.2** (the cognitive-load offender at the conversion-finale's doorstep). Everything else in this critique is improvement; M3.2 is the only finding where the current state may actively cost the course its readers.

— S.L. · M.W.
