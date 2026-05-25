# In-Depth Assessment ($99) — three-persona walk
**Reviewed:** http://localhost:3000/assessment/in-depth · 48-Q + 4-deliverable bundle · 2026-05-24

Three bankers were asked to buy and complete the $99 In-Depth Assessment.
Code paths walked: `content/assessments/v2/questions.ts` (the 48-question
pool), `scoring.ts` + `maturity.ts` (the rubric), `src/app/assessment/in-depth/`
(landing, paywall, take, results), `_lib/derive.ts` (the Briefing
composition), and `_components/InDepthBriefingView.tsx` (the rendered
dossier). The free 12-Q rotation pulls from the same pool, so the In-Depth
is a strict superset, not a different instrument.

A note on the branch context: this is the `addie-v1` worktree, where
the ADDIE rebuild spec calls for **10+ dimensions and 4 deliverables**.
What ships today is **8 dimensions and the Briefing** (one composite
deliverable that internally contains a synthesis, a dimension index,
six deep dives, a regulatory crosswalk, and an 8-row action register).
The personas treat the shipped product as the product — the spec gap
is logged in the synthesis.

---

## Diane Halverson · CRO, Cascade Community Bank ($1.2B)

Diane bought four seats ($396) — one for herself, one for the BSA
officer, one for the credit risk lead, one for the SVP of operations.
She is looking for an instrument that produces an artifact she can put
in front of an FDIC examiner and say "this is how we are calibrating
our AI exposure." She knows from 27 years in banking that examiners
discount marketing collateral and credit instruments that have a stated
rubric and a re-read schedule.

**The buying surface.** The compare table at `/assessment/in-depth`
is honest. She likes that the free scan is presented as the curious
browser's path and the In-Depth as the decision-maker's path —
neither is dressed up. She does not like "board-ready diagnostic" in
the hero. That is a promise. Examiners ask for source documents, not
diagnostics. By the time she gets to the report she will be checking
whether the marketing landed the plane.

**Walking the 48.** She finishes in 19 minutes — well inside the
20-minute claim. Eight beats stand out:

1. **cau-04 (AI tool inventory).** She is looking for the word
   "inventory" and there it is. The 4-point answer reads "current,
   audited AI tool inventory with user-level tracking and access
   controls" — that is the language her exam manual uses.
2. **sp-01.** "Aligned with SR 11-7 and TPRM guidance, reviewed
   regularly." She nods. The instrument knows what governance frame
   community banks operate under. Good.
3. **sp-03 (TPRM overlay).** The 4-point distinguishes a generic TPRM
   process from an AI-specific overlay (model risk, explainability,
   drift). That is the right hill to die on. She marks Cascade at 3.
4. **sp-04 (SR 11-7 MRM inventory).** Realistic. Most community banks
   under $5B have not done this yet, and the rubric does not pretend
   they should be at 4.
5. **sp-06 (fair lending in AI processes).** She likes that ECOA/Reg B
   is named, not hand-waved. But the 4-point standard ("board
   reporting") is at-bank-of-her-size aspirational, not realistic.
6. **lbi-04 (board AI discussion).** Cascade has had two board AI
   discussions but no formal AI governance policy yet. The 3 vs 4
   gap here is exactly the audit finding she's worried about. The
   question surfaces it without being preachy.
7. **all-02 (hallucination literacy).** She circles this one. The
   4-point answer ("can cite banking-specific risks") is the bar she
   would actually hold her staff to. She has not met it.
8. **bp-05 (citizen developer path).** Mid-question doubt: this feels
   IT-leaning for a CRO. She marks Cascade at 2 and moves on, but
   notes that this dimension is going to skew her composite downward
   for reasons she does not own.

**Stress tests.** Refresh on Q23 → sessionStorage rehydrates her
answers correctly via `aibi-assessment-indepth`. Hard tab close + reopen
→ same. Back button → in-flow back works (`goBack`), browser-level back
out of the take page → loses the in-flight state on next mount but
sessionStorage is intact, so re-entering the route restores.
**Mobile.** iPhone Safari, mid-flow → readable, but the role-pick
gate's two-column grid collapses correctly and the radio cards have
adequate tap targets. The role gate icons are decorative SVG with
`aria-hidden` implied by absence — JAWS won't get caught.

### Deliverables, judged for exam-defensibility

**Deliverable 1 — The composite + radar (Chapter 01).** Composite is
honestly computed (`derive.ts/composeScore` sums dimension scores,
normalizes to 0-100, maps to a four-phase rubric: Curious /
Coordinated / Programmatic / Native). The radar is real, not
decorative. **Exam-defensible note:** the instrument's tier function
(`getTierV2`) and the briefing's phase mapping (`phaseForNormalized`)
**use different bands** — the stored `readiness_tier_id` says one
thing, the Briefing displays another. The code admits this in
comments and elects to display the composite-driven phase. From a
control standpoint, having two co-existing scoring methods on the
same record is a finding waiting to happen. She wants one rubric,
one version-controlled document, one displayed value.

**Deliverable 2 — Eight dimensions at a glance (Chapter 02).** Clear,
sourced, and the pillar labels (Strategy / Risk / Stack / Talent)
are useful taxonomy. The "rubric timeline" with "you are here" is
the kind of graphic she can photocopy for the board. **Caveat:** the
pillar assignment is hard-coded in `PILLAR_BY_DIMENSION` with no
documented rationale. Why is `current-ai-usage` "Stack" and
`experimentation-culture` "Strategy"? An examiner will ask. The
methodology page (which would explain) does not exist.

**Deliverable 3 — Six deep dives (Chapter 03).** This is where the
$99 starts to earn its keep. Each dimension has three terrain-keyed
variants (weak / mid / strong) with authored narrative and three
specific 90-day actions. The copy is voice-disciplined: no AI
buzzwords, no "supercharge," banker-direct. The "weak" security-posture
deep-dive recommends "Publish a one-page AI Use Policy in 30 days —
what is allowed, what is not, who approves exceptions" — that is the
language she would write herself. **Exam note:** the recommendations
do not cite specific regulator letters by citation, only by name
in the regulatory frame chapter. The supervisor will want the
crosswalk explicit ("our security posture maps to SR 11-7 §IV.5").
The Briefing gestures at this but does not deliver it.

**Deliverable 4 — Regulatory frame + action register (Chapters 04
+ 05).** The regulatory rows are correctly labeled and the
references are real (SR 11-7, FFIEC IT Handbook, NCUA 24-CU-XX,
FinCEN, CFPB Fair Lending, GLBA Safeguards). **However:** every row
ships with `statusClass: 'part'` and `statusLabel: 'Map yours'` —
hard-coded, identical for every reader. This is a templated table
masquerading as a personal mapping. The chapter copy admits this
("This is the framework — the personal mapping is the work of an
Executive Briefing"), but the visual presentation reads as personal
status. She would call this out as misleading.

The action register, on the other hand, is the page she'd
photocopy. Row 01 is personalized off her weakest dimension (the
`LOWEST_IMPERATIVES` map in `derive.ts`); rows 02–08 are generic but
honestly framed ("the verbs every institution at your phase
carries"). The "open seat" owner on row 01 is a nice touch — it
forces the reader to name a person.

### Is $99 × 4 ($396) earned?

For Cascade — yes, but not for the reason marketing thinks. Diane's
value is not the personalization. It is **the language**. The
instrument gives her four bankers a shared vocabulary
(Curious/Coordinated/Programmatic/Native, Strategy/Risk/Stack/Talent,
the eight named dimensions) and a one-page action register she can
hand the CEO. That is worth $396 of leadership coordination.

She would **not** pay $396 again next year. The instrument is a
snapshot, and the re-read date in the report (90 days) is too short
for an organization that needs longer to move. She would pay $99
for her own re-read in six months and $99 for the SVP of operations,
not the BSA officer or the credit lead.

**What's missing for a CRO:**
- A methodology/scoring document she can show an examiner.
- A version stamp on the rubric (the questions, the scoring bands,
  the phase mapping should each have a date).
- Per-dimension citations to specific regulator language.
- An exportable PDF that does not require a screenshot tool. (The
  Briefing route renders HTML; `pdf-content.ts` exists but is not
  wired into the Briefing view.)

---

## Pat Donovan · IT/InfoSec Director, Lakeside ($680M)

Pat's CEO said "go take this and tell me if our spend on it scales
to the whole IT and ops bench." Pat is technically literate, has a
CISSP, and will read the source code where he can. He is buying $99
of skepticism.

**The buying surface.** First thing he does is open DevTools. The
`/assessment/in-depth` page is `force-dynamic`, server-rendered,
no client JS bundle bloat on the marketing surface. He likes that.
He notices the page reads the signed-in email via `cookies()` and
the Supabase SSR client — that is the right pattern. He logs in,
hits the paywall (`reason=no-purchase`), buys, and lands at
`/assessment/in-depth/take`.

**The take page.** Server component, gates twice: auth, then
entitlement (`findEnrollmentByEmailOrUserId` against
`course_enrollments`). Both checks are server-side. Pat would not
trust client-side gating for a paid product; this is correct.

**Walking the 48 through an IT lens.**

1. **sp-02 (restricted data categories).** The 4-point answer lists
   "PII, NPI, account data, loan files" — he would have added
   prompts, embeddings, and chat logs to the restricted-egress list,
   but the question is asking the right thing for a community bank.
2. **sp-03 (TPRM for AI vendors).** The 4-point answer names "model
   risk, explainability, drift monitoring" — that is the right
   triad. Pat marks Lakeside at 2 honestly.
3. **sp-05 (AI incident reporting).** Good. Most community banks
   have not built a dedicated AI incident path. The question forces
   the gap into the open.
4. **cau-04 (AI tool inventory).** The 4-point ("user-level tracking
   and access controls") is exactly what shadow-AI policy demands.
5. **bp-04 (low-code tools).** Mentions Power Automate, Excel,
   Zapier, Google Sheets. Pat is fine with this — but Zapier on a
   bank network is a TPRM conversation in its own right. The
   question does not flag that.
6. **bp-05 (citizen developer pipeline).** The 4-point answer is
   "structured citizen developer program with governance, security
   review, and a deployment pipeline." Pat is the person who would
   own this and he does not have it.
7. **ti-03 (LMS).** Lakeside has a basic compliance training
   platform. Pat marks 2.
8. **ec-04 (protected learning time).** Realistic question; he
   marks 1 because Lakeside has not done this.

**Source-code spot checks.**

- **Scoring divergence:** Pat finds the two scoring methods in
  `scoring.ts` (`getTierV2` for 12-48, `getTierInDepth` for the raw
  48-192) and the Briefing's third method (`composeScore` →
  `phaseForNormalized`). The code comments admit they do not
  reconcile. For a $99 product whose value is the score, two
  divergent scoring engines on the same record is a quality bug, not
  a feature.
- **`scoreToTier` band math:** `derive.ts` and `maturity.ts`
  normalize differently. `maturity.ts/scoreToTier` uses
  `(score - minScore) / range` (where minScore = maxScore / 4) so
  the bands cover quarters of the achievable range above the floor.
  `derive.ts/normalizeDimension` uses raw `(score / maxScore) * 100`
  and bands at 50/75/90. **These give different answers for the
  same input.** The free flow uses the first, the Briefing the
  second. Pat would file this as a P1.
- **Hard-coded regulatory status:** every reader sees the same
  "Map yours" label on every regulatory row (`REGULATORY_ROWS` is a
  `const` array). The Briefing chapter copy concedes this — but
  the design reads as personalized. Honest framing or honest
  removal: pick one.
- **48-Q rotation:** `selectAllQuestions(questionPool)` shuffles
  the full pool. So the In-Depth is not "the same instrument
  every time" — questions are in random order. For psychometric
  consistency that is fine (order effects randomized); for
  examiner-facing reproducibility, the instrument's order should
  be locked or the order should be recorded with the response.
  Currently `questionIds` are recorded with the submission, so
  reproducibility is preserved. He gives this one a pass.
- **Trust boundary:** the submit handler accepts `{ answers,
  questionIds, role }` from the client. The server recomputes
  score, maxScore, tier, and dimension breakdown server-side
  (this is called out in the InDepthRunner comments). Good.
- **`SKIP_*` flags:** the env-var pattern (SKIP_MAILERLITE,
  SKIP_RESEND) is sound for preview suppression. The hard floor
  in `next.config` that throws when SKIP_MAILERLITE leaks into
  production is the right shape.

### Deliverables, judged for technical accuracy

**Composite + phase.** Honest math. The phase mapping
(<50% Curious, 50-74% Coordinated, 75-89% Programmatic, ≥90% Native)
is documented in the code. He'd want it documented for the user too.

**Dimension index.** The pillar grouping is undocumented (no
methodology source). The eight-axis radar is correctly drawn (he
inspects the SVG; the polygon coordinates are derived from the
percentage scores, not invented).

**Deep dives.** Pat reads his three weakest dimensions. The
security-posture "weak" deep-dive recommends "Build a model and
tool inventory. One row per AI tool: name, vendor, data class,
owner." That is operationally tight. The training-infrastructure
"weak" deep-dive recommends "Record a 30-minute primer and post it
where staff already go (intranet, Teams channel)." Pat respects
that this does not try to sell him an LMS.

**Vendor / TPRM coverage.** This is where the instrument
underperforms. Six questions on security posture but only one
explicitly about vendor TPRM (sp-03), and the deep-dive
recommendations on security posture mention vendor agreements only
in the "strong" variant ("Add an AI clause to the next two vendor
renewals"). The TPRM workflow is the single most expensive piece of
work an IT director will be asked to defend at exam. The
instrument should weight it more.

### Is $99 worth it for Pat?

Marginal. The instrument is honest, the source code is mostly
clean, and the Briefing is well-written. But the $99 buys him an
inventory of what he already knows is missing at Lakeside. There
is no IT-shaped action he didn't already know. The value would be
in **rolling it out to non-IT staff** so they arrive at the next
meeting with shared vocabulary. He would tell his CEO: "Yes, buy
for ops and compliance. No, don't buy more seats for IT."

He would not buy a renewal at $99 every six months. He'd buy a
re-read at $49.

---

## Whitney Goh · Senior Ops Analyst, Heritage FSB ($2.1B)

Whitney spent $99 of her own money. She is 30, Big-4 audit
background, currently the senior analyst in back-office operations.
She is trying to evaluate whether the In-Depth gives her enough
ammunition to walk into her VP's office with a one-pager proposing
an AI-ops initiative.

**The buying surface.** She likes the price honesty ($99 individual,
$79/seat at 10+, by email). She does not like that the "team
checkout is deferred" note is hidden in a code comment, not in the
sales surface. If she liked it for her team, she would have to email
to get a quote. That is fine — but say so.

**Walking the 48 from the ops bench.**

1. **qwp-02.** Specifically names BSA/AML alert narratives, loan
   file checklists, and member correspondence. This is the question
   she has been waiting for. She marks Heritage at 3.
2. **qwp-03 (state of written procedures).** She has had this
   conversation in three jobs. The 4-point ("version-controlled,
   accessible — a solid foundation for AI-assisted improvements")
   is the right standard. Heritage is at 2.
3. **qwp-05 (speed of process change).** "Days to a week for low-risk
   changes." She laughs. Heritage is at 1.
4. **bp-02 (staff-built prompts/templates).** This is the question
   she would not have known to ask. She knows one analyst at
   Heritage who has built a working Excel/ChatGPT BSA narrative
   workflow. The question lifts that out of personal-tool obscurity
   into "this is a recognized dimension." She is going to use this
   exact phrasing in her one-pager.
5. **cau-05 (HITL review process).** Useful. She is responsible for
   half the controls in this question and the instrument's framing
   gives her a vocabulary to talk about it.
6. **ti-02 (measuring behavior change from training).** The Big-4
   audit instinct kicks in. The 4-point ("performance indicators
   tied to training goals") is the standard she would write.
   Heritage is at 1.
7. **ec-06 (piloted in 12 months).** Heritage has not. She marks 1.
8. **all-04 (role-specific use cases).** Mid-question reflection:
   the instrument is asking the staff-readiness question, not the
   role-shaping question. She wants both. The instrument does not
   distinguish "staff can name a use case" from "the institution
   has named which use cases the role should focus on."

**Stress tests.** She refreshes on Q31 → answers preserved. She
opens a second tab and starts again → there is **one shared
sessionStorage key** (`aibi-assessment-indepth`), so opening the
take page in a second tab and answering different questions would
collide. Not a likely user behavior, but worth a fix
(a session-id-keyed sub-key) before scale.

**Mobile.** iPhone in the cafeteria. Readable. The radio buttons
are large enough. The progress bar is visible. The QuestionCard
renders cleanly. She finishes in 22 minutes including two
interruptions. That is real.

### Deliverables, judged for workflow utility

**Chapter 01 — Synthesis.** The "if you only act on one thing"
callout (`thisweek`) is the part she screenshots and pastes into
Slack. The radar visualization is presentation-grade — she would
drop it directly into her one-pager.

**Chapter 02 — Dimensions index.** This is the section she will
actually use. The pillar tagging (Strategy / Risk / Stack / Talent)
gives her a way to frame the conversation for a VP who has not been
thinking about AI: "These are the four buckets, here's where
Heritage scores on each, here's the one that's lowest." That is a
one-pager structure.

**Chapter 03 — Deep dives.** The deep-dive copy for her three
lowest dimensions (`training-infrastructure`, `experimentation-culture`,
`quick-win-potential`) reads as workshop-ready. The "weak"
quick-win-potential recommendation — "Ask each department head:
'What do you do every week that takes more than two hours and feels
mechanical?'" — is the exact ask she will make. She did not know
how to phrase it before today.

**Chapter 04 — Regulatory frame.** Less useful for her — she is
not the audience for SR 11-7 framing in a back-office ops role.
But she recognizes that her VP will respect the table being there.

**Chapter 05 — Action register.** Row 03 ("Name a pilot owner and a
workflow") and row 04 ("Add an AI line item to the next leadership
report") are the rows she will quote in her one-pager. The owners
are mostly C-suite (CFO, CEO, CRO, COO), which is correct framing —
but the register does not give her a row that names an analyst.
A senior ops analyst proposing a pilot is the most common scenario
on the ops bench at $1B–$5B banks; the register should reflect that.

### Is the 90-day plan one-pager-able for her VP?

Yes. The register has eight rows in Now/Next/Later columns with
owners, due dates, effort dots, and pillars. She would extract rows
01, 03, 04, and 05 into a one-pager and walk into the VP's office.

### Is the personal $99 worth it for Whitney?

Yes. For a senior analyst trying to make a case for an internal
initiative, the instrument provides three things she could not have
authored herself in an afternoon: a published rubric to point to,
authored language for each dimension, and a regulatory frame that
preempts the "is this safe?" question. $99 is below her dinner-out
budget and well below the cost of one wasted week proposing the
wrong initiative.

She would not personally renew. She would push her VP to buy a
team rollup ($79 × 12 = $948) at the start of next fiscal year.

---

## Joint synthesis

### What the In-Depth earns

- **Voice.** Banker-direct, McKinsey-tight, no AI buzzwords. The
  deep-dive copy in `derive.ts` is the strongest writing in the
  product. The "weak / mid / strong" terrain variants are not
  identical filler; each is independently authored.
- **Action register.** Row 01 personalization + seven generic rows
  with owners, due weeks, pillars, effort dots, status buckets.
  This is the one page every persona screenshots.
- **Regulatory naming discipline.** SR 11-7, FFIEC IT Handbook,
  NCUA, FinCEN, CFPB, GLBA are correctly cited by name. No
  "FFIEC-aware" violations. The AIEOG Lexicon shows up in the
  starter artifacts.
- **Server-side trust boundary.** Submit handler ignores
  client-computed score and recomputes from `answers + questionIds`.
- **Honest pricing.** No upsell smoke. $99 / $79-at-10+ / one free
  retake / 90-day re-read. The compare table is the buy table —
  no separate pricing block to undercut the comparison.

### What it overclaims

- **"Board-ready diagnostic."** It is a board-readable artifact,
  not a board-ready diagnostic. A diagnostic for a regulated
  institution requires a methodology document, version-stamped
  rubric, and explicit examiner citations. None of those exist
  in the shipped product.
- **"Personalized regulatory mapping."** The regulatory crosswalk
  is templated. The same six rows with the same "Map yours" status
  ship to every reader. The chapter copy admits this; the visual
  presentation does not.
- **"Eight dimensions, each scored."** Honest. But the In-Depth
  rebuild spec on this branch calls for **10+ dimensions**. The
  shipped 8-dimension pool is the existing v2 instrument. The
  ADDIE branch's stated intent (`docs/Foundation-Course-ADDIE/...`)
  is to extend to 10+ dimensions; nothing in `content/assessments/v2/`
  reflects that yet.

### Question-bank quality (8 dimensions × 6 questions each)

- **Construct validity (Messick lens).** Content validity is solid —
  every dimension has six items that triangulate the construct,
  not paraphrase it. Response process is clean (single-select 1-4,
  no double-barrels). Internal structure: the dimensions are
  conceptually distinct, with one exception — `current-ai-usage`
  and `ai-literacy-level` overlap heavily on cau-03/cau-04/cau-05
  vs all-02/all-03 (the "do staff know what they're doing" cluster
  appears in both). Consequential validity is the weakest link —
  the rubric's pillar assignments are not defended anywhere.
- **Anti-gaming.** A determined respondent can absolutely reverse-
  engineer "Ready to Scale" by selecting the longest, most
  buzzword-rich option in each item. The 4-point options
  consistently use the most specific language ("audited," "current,"
  "version-controlled," "documented," "named owner"). For a
  self-assessment, this is fine — there is no incentive to game
  one's own self-report. For a third-party assessment (e.g., an
  examiner asking a board to take it), the gameability would
  matter.
- **Reading level.** Banker-direct. Flesch-Kincaid roughly grade
  10-11. Appropriate.
- **Time-on-task.** 48 questions × ~20-25 seconds = 16-20 minutes.
  The marketing claim of "20 minutes" is honest. All three personas
  finished within the claim.
- **Bloom's hierarchy.** The instrument items are
  Remember/Understand (self-report of current state). The
  deliverables push to Apply (90-day actions) and edge into
  Analyze (the deep-dive narratives). It does not reach Evaluate
  or Create — that is correct for an assessment, not a course.
- **Item bank diversity.** Healthy variety across the six items
  per dimension. No two items in a dimension read as paraphrases
  of each other. `qwp-02` and `cau-05` are the standout items for
  community-bank specificity (BSA/AML, HITL).

### The four deliverables — content audit

(Note: the shipped product packages the four deliverables as
**one Briefing with five chapters**. The personas read those
chapters as the four deliverables — scorecard = Ch 01 + 02,
deep dives = Ch 03, plan = Ch 05, CTAs = the Personalization
Stripe + dashboard return. There is no separate "ideas + prompts"
chapter. The starter artifacts in `content/assessments/v2/starter-artifacts.ts`
are wired to the free assessment flow, not the In-Depth Briefing.)

**Scorecard (Ch 01 + 02).** Honest, dual-band scoring divergence
notwithstanding. The radar + dimension index is the strongest
visual.

**90-day plan (Ch 05 action register).** Eight rows, one
personalized. Actionable per Kotter — there's a coalition
(register owners), urgency (Now bucket), wins (rows 02-03 are
quick), anchoring (row 08 is the 90-day re-read). The plan
clears the Kotter bar for "is this actually a change framework?"
The single biggest miss: no row owned by a working-level
analyst (Whitney's gap).

**Ideas + prompts.** **Missing.** The spec says four
deliverables. The Briefing delivers three (scorecard, deep dives,
plan). There are no banker-specific prompts in the In-Depth
output. The starter artifacts (`starter-artifacts.ts`) contain
prompts, but those are wired to the free-flow `/assessment`
results, not the In-Depth Briefing. This is the single largest
unshipped piece of the $99 product.

**CTAs.** Two: the PersonalizationStripe (recommends a Foundation
course module based on lowest dimension) and the "return to
dashboard" strip. Both are honest. Neither is aggressive. There
is no Calendly popup, no Executive Briefing nag, no "upgrade to
Charter cohort" pitch. The Personalization Stripe specifically
points at the Foundation Course on the lowest dimension, which
is the correct funnel move — but with three caveats: (a) the
Foundation Course is the next product in the funnel, so this is
the up-sell, even if it is the lightest version of it; (b) on
the `addie-v1` branch the Foundation Course is being rebuilt,
so the recommendation may currently point at content that is
about to change; (c) the recommendation rubric is in
`foundation-recommendations.ts`, which the personas did not have
time to audit.

---

## Free → In-Depth → Foundation Course funnel coherence

**Free → In-Depth ($99).** The 12-Q free scan and the 48-Q
In-Depth pull from the same question pool. The free scan gives
you tier + score + one starter artifact. The In-Depth gives you
the same score (well, a different score from a different scoring
function over the same pool) plus the dimension breakdown, the
deep dives, the regulatory frame, and the action register. The
delta is real. The funnel is earned.

**In-Depth → Foundation Course ($295).** The Briefing's
PersonalizationStripe is the funnel mechanism. It is
single-CTA, dimension-keyed, not aggressive. Honest funnel. The
$99 → $295 ladder feels earned because the In-Depth produces a
"you have a literacy gap on dimension X — here is the course
module that closes it" suggestion that traces to data the buyer
just generated. That is the right shape.

**Honest or aggressive?** Honest. There is no in-product
pressure to spend more. The compare table on the landing page is
the most "sales-y" surface and even it is dual-column with the
free option as a real option. The Briefing surface itself has
**one** outbound link (PersonalizationStripe to a Foundation
module). That restraint is the right call.

---

## Top 10 issues

1. **Two scoring engines on the same record** (`getTierV2` 12-48
   band vs `composeScore` 0-100 phase). The stored `readiness_tier`
   and the displayed phase can disagree. Pick one, document it,
   migrate.
2. **Regulatory crosswalk is templated, not personalized.** Same
   six rows, same "Map yours" status, every reader. Either make
   it dimension-driven or move it to the methodology appendix.
3. **No "ideas + prompts" deliverable in the Briefing.** Spec
   calls for four; product ships three. Starter artifacts exist
   but are wired to the free flow.
4. **Methodology document does not exist.** No version-stamped
   rubric, no pillar-assignment defense, no scoring-band
   justification. Examiners will ask.
5. **PDF export is not wired.** `pdf-content.ts` exists; the
   Briefing route does not produce a download. Personas cannot
   put this in front of a board without a screenshot tool.
6. **"Board-ready diagnostic" overclaims.** Reframe as
   "board-readable readiness Briefing" — accurate and still
   compelling.
7. **No analyst-owned row in the action register.** Working-level
   bench is the most common buyer; their voice is missing from
   the plan.
8. **sessionStorage key is global, not per-session.** Opening the
   take page in two tabs corrupts state.
9. **Scoring divergence between `scoreToTier` (maturity.ts,
   floor-anchored quarters) and `normalizeDimension` (derive.ts,
   raw percentage with 50/75/90 thresholds).** Same input,
   different answers. The instrument should not have two scoring
   philosophies.
10. **`current-ai-usage` and `ai-literacy-level` overlap.** Five
    of the twelve items in those two dimensions test the same
    construct in different language. Consider re-binning two
    items.

## Top 10 opportunities

1. **Ship the methodology page.** One PDF: rubric, pillar
   defense, scoring bands, version stamp, citation list.
   Examiner-friendly. Becomes the trust artifact the personas
   asked for.
2. **Wire PDF export.** `pdf-content.ts` is half-built. Finish it,
   ship the Briefing as both HTML and a downloadable PDF.
3. **Ship the "ideas + prompts" chapter.** Five to seven
   community-bank-specific prompts keyed off the reader's three
   weakest dimensions, with the AIEOG / SR 11-7 citation footer.
   This is the single highest-impact addition to the $99 product.
4. **Add a methodology version stamp to the Briefing footer.**
   "Instrument v2.0.1 · 2026-05 · 48 items, 8 dimensions."
5. **Make the regulatory crosswalk dimension-driven.** Each row
   says "your security-posture score of X/24 maps as 'partial' on
   SR 11-7 §IV.5" instead of a templated "Map yours."
6. **Add a working-level row to the action register.** "Analyst:
   surface one workflow, write the proposal." Whitney's gap.
7. **Add a TPRM dimension or rebalance security posture.** Six
   items, one of them on vendor risk, is light for the dimension
   most likely to surface at exam.
8. **Reconcile the two scoring engines.** One stored value, one
   displayed value, one published rubric.
9. **Per-session sessionStorage key.** Trivial change, prevents
   tab-collision corruption.
10. **State the question count and time at the start of the
    take page.** The 20-minute claim is on the marketing surface,
    not the take page. Tell the reader on entry.

---

## Verdict per persona

| Persona | Recommend? | Renew? | Refund? |
|---|---|---|---|
| Diane (CRO, $1.2B) | Yes, for the team-language artifact | Once, at the 6-month mark | No |
| Pat (IT, $680M) | Marginally — for ops and compliance, not IT | No, would buy a $49 re-read | No |
| Whitney (Ops Analyst, $2.1B) | Yes, especially for an analyst building a pilot case | Would push her VP to buy team rollup, not personal renewal | No |

All three would refund only if the regulatory crosswalk's
templating became the basis of an examiner finding. None hit that
threshold today — the chapter copy concedes the framing —
but the visual presentation is the thinnest ice in the product.

### vs. substitutes

- **Coursera AI for Business certificate (~$49/mo, 10-15 hours).**
  Different product. Teaches AI concepts; does not produce a
  bank-specific readiness artifact. The In-Depth wins on
  community-bank fit.
- **ICBA member workshop (variable, often $400-800 + travel).**
  Better for network and live conversation. The In-Depth wins on
  artifact-quality and speed (20 minutes vs a day).
- **Consultant briefing ($5K-$25K).** The consultant produces a
  custom artifact. The In-Depth produces a templated artifact
  with one personalized row. The In-Depth wins on cost-per-banker
  but loses on depth. For a $1B–$2B bank running a coordinated AI
  conversation, the In-Depth at $79/seat for 10 seats is the
  honest mid-tier; the consultant is the next step up.

The In-Depth's defensible positioning: **the artifact a four-to-ten
person leadership team can read in the same week to arrive at a
shared vocabulary**. That is the job it does well. The
"exam-defensible," "board-ready" framing is the marketing trying
to be the consultant. The instrument is the workshop, not the
audit.
