# Foundation Course — Pair 1 Critique
## UX cognitive-load × Instructional Design

**Pair:** Aanya Khanna (UX, ex-NN/g) · Dr. Reuben Adelaja (ID, EdD Adult Learning)
**Reviewed:** all 24 lessons + gate · 2026-05-24
**Anchored on current state:** post-F1/F18 fixes (sandbox lockdown + PII scanner + corrected M2.3/M4.2 [warn] copy)

---

## Headline (3 bullets — joint)

- **The course is strong on voice and discipline; it is structurally weak on _evidence of learning_.** Every lesson states a takeaway but very few state an **enabling objective** in Bloom-aligned verbs before the body opens. Knowledge checks are well-written but average two per lesson and skew to *Remember/Understand*; nothing inside lessons checks *Apply* or *Analyze* before the takeaway artifact is offered. Backward design (Wiggins/McTighe) is half-built: desired result and learning experience are present; the *evidence* tier is thin.
- **Cognitive load is well-managed in the early modules and over-loaded at two specific seams: M1.2 and M3.2.** Both pack three-to-four new constructs onto a single screen with no progressive disclosure. Mobile readers will splinter. M3.2 is the more dangerous of the two because it is also the first sandbox where the learner is asked to *notice* — and noticing is impossible at working-memory capacity.
- **The course's biggest unstated risk is at the M3.5 → gate seam.** Twelve free lessons of warm, calm, "we'd rather just tell you" voice meet a three-way fork (Pay / Email / Decline) inside a single dense card. By Nielsen #1 (visibility of system status) and Hick's law, the gate currently presents itself as a decision point when it has actually been a *reveal* — the learner did not know the gate existed until they hit it. The M0.1 copy mentions the gate but does not foreshadow its shape.

---

## Module-by-module audit

### M0 Orientation

| Lesson | Stated time | Honest time-on-task | Objective stated? | Objective met? | Top friction |
|---|---|---|---|---|---|
| m0.1 *How this course works + your Toolbox* | 7m | 5–6m | Implicit ("by the end you will have built something useful") | Yes, as an *expectation*, not an objective | TrackPicker decision Hick'd against five unknown labels |
| m0.2 *The one rule that matters: data discipline* | 8m | 8–10m | Implicit ("never put customer data into an AI tool") | Yes — the [save] line carries it | The sorter is the lesson; learner cannot tell if they're learning or being assessed |

**— R.A.** M0.1 sets a contract — "From 'I've heard of it' → 'I built it.'" That is a brilliant outcome statement and the strongest single line in the course; it doubles as the *enduring understanding* in Wiggins/McTighe terms. But there is no enabling objective stated for the lesson itself. Knowles' andragogy demands a *reason* up front; m0.1 gives the reason in performative form ("six modules, twenty-four lessons") rather than learning terms ("by the end of this lesson you will be able to…"). For an adult learner doing this between meetings, the implicit shape is enough — but the TrackPicker step is a Bloom *Apply* task (pick the track closest to your day) gated only by curiosity, not by criteria. Add one line under each track: "Pick this if your week looks like X." That converts a Hick's-law five-way fork into an information-scent decision (Pirolli).

**— A.K.** The TrackPicker is the highest-risk affordance on m0.1 and the course never tells me how reversible it is until I'm three lessons in. Nielsen #3 (user control and freedom) and #6 (recognition over recall) both push the same fix: a tiny "you can change this any time in settings" hint *under* the chooser, not in a [tip] callout above it. The [stat] card "6 · 24 · <15m" is a clean F-pattern hit — three numbers across the top of the page, the reader's eye lands on shape-of-the-course before any prose. Keep it.

**M0.2** is the course's emotional centre and it lands. The side-by-side `[case:good]`/`[case:bad]` pair on "Jane Doe, account 4471, balance twelve hundred" versus "a customer is upset about an overdraft fee" is a textbook worked-example pair — Sweller would frame this as the canonical *worked example before problem* sequence, and the lesson honours it. The post-F18 [warn] copy is now honest: the regex catches formatted SSNs, dashed/spaced account runs, Luhn-valid PANs, emails, phones, DOB-in-context; it does **not** catch names. Good — but the copy lives 200 words after the rule, which means a learner who skims the body and goes straight to the sorter never reads the limit. **Promote the limit into the [save] block or directly under the rule.** — R.A.

The knowledge check at m0.2/Q3 is the single best item in the bank: "True or false: this course's sandbox will stop you from pasting an account number" with the *correct* answer being "True — but real tools will not, so the habit is yours." That is *Conditional* knowledge (when/why) — Bloom's *Analyze* level. Most of the other checks are *Remember*. Build more of these. — R.A.

---

### M1 What gen AI is

| Lesson | Stated time | Honest time-on-task | Objective stated? | Objective met? | Top friction |
|---|---|---|---|---|---|
| m1.1 *What it actually is (and isn't)* | 10m | 8m | Implicit ("predictive token engine + 3 properties") | Yes, mostly | "Predictive token engine" lands cold without prior-experience anchor |
| m1.2 *Tool landscape: assistants vs. builders* | 12m | 14–18m | None visible | Partial | Sortable matrix is the lesson AND the assessment; no worked example first |
| m1.3 *Why this matters for your role* | 8m | 8m | None visible (audio) | Cannot judge without listening | Audio lesson reviewed by transcript only |
| m1.4 *Good vs. bad use in a bank* | 9m | 10–12m | Implicit ("the pattern that separates good from bad") | Yes | Five examples land as a list; pattern card at close arrives too late |

**— R.A.** M1.1's framing — "predictive token engine. Pattern-completion at scale" — is technically correct and editorially crisp, but it violates Knowles' *prior-experience anchor* principle. Bankers do not have a prior experience with "predictive token engines"; they have a prior experience with autocomplete and with the spell-check that gets things wrong with confidence. The lesson uses neither analogy. Add one anchor: *"Think of it as the autocomplete on your phone, but trained on every book and webpage. It is exquisite at the next word and innocent of whether the sentence is true."* That sentence costs you nothing and unlocks the three-properties card. The three properties (training cutoff · no live knowledge · hallucination as a property) are a worked-example trio — Mayer's *signaling principle* applies and the production direction nails it (three labelled columns).

**— A.K.** M1.2 is where the experience starts to wobble. The body says "the sortable matrix is the screen. No video." That's a sound decision (Nielsen #6 recognition over recall — read the verb, sort the tool). But the matrix is *also* the only check for understanding; there is no worked example first. Cognitive Load Theory predicts that novices forced to *do* before they have a *schema* over-rely on extraneous load (the visual sort) at the expense of germane load (the actual assistant-vs-builder distinction). Show me one sorted card *before* I sort the other eleven. The vendor-pricing [tip] is gold — "the verbs there give the bucket away faster than any review" — but it's buried.

The lesson's knowledge check Q2 — *"the vertical axis (free tier ↔ paid tier) is informational only — useful context, but not part of the right-or-wrong sort"* — is a meta-question about the UI. That belongs in onboarding, not in a content check. Replace it with an Apply-level item: present a hypothetical new product, ask the learner to sort it. — R.A.

**M1.3** is the course's structural risk and the part we cannot fully audit. It is an 8-minute audio with no scripted body and the body_md is essentially scaffolding. A blind learner, or one in an open-plan branch on a Tuesday, will skip it. **The transcript toggle has to be visible by default, not behind a click** (Mayer's modality principle is being weaponised against accessibility here — the same content should be available in both channels). For the WCAG 2.1 AA requirement, the transcript needs to be a *transcript*, not a synopsis. — A.K.

**M1.4** does what it sets out to do, and the FDIC efficiency-ratio [stat] (~65% community-bank median vs 55.7% industry-wide) is the right kind of citation hook. The pattern is buried, though: the closing line "good uses bring public or anonymised material… bad uses send the model sensitive material or trust it to remember facts it never had" is the actual takeaway. Lift it. Move it into a closing `[save]` card so it screenshots. The five examples should *converge* on that pattern visually, not narratively. — R.A.

---

### M2 Access & workflow

| Lesson | Stated time | Honest time-on-task | Objective stated? | Objective met? | Top friction |
|---|---|---|---|---|---|
| m2.1 *Getting access* | 10m | 6–8m | None visible | Partially | "Three judgement calls" framing is good but unevenly returned to |
| m2.2 *What each tool is for* | 12m | 12–14m | Implicit (four families) | Yes | Four cards in 3-up grid → fourth wraps awkwardly on mobile (per production note) |
| m2.3 *Your first conversation* | 15m | 18–22m | Implicit ("first contact, save the response") | Yes | This is the riskiest sandbox; "read slowly" is anti-action and might disengage |
| m2.4 *Where AI fits in your week* | 10m | 12–15m | Implicit ("three rules for filling honestly") | Yes | Worksheet UX not described; "five of seven fields" trigger for save is arbitrary |

**— A.K.** M2.1 is a 10-minute lesson that reads in five. That is fine if the visuals carry the rest, but the SCRIPT is doing 80% of the work. The "three judgement calls" framing in the [stat] card is the cleanest piece of information scent in the module: numeric, scoped, names the moves before they're explained (Pirolli, page-side). Keep it.

The [warn] on m2.1 — "the SSO button is the biggest tripwire" — is the highest-leverage sentence in the lesson and it is in the *last* card. F-pattern reading puts it below the fold for a learner who skims. **Move it up.** — A.K.

**— R.A.** M2.2 has the right intent (four families with a verb test) and the wrong cognitive load. The lesson asks the learner to hold four parallel categories *with two example tools each and a one-line best-fit task each* — that is 12 items in working memory for someone who learned the assistant/builder split 30 minutes ago. Miller's 7±2 is the *upper* bound, not the target. **Split this lesson, or reduce it to two families now (Thinking partner + Research assistant) and defer Construction crew + Embedded copilot to M2.3's narration.** This is the worked-example effect in reverse: by piling four examples on, you've converted the schema-build into a memorisation drill.

**M2.3** is the first place the sandbox is the lesson, and the SCRIPT openly acknowledges it: "the sandbox surface is the screen." The instruction "read the first response slowly" is an *invitation to germane load* and it is the right invitation — Black & Wiliam's formative-assessment work calls this *metacognitive prompting*. But the prompt is one line, in a `[case:good]` card, with no scaffolding for what to look for. **Give the learner three observation prompts** ("Length? Shape — paragraphs or bullets? Does it ask you a question back?"). That converts a vague instruction into a worked observation routine. The post-F18 [warn] copy ("the sandbox catches the shapes the screen can see — formatted SSNs, 8–12-digit runs, Luhn-valid PANs, emails, phones, DOB-in-context. It does **not** detect names or free-text descriptions of real members") is now accurate and the parenthetical "(outside this course, no public tool catches even what this one does)" is the right humility note. Keep it. — R.A.

**M2.4** has the course's most useful field — "name the line you will not cross. The last field is yours, not ours." That is Self-Determination Theory's *autonomy* principle in one sentence. The worksheet itself is described as "five of seven fields have any content" triggering the save; that threshold is arbitrary and undermines the *artifact-not-wish* discipline the lesson preaches. **Make the save trigger structural** ("all five rule fields filled, plus the personal floor") — otherwise the worksheet teaches that 71% is the bar. — R.A.

---

### M3 Prompting

| Lesson | Stated time | Honest time-on-task | Objective stated? | Objective met? | Top friction |
|---|---|---|---|---|---|
| m3.1 *Anatomy of a prompt* | 12m | 10m | Implicit (Role · Task · Context · Format) | Yes — strongest in the module | Side example panel must update in real time or the lesson fails |
| m3.2 *How output changes — same task, different brief* | 15m | 22–30m | Implicit ("three runs to build intuition") | Partially | Three runs × two-to-three columns each = 6–9 outputs to read in 15 min |
| m3.3 *Patterns: five prompt shapes that earn their keep* | 12m | 18–22m | Implicit (5 patterns) | Yes, on a re-read | Reading lesson with five sub-patterns; serial-position effect punishes pattern 3 (chain-of-thought) |
| m3.4 *Banking no-nos: spot the violation* | 12m | 12–15m | Implicit (calibrate violation/clean/borderline) | Yes | 12 scenarios is one too many for one sitting; engagement curve dips around #8 |
| m3.5 *Real use cases: build your Starter Prompt Pack* | 15m | 25–40m | Implicit ("three honest tasks → three working prompts") | Yes if the learner has 40 min | This is the conversion finale and it is wildly under-timed |

**— R.A.** **M3.1 is the course's pedagogical high point.** The four-part brief (Role · Task · Context · Format) is the right mental model, the side example panel accumulating into a complete prompt as the narrator works through it is *signaling-plus-contiguity* (Mayer principles 4 and 7) executed correctly, and the closing mnemonic is repeated three times by design. This is the lesson Module 4 is built on. If anything, *strengthen* the closing knowledge check — m3.1/Q2 ("longer prompts are always better" — false; relevance beats volume) is excellent; add a third Apply-level item asking the learner to take a one-liner and rewrite it as a four-part brief.

**— A.K.** **M3.2 is the course's worst cognitive-load offender.** The lesson stacks: (a) the audience-swap lever, (b) the length-sweep lever, (c) the source-swap lever, (d) a side-by-side diff-highlight UI, (e) a slot-machine `[warn]` that is itself a sophisticated meta-lesson about overfit, (f) the instruction not to save anything (because saves are 3.5) — six new constructs in 15 minutes. Cognitive Load Theory predicts working-memory overflow for the target reader; this lesson should be split into two screens or sequence the levers with progressive disclosure (lever 1 → check → lever 2 → check → lever 3 → check). The diff-highlight is potentially the cleverest UI in the course but it is also the highest-extraneous-load element — if the lesson is over budget, kill the diff and let the learner read the two outputs side by side. Recognition over recall (Nielsen #6) gets you 80% of the value.

**M3.3** is a reading lesson with five patterns. Serial-position effect (primacy + recency) means patterns 1 and 5 will be remembered; patterns 2, 3, 4 will blur. The course's own structure shows it knows this: Pattern 1 (Role + Task + Format) is the default, Pattern 5 (Ask for what is missing) is the recovery move. **Treat patterns 2, 3, 4 as a sub-section** — give them a single shared frame ("three sharpening moves") and number them within it. Otherwise the cheat-sheet at the end of the lesson is doing the schema-building the body should have done. — R.A.

The [warn] on m3.3 — "chain-of-thought makes the model preamble. Want only the answer? 'Walk through reasoning, then output only the final answer marked with a heading.'" — is technically the most useful sentence in the lesson because it is also a *pattern combination*. It belongs in the running text under Pattern 3, not as an afterthought. — R.A.

**— A.K.** **M3.4** is the spaced-retrieval moment (Roediger) that the course needs more of. Twelve scenarios is one too many — the engagement curve will dip around scenario 8 and the learner will start clicking faster. **Cut to nine, group as three sets of three** (one set for PII; one for confidential vendor material; one for MNPI-but-PII-clean cases — the [warn] on this lesson is precisely about that third case but the scenarios don't necessarily exercise it). The "screenshot the two hardest scenarios" [tip] is a thoughtful piece of metacognitive prompting; tell the learner *which* mode of difficulty matters (the ones that almost fooled you) and you've taught calibration in one line.

**— Joint** **M3.5 is the conversion finale and it is structurally under-timed.** The SCRIPT asks the learner to: pick three real recurring tasks; draft each using the four-part brief PLUS one of five patterns from M3.3; run each in the sandbox; edit until the output is something they would actually send; save each as a row with a use-line and a screenshot — all in 15 minutes. Realistic time-on-task is 25–40 minutes. The slot machine is not the risk here; *abandonment* is. The lesson knows this — the closing CTA replaces the lesson nav with a single button to the gate — but the slope into the gate is steep and the learner is most likely to leave mid-prompt-three. **Either drop the bar to two prompts, or make the third prompt a stretch ("time permitting…").** The [tip] already suggests a fourth "time permitting" prompt — that's the wrong direction. Move the time-permitting to the third prompt; make the first two the bar.

---

### Gate

Stated time: not visible. Honest time: 90s of reading + decision.

**— A.K.** The gate page reads as a single screen with three side-by-side options under three identical H2s ("Foundation Course" / "Keep what you built" / "Find out where you stand"). Hick's law says three options is the sweet spot; Fitts's law says the tap targets are large enough on desktop and should be tested on mobile. Two problems:

1. **The three options are not parallel decisions.** "Pay for M4–M5" is a $295 commitment; "Email to keep what you built" is a 10-second action; "Take the Readiness Assessment" is a $99 second purchase the learner had no reason to know about. Presenting them as visually equivalent violates Nielsen #2 (match between system and real world) — the choices have radically different *cost shapes*. The right pattern is a primary CTA (pay) with email-to-keep as a soft secondary and the assessment as a sibling card *below*, not beside.
2. **There is no "I'm not sure yet, save my place" affordance.** The m0.1 promise was "nothing saves anonymously." That is honest; it also means a learner who needs 24 hours to decide loses everything. The email-to-keep box *is* the save-my-place affordance — but the H2 above it ("Keep what you built") frames it as the *consolation* prize, not the *pause* prize. Rewrite as "Save your Toolbox while you decide." — A.K.

**— R.A.** Pedagogically, the gate is the right place for it. M3.5 produced a Starter Prompt Pack the learner can take home; M4 is where the work becomes *building* rather than *using*. That is a real shift in cognitive demand (assistance → automation), and a financial-commitment gate maps to a learning-commitment gate. But the m0.1 contract said "after M3 there is a gate. M4–5 paid (learn to *build*)." That foreshadowing is one sentence in a 5-minute lesson. **Repeat it at the end of M2 and again at the end of M3.4.** Knowles' adult learners forgive paywalls; they punish surprises.

---

### M4 Skills (paid)

| Lesson | Stated time | Honest time-on-task | Objective stated? | Objective met? | Top friction |
|---|---|---|---|---|---|
| m4.1 *What a skill is* | 10m | 6–8m | Implicit (anatomy: locked + slots) | Yes | The strongest M4 lesson — light, schema-building, no UI |
| m4.2 *Build your first skill* | 15m | 18–25m | Implicit (Source · Lock · Name · Save) | Yes | The PII [warn] is now accurate; the Skill Builder UI bears the load |
| m4.3 *Build a skill for your role* | 15m | 15–22m | Implicit (trust pre-load · tune · save Working Skill) | Yes | Branched lesson; defaults must actually fit; the "track default" badge is critical |
| m4.4 *Test, refine, guardrail-check* | 12m | 18–25m | Implicit (three moves: run, check, refine) | Yes | The "verified" badge is the right design pattern — it earns trust |

**— R.A.** M4.1 is the second pedagogical high point. The two-part anatomy (locked choices + input slots) is a clean Bruner scaffold — the learner already knows what a prompt is from M3.1, and a skill is *that, but with the choices frozen*. The bounded-scope `[case:good]` ("a skill does not chain, browse, or read your inbox") is doing real boundary-work and pre-empting agent confusion that M5 will need to dispel. **This is where the course earns the gate.** Add an enabling objective at the top — "By the end of this lesson you can: describe the two parts of a skill; explain why bounded scope is the feature, not the limitation" — and m4.1 becomes a model lesson.

**— A.K.** M4.2 makes the Skill Builder the screen. The four-step indicator across the top is the right pattern (Nielsen #1 visibility of system status; #6 recognition over recall — the learner sees their progress without remembering it). The save-button-highlights-when-complete pattern is good Fitts's-law affordance work. The post-F18 [warn] on m4.2 is now precise: "formatted SSNs (dashed, spaced, dotted), 8–12-digit account-number runs, Luhn-valid payment-card numbers, emails, phone numbers, and DOB-in-context are rejected before the model sees them. Names, free-text descriptions of real members, and paraphrased SAR content are **not** detected by regex." That is the right disclosure. **Move it into a permanent collapsible disclosure on every skill-builder run** — once per lesson is once per training day; the screen the learner runs the skill on three months later needs the same reminder. Pair with Nielsen #5 (error prevention) on the slot label hint text.

**M4.3** is the second branched lesson and the only one in the paid module. The "track default" badge that the learner can override is the right design — but the body promises the Toolbox "tracks which defaults get swapped most." That is product telemetry, not learner feedback. Cut it from learner-facing copy. — A.K.

**M4.4** is where the course's discipline pays off. The four-question guardrail check ("Does it cite anything outside the slot material? Comfortable sending as-is? Where does it need a human pass? One input pattern that would break it?") is a clean piece of formative assessment — Black & Wiliam-grade *self-assessment with criteria*. The "two clean runs is the bar. Perfection is a trap" line is the kind of permission-giving that adult learners need to hear. The `[warn]` "more than four notes = the skill is trying to do too much. Split it" is a sharp design heuristic the rest of the course could learn from. — R.A.

The "verified" badge is the course's only earned credential — and it is intra-lesson, no certificate, no LinkedIn moment. That is consistent with the branch-scoped "no credential in v1" decision and it is also pedagogically honest: you've verified *your skill*, not *yourself*. Keep it. — R.A.

---

### M5 Prototypes (paid)

| Lesson | Stated time | Honest time-on-task | Objective stated? | Objective met? | Top friction |
|---|---|---|---|---|---|
| m5.1 *What an agent is — honestly* | 12m | 10m | Implicit (three shapes by review-loop length) | Yes | The `[case:bad]` on agents is editorial position not value judgement; some learners will read it as alarmism |
| m5.2 *Framing a problem worth building for* | 12m | 18–22m | Implicit (five questions, one frame) | Yes | Five-question frame × three problems = 15 fields; under-timed |
| m5.3 *Writing a lightweight PRD* | 15m | 25–40m | Implicit (three rules + nine sections) | Partial | Nine PRD sections in 15 minutes is unrealistic |
| m5.4 *Build a prototype* | 15m | 15m in-app + 1–2hr outside | Implicit (pick tool · paste PRD · synthetic only) | Yes | The "build is the next hour or two outside this course" is the most honest line; tag it more prominently |
| m5.5 *Where to go next* | 8m | 6m | Implicit (three things before you close the tab) | Yes | Audio lesson again — same transcript concern as m1.3 |

**— R.A.** M5.1 is the most editorially confident lesson in the course and it pays the rent for the whole module. The three-shapes-by-review-loop-length framing (Assistant → Skill → Agent) is *exactly* the kind of progressive-disclosure schema-building Bruner spent his life arguing for. The `[case:bad]` on agents is structurally honest: it is the only `:bad` card on a *technology category*, and the body justifies it ("today's agents drift, invent plausible-wrong steps, occasionally act outside the loop"). My quibble is small — the production note says the oxblood is "editorial position, not a value judgement on the technology"; tell the learner that. One sentence: *"We mark this oxblood because today's agents aren't yet trustworthy for member-facing flows. The technology will move; the bar won't."*

**M5.2's** five-question frame (Who · What breaks · Current workaround · What good looks like · Why now) is the right tool — Wiggins/McTighe's *desired result + evidence* tier translated for product framing. But asking for *three* filled frames in 12 minutes is mathematically impossible. **Drop to two**; let the third be stretch. The [warn] "solution-language frames cannot be PRD'd" is the most useful single warning in the course and it should be a `[save]` block, not a `[warn]`. — R.A.

**M5.3** is the most under-timed lesson in the module. The body says "Thirty minutes the first time, ten the next" — and then puts a 15-minute timer on the lesson. The honest fix is to relabel the lesson's duration to 30 minutes (you have an overall ≤15-min ceiling per lesson; this one needs a `*` next to it) or to **split into two**: m5.3a writes the goal + non-goals + success criteria (the contract); m5.3b writes the six structural sections. Backward design demands the goal-first sequence and the lesson knows it (the [case:good] says "spend ten minutes on the goal. The other eight sections fall out"). Honour that pacing. — R.A.

**— A.K.** M5.4 is the lesson with the most honest single sentence in the course: *"Fifteen minutes here; the build is the next hour or two outside this course. Bring back a URL."* That sentence does Nielsen #1 (visibility of system status), Knowles (problem-centred adult learning — the build *is* the problem), and Self-Determination Theory's *competence* principle in eighteen words. **Promote it to the lesson kicker.** The four-tool launcher with "match-to-your-PRD" indicators is the right Fitts's-law shape (four large cards, one decision); the risk is that the learner who hasn't completed a real PRD in m5.3 will see four buttons and freeze.

**M5.5** is an audio close — same transcript concern as m1.3 — and the artifact-count card at the end is the best closing in the course: "Data Discipline Card, AI Toolkit Map, First Conversation, Starter Prompt Pack, Workbench Pack, Problem Backlog, PRD, prototype URL. That is not AI literacy. That is a practice." That sentence is the course's earned closing line and it should appear in the post-purchase email verbatim. — A.K.

The [warn] "the fastest way to lose the practice is to wait for permission. Nobody walks up and asks. You start; the conversation about scale comes to you" is a *culture* prescription, not a *content* one — and that's the right move at the end. Adult learners need to know what to do next *outside* the course; m5.5 tells them. — R.A.

---

## Cross-cutting findings

### Content (Reuben lead)

- **Enabling objectives are missing.** (HIGH) — Wiggins/McTighe backward design — Every lesson should open with *"By the end of this lesson you will be able to…"* in Bloom-aligned verbs (describe, distinguish, apply, evaluate). Currently every lesson opens with a lede sentence. Both are valuable; the objective is missing. *Fix: add one line under the H1 in body_md for every lesson.*
- **Knowledge checks under-test Apply and Analyze.** (HIGH) — Bloom alignment — 55 checks across 24 lessons (avg 2.3/lesson). Of the ones I read, ~75% are *Remember/Understand*. m0.2/Q3, m1.4/Q2, m3.3/Q3, m4.4/Q2 are *Apply/Analyze* — those are the ones that *teach* by checking. *Fix: target 50/50 Remember-Understand vs Apply-Analyze; rewrite the meta-UI questions (m1.2/Q2) out of the bank.*
- **Spaced retrieval is happening only twice.** (MEDIUM) — Roediger spaced-retrieval — M2.4's worksheet pulls forward into M3.5; M2.3's First Conversation pulls forward into M3.2's noticing. That's it. Nothing from M0–M1 comes back. *Fix: M3.4 should explicitly re-surface the M0.2 anonymisation move; M4.4's guardrail-check should re-cite the M1.4 invented-citation pattern.*
- **The takeaway-artifact list is over-promised at M5.5.** (LOW) — "Workbench Pack" is named in m5.5's closing but is not produced by any M4 lesson — m4.2 produces a Skill Template, m4.3 a Working Skill, m4.4 verifies. The Workbench Pack appears nowhere else. Either name the M4 collection "Workbench Pack" formally, or rename in m5.5.
- **The voice/branding rule about "users" is mildly violated in M4–M5.** (LOW) — CLAUDE.md banned word — m5.3's PRD section "Users. Who uses this. Same answer as the 'who' in your problem frame." That's a PRD term-of-art, but the course voice prefers "you/people/role." Either keep "Users" (defensible — it's a PRD section header) or rename to "Who it's for" for consistency.

### Experience (Aanya lead)

- **M3.2 cognitive overload.** (CRITICAL) — Sweller / CLT — Six new constructs on one screen with the only formative check being noticing. *Fix: split into 3.2a (audience swap → check) and 3.2b (length sweep + source swap → check). Cut the diff-highlight UI if you must save the budget.*
- **M1.2 schema-before-do violation.** (HIGH) — Worked-example effect — The sortable matrix is both the lesson and the assessment with no worked example. *Fix: pre-sort one card; let the learner sort the rest. That's the worked-example pattern Sweller built his career on.*
- **The gate is a surprise.** (HIGH) — Nielsen #1 visibility of system status — Foreshadowed in m0.1, then silent until m3.5's `[warn]`. *Fix: a thin progress strip at the top of every M2/M3 lesson showing "Free Module N of 3 → Gate → Paid Modules". One UI element, zero copy change.*
- **TrackPicker is the lesson's largest reversible decision and reads as irreversible.** (MEDIUM) — Nielsen #3 user control and freedom — *Fix: "Change any time in settings" as inline text under the chooser, not a [tip] callout.*
- **Audio lessons (m1.3, m5.5) need transcript-by-default.** (MEDIUM) — WCAG 2.1 AA / Mayer modality — Currently the transcript is behind a toggle. For accessibility AND for learners reading at their desk, the transcript should be the default presentation with the audio player above it.
- **[warn] cards bury load-bearing facts.** (MEDIUM) — F-pattern / information scent — m0.2, m2.1, m2.3, m4.2 all hide their highest-leverage sentence in a [warn] that lives below the [case] cards. *Fix: promote the load-bearing sentence into the [save] block at the top of the lesson, leave the [warn] as the reminder.*
- **Save-trigger thresholds are arbitrary.** (LOW) — Nielsen #4 consistency — m2.4 saves on "five of seven fields"; m5.2's third frame triggers the backlog save; m5.3 saves when "all nine sections have any content." Pick a discipline — structural completeness, not field count.

### Pace (joint)

- **M3.5, M5.2, M5.3 are systematically under-timed** by a factor of ~2x. *Fix: relabel honestly, or drop the per-lesson bar (M3.5 to 2 prompts, M5.2 to 2 frames, M5.3 split in two).* The ≤15-min ceiling is part of the brand promise — keep it, but let M5.3 carry a star.
- **M2.1 over-runs the body** (10 stated, 6 honest) — fine, the visuals carry it. M2.2 under-runs the body's cognitive load (12 stated, 14+ honest) — the four-families schema is heavier than the time admits. **Trade time between them.**
- **M3.4's twelve scenarios is one too many** — the engagement curve dips around #8. Nine, grouped as three sets of three by violation type.
- **The seam between M3 and M4 is the steepest content jump in the course.** M3 ends with the learner running prompts in the sandbox; M4 opens with "a skill is your good prompt, saved with the choices locked." That's a clean Bruner step — but it lands behind a paywall. Make the m4.1 lesson openly available as a preview, or place the gate *after* m4.1 instead of before. Currently the learner pays *to find out what M4 even is*.

---

## Top 10 issues, ranked by exam-of-the-course severity

1. **M3.2 cognitive overload** — six constructs, no progressive disclosure. (CRITICAL)
2. **M3.5 / M5.3 are 2× under-timed** for the stated work product. (HIGH)
3. **No enabling objectives anywhere in body_md.** (HIGH)
4. **Knowledge checks skew *Remember*; Apply/Analyze under-represented.** (HIGH)
5. **M1.2 worked-example violation** — the matrix is both lesson and check. (HIGH)
6. **The gate is unforeshadowed** after m0.1's one-line mention. (HIGH)
7. **m1.3 + m5.5 audio without transcript-by-default** — accessibility + skim risk. (MEDIUM)
8. **[warn] cards bury load-bearing sentences below the F-pattern fold.** (MEDIUM)
9. **m5.5 closing names a "Workbench Pack" that M4 doesn't produce.** (MEDIUM)
10. **Spaced retrieval used twice; the rest of the course doesn't compound.** (MEDIUM)

---

## Top 10 opportunities (do-this-next, not nice-to-have)

1. **Add `## Objective` line under every lesson H1.** One sentence, Bloom verb. ~24 lines of writing, course-wide effect.
2. **Split M3.2 into 3.2a/3.2b.** Or kill the diff-highlight and run the levers sequentially. Either way: get below working-memory capacity.
3. **Build a `[save]` template that lifts the load-bearing sentence to the top of every lesson.** Standardise so screenshot-takers are looking at the same shape every time.
4. **Foreshadow the gate three times:** end of M0, end of M2, end of M3.4. Each time, name the three options ("pay, save with email, or take the assessment") and the trade-off.
5. **Re-balance knowledge checks** toward 50/50 Remember-Understand vs Apply-Analyze. Start by rewriting m1.2/Q2 (meta-UI) and adding a third Apply item to m3.1.
6. **Make transcripts default for m1.3 and m5.5.** Audio above, transcript below, no toggle.
7. **Pre-sort one card in M1.2's matrix.** One-line code change to the seed data; saves the lesson's worked-example status.
8. **Re-time honestly:** M3.5 → 2 prompts (3rd stretch), M5.2 → 2 frames, M5.3 → split or 30-min asterisk.
9. **Promote m5.1's editorial-position note** into the body so the oxblood agents card doesn't read as alarmism.
10. **Build spaced-retrieval moments** into M3.4 (re-surface M0.2 anonymisation) and M4.4 (re-surface M1.4 invented-citation pattern). Each is one new question or one new sentence.

---

## Verdict

This is **a well-written, voice-consistent, design-disciplined course that is ~80% of the way to its stated outcome and needs targeted instructional-design strengthening to close the last 20%**. The bones — Wiggins/McTighe backward design from artifact-out, Bruner scaffolding from data discipline through prompting through skills through prototypes, Knowles problem-centred framing throughout — are visibly present. What is missing is the *evidence* tier: enabling objectives, Apply/Analyze checks, spaced retrieval, and honest pacing on the two-to-three lessons that ask more than they admit. Fix M3.2 first (it is the only critical issue), foreshadow the gate next (it is the biggest experience-side surprise), and re-time M3.5 and M5.3 third (they are the lessons most likely to be abandoned mid-flight).

The course's editorial voice is genuinely a competitive asset. Do not flatten it in the name of pedagogical orthodoxy. Add the objectives in the same dry, reassuring tone the body already uses.

— A.K. · R.A.
